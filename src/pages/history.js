import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import { motion } from 'framer-motion';
import { Clock, Download, Eye } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function HistoryPage() {
  const { user } = useUser();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('resume_history')
        .select('id, job_title, resume_url, content, file_name, file_type, created_at, tailored, match_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setResumes(data || []);
    };

    fetchData();
  }, [user]);

  const downloadText = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFromUrl = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download file:', err);
      alert('❌ Failed to download file. Please try again.');
    }
  };

  const handleView = (resume) => {
    if (resume.content) {
      // Show content in a modal or new window
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>${resume.job_title}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h1>${resume.job_title}</h1>
            <pre style="white-space: pre-wrap;">${resume.content}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else if (resume.resume_url) {
      const fileExtension = resume.resume_url.split('.').pop().toLowerCase();
      
      if (fileExtension === 'pdf') {
        window.open(resume.resume_url, '_blank');
      } else if (fileExtension === 'docx' || fileExtension === 'doc') {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          resume.resume_url
        )}&embedded=true`;
        window.open(googleViewerUrl, '_blank');
      } else {
        alert('Unsupported file type for preview.');
      }
    } else {
      alert('No resume content available to view.');
    }
  };

  const handleDownload = (resume) => {
    if (resume.content) {
      downloadText(resume.content, resume.job_title.replace(/\s+/g, '_'));
    } else if (resume.resume_url) {
      const filename = resume.file_name || `${resume.job_title.replace(/\s+/g, '_')}.${resume.resume_url.split('.').pop()}`;
      downloadFromUrl(resume.resume_url, filename);
    } else {
      alert('No resume content available to download.');
    }
  };

  if (!user) return <p className="p-6 text-gray-600">Loading resume history...</p>;

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📂 Your Resume History
            </h1>
            <p className="text-gray-600">
              View and download all your previously generated or uploaded resumes.
            </p>
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                You haven&apos;t uploaded or generated any resumes yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Start by uploading your resume or using our AI tailoring tool.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {resumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {resume.job_title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                        </div>
                        {resume.tailored && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            AI Tailored
                          </span>
                        )}
                        {resume.match_score && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {resume.match_score}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      onClick={() => handleView(resume)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      View Resume
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDownload(resume)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </RequireAuth>
  );
}