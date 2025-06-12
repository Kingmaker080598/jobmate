import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { TextField, Button as MuiButton, Box, Typography } from '@mui/material';
import { Upload, User, Mail, Calendar, Edit3, Save, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, profile, fetchUserData } = useUser();
  const [name, setName] = useState(profile?.name || '');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [resumeStats, setResumeStats] = useState({ total: 0, tailored: 0 });

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    fetchResumeStats();
  }, [profile]);

  const fetchResumeStats = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('resume_history')
        .select('id, tailored')
        .eq('user_id', user.id);

      if (data) {
        setResumeStats({
          total: data.length,
          tailored: data.filter(r => r.tailored).length
        });
      }
    } catch (error) {
      console.error('Error fetching resume stats:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!name || !user) {
      setMessage('Please enter a username.');
      return;
    }
    setMessage('');
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id);
    if (error) {
      setMessage('Failed to update username.');
      console.error('Update error:', error);
      return;
    }
    fetchUserData();
    triggerConfetti();
    setMessage('Username updated successfully!');
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) {
      setMessage('No file selected.');
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!validTypes.includes(uploaded.type)) {
      setMessage('Invalid file type. Please upload a PDF, DOCX, or TXT.');
      setFile(null);
      setFileName('');
      return;
    }

    setFile(uploaded);
    setFileName(uploaded.name);
    setMessage(`Selected: ${uploaded.name}`);
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setMessage('Please select a file.');
      return;
    }

    setUploading(true);
    setMessage('Uploading resume...');

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      if (urlError || !urlData.publicUrl) {
        throw new Error('Could not generate public URL.');
      }

      const { error: insertError } = await supabase.from('resume_history').insert({
        user_id: user.id,
        job_title: file.name.replace(/\.[^/.]+$/, ''),
        resume_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Could not save resume metadata to database.');
      }

      setMessage('Resume uploaded successfully!');
      setFile(null);
      setFileName('');
      fetchResumeStats();
      triggerConfetti();
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#9333ea', '#3b82f6', '#60a5fa'],
      origin: { y: 0.6 },
    });
  };

  if (!user) return <Typography className="p-6 text-gray-600">Loading profile...</Typography>;

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <User className="w-12 h-12 text-blue-600" />
              <h1 className="text-5xl font-bold text-gray-900">Your Profile</h1>
            </div>
            <p className="text-xl text-gray-600">
              Manage your personal information and resume uploads
            </p>
          </motion.div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.includes('Error') || message.includes('Failed')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <motion.button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {(profile?.name || user.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {profile?.name || 'Set your name'}
                    </h3>
                    <p className="text-gray-600">JobMate User</p>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        fullWidth
                        variant="outlined"
                      />
                      <motion.button
                        onClick={handleUpdateName}
                        disabled={!name}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900">{profile?.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                  </div>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(profile?.signup_time || user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Resumes</span>
                    <span className="text-2xl font-bold text-blue-600">{resumeStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AI Tailored</span>
                    <span className="text-2xl font-bold text-purple-600">{resumeStats.tailored}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">94%</span>
                  </div>
                </div>
              </div>

              {/* Resume Upload Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    {fileName || 'Upload your resume (PDF, DOCX, TXT)'}
                  </p>
                  
                  <div className="space-y-3">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".txt,.docx,.pdf,.doc"
                      />
                    </label>
                    
                    {file && (
                      <motion.button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <motion.a
                    href="/autofill"
                    className="block w-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg transition-colors text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Setup Auto-fill Profile
                  </motion.a>
                  <motion.a
                    href="/history"
                    className="block w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 px-4 py-3 rounded-lg transition-colors text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Resume History
                  </motion.a>
                  <motion.a
                    href="/ai-tailoring"
                    className="block w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg transition-colors text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    AI Resume Tailoring
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}