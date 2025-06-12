import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import { motion } from 'framer-motion';
import { Clock, Download, Eye, Sparkles, FileText, Target, Trash2, RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useUser();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('resume_history')
          .select('id, job_title, resume_url, content, file_name, file_type, created_at, tailored, match_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error) setResumes(data || []);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
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
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${resume.job_title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              pre { white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>${resume.job_title}</h1>
            <p><strong>Created:</strong> ${new Date(resume.created_at).toLocaleDateString()}</p>
            ${resume.tailored ? '<p><strong>Type:</strong> AI Tailored Resume</p>' : ''}
            ${resume.match_score ? `<p><strong>Match Score:</strong> ${resume.match_score}%</p>` : ''}
            <hr>
            <pre>${resume.content}</pre>
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

  const handleDelete = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase
        .from('resume_history')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      setResumes(prev => prev.filter(r => r.id !== resumeId));
      alert('✅ Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('❌ Failed to delete resume');
    }
  };

  const useForTailoring = (resume) => {
    if (resume.content) {
      localStorage.setItem('selectedResumeContent', resume.content);
      localStorage.setItem('selectedResumeTitle', resume.job_title);
      window.location.href = '/ai-tailoring';
    } else {
      alert('This resume needs to be processed first. Please re-upload it.');
    }
  };

  if (!user) return <p className="p-6 text-gray-600">Loading resume history...</p>;

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Clock className="w-12 h-12 text-purple-600" />
              <h1 className="text-5xl font-bold text-gray-900">Resume History</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              View, download, and reuse all your previously generated or uploaded resumes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
            >
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-gray-600">Total Resumes</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
            >
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-600">
                {resumes.filter(r => r.tailored).length}
              </div>
              <div className="text-gray-600">AI Tailored</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
            >
              <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-600">
                {resumes.filter(r => r.match_score >= 80).length}
              </div>
              <div className="text-gray-600">High Match Score</div>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 text-lg">Loading your resume history...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Resumes Yet</h3>
              <p className="text-gray-500 text-lg mb-8">
                You haven&apos;t uploaded or generated any resumes yet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/profile">
                  <motion.button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upload Resume
                  </motion.button>
                </Link>
                <Link href="/ai-tailoring">
                  <motion.button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    AI Resume Tailoring
                  </motion.button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          {resume.job_title}
                        </h2>
                        {resume.tailored && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Tailored
                          </span>
                        )}
                        {resume.match_score && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            {resume.match_score}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                        </div>
                        <span>•</span>
                        <span>{resume.file_type || 'Text'}</span>
                        {resume.content && (
                          <>
                            <span>•</span>
                            <span>{resume.content.length} characters</span>
                          </>
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
                      View
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

                    {resume.content && (
                      <motion.button
                        onClick={() => useForTailoring(resume)}
                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Use for AI Tailoring
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => handleDelete(resume.id)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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