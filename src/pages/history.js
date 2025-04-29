import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [convertingId, setConvertingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      setUser(session.user);

      const { data, error } = await supabase
        .from('resume_history')
        .select('id, job_title, resume_url, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) setResumes(data || []);
    };

    fetchData();
  }, []);

  const downloadFile = async (
    url,
    filename,
    targetFormat = 'original',
    resumeId = null
  ) => {
    const ext = url.split('.').pop().toLowerCase();

    if (targetFormat === 'original') {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${filename}.${ext}`; // Add the extension to filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Failed to download file:', err);
        alert('❌ Failed to download file. Please try again.');
      }
      return;
    }

    // Handle PDF to DOCX and DOCX to PDF conversions
    try {
      const cacheKey = `converted_${targetFormat}_${resumeId}`;
      const cachedUrl = localStorage.getItem(cacheKey);

      if (cachedUrl) {
        const a = document.createElement('a');
        a.href = cachedUrl;
        a.download = `${filename}.${targetFormat}`;
        a.click();
        return;
      }

      setConvertingId(resumeId);

      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docxUrl: url,
          outputFileName: filename,
          targetFormat: targetFormat, // Add this parameter
        }),
      });

      if (!res.ok) throw new Error('Conversion failed.');

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      localStorage.setItem(cacheKey, blobUrl);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.${targetFormat}`;
      a.click();
    } catch (err) {
      alert(`❌ Failed to convert and download ${targetFormat.toUpperCase()}.`);
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  const handleView = (url) => {
    if (!url) {
      alert('No resume available to view.');
      return;
    }

    const fileExtension = url.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
      window.open(url, '_blank');
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        url
      )}&embedded=true`;
      window.open(googleViewerUrl, '_blank');
    } else {
      alert('Unsupported file type for preview.');
    }
  };

  if (!user) return <p className="p-6 text-white">Loading resume history...</p>;

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-indigo-950 text-white px-6 py-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            📂 Your Resume History
          </h1>
          <p className="text-gray-400">
            View and download all your previously generated or uploaded resumes.
          </p>
        </motion.div>

        {resumes.length === 0 ? (
          <p className="text-center text-gray-400">
            You haven&apos;t tailored or uploaded any resumes yet.
          </p>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {resumes.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-white">
                    {r.job_title}
                  </h2>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleView(r.resume_url)}
                    className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white transition"
                  >
                    View Resume
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        r.resume_url,
                        r.job_title.replace(/\s+/g, '_'),
                        'pdf',
                        r.id
                      )
                    }
                    className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white transition"
                  >
                    Download PDF
                  </button>
                </div>

                {convertingId === r.id && (
                  <p className="text-sm text-yellow-300 mt-2">
                    🔄 Converting DOCX to PDF...
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
