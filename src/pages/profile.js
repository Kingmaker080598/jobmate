// pages/profile.js

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { TextField, Button as MuiButton, Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import ApplicationProfileForm from '@/components/ApplicationProfileForm';

// Futuristic CSS (updated for username field fix)
const futuristicStyles = `
  .futuristic-bg {
    background: linear-gradient(135deg, #0d0d2b 0%, #1a1a4e 50%, #2a1a6e 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 16px;
  }
  .futuristic-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.3), transparent 70%);
    animation: glow 12s infinite ease-in-out;
    z-index: 0;
  }
  @keyframes glow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.1); }
  }
  .futuristic-card {
    background: rgba(229, 231, 235, 0.9); /* Light grayish-blue, semi-transparent */
    border: 1px solid rgba(147, 51, 234, 0.6);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    padding: 32px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 30px rgba(147, 51, 234, 0.4);
  }
  .futuristic-header {
    background: rgba(30, 30, 60, 0.7);
    border: 2px solid transparent;
    border-image: linear-gradient(90deg, #9333ea, #3b82f6) 1;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    padding: 16px;
    box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
    animation: pulse-header 6s infinite ease-in-out;
  }
  @keyframes pulse-header {
    0%, 100% { box-shadow: 0 0 15px rgba(147, 51, 234, 0.5); }
    50% { box-shadow: 0 0 25px rgba(147, 51, 234, 0.8); }
  }
  .futuristic-text {
    color: #1e3a8a; /* Darker text for contrast on light background */
    font-family: 'Orbitron', sans-serif;
    text-shadow: none; /* Removed glow for better readability */
  }
  .futuristic-header-text {
    color: #d4d4ff;
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 8px rgba(147, 51, 234, 0.5);
    animation: glow-text 3s ease-in-out infinite;
  }
  @keyframes glow-text {
    0%, 100% { text-shadow: 0 0 8px rgba(147, 51, 234, 0.5); }
    50% { text-shadow: 0 0 12px rgba(96, 165, 250, 0.8); }
  }
  .futuristic-subtext {
    color: #ffffff;
    text-shadow: 0 0 4px rgba(96, 165, 250, 0.5);
  }
  .futuristic-input {
    background: #ffffff; /* Fully opaque white for clarity */
    border: 1px solid rgba(147, 51, 234, 0.5);
    border-radius: 8px;
    color: #1e3a8a;
    padding: 12px;
    width: 100%;
    font-size: 16px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-input::placeholder {
    color: rgba(107, 114, 128, 0.5);
  }
  .futuristic-input:focus {
    outline: none;
    border-color: #9333ea;
    box-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
  }
  .futuristic-button {
    background: linear-gradient(90deg, #9333ea, #3b82f6);
    border: none;
    border-radius: 8px;
    padding: 12px;
    color: #fff;
    font-weight: 600;
    text-transform: uppercase;
    transition: all 0.3s ease;
  }
  .futuristic-button:hover {
    background: linear-gradient(90deg, #a855f7, #60a5fa);
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.6);
  }
  .futuristic-button:disabled {
    background: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
  .upload-box {
    background: rgba(255, 255, 255, 0.9);
    border: 2px dashed rgba(147, 51, 234, 0.6);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s ease;
  }
  .upload-box:hover {
    border-color: rgba(147, 51, 234, 1);
  }
  .error-text {
    color: #f87171;
    text-shadow: 0 0 3px rgba(248, 113, 113, 0.3);
  }
  .success-text {
    color: #60a5fa;
    text-shadow: 0 0 3px rgba(96, 165, 250, 0.3);
  }
`;

export default function ProfilePage() {
  const { user, profile, fetchUserData } = useUser();
  const [name, setName] = useState(profile?.name || '');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

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
        job_title: file.name,
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

  if (!user) return <Typography className="p-6 futuristic-text">Loading profile...</Typography>;

  return (
    <RequireAuth>
      <style>{futuristicStyles}</style>
      <Navbar />
       <div className="futuristic-bg px-4">
         <div className="max-w-5xl w-full mx-auto py-10">
          <motion.div
            className="futuristic-header text-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              className="futuristic-header-text font-bold"
              style={{
                background: 'linear-gradient(90deg, #9333ea, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Your Career Hub
            </Typography>
            <Typography className="futuristic-subtext mt-2" style={{ fontSize: '1.25rem' }}>
              Manage your profile and resume to land your dream job.
            </Typography>
          </motion.div>

          {message && (
            <Typography
              className={message.includes('Error') ? 'error-text' : 'success-text'}
              style={{ textAlign: 'center', marginBottom: '24px' }}
            >
              {message}
            </Typography>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> 
            {/* Card 1: User Information */}
            <motion.div
              className="futuristic-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h6" className="futuristic-text mb-4 font-semibold">
                Profile Details
              </Typography>
              <TextField
                label="Username"
                fullWidth
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-4"
                InputProps={{ className: 'futuristic-input' }}
                InputLabelProps={{ style: { color: '#6b7280' } }}
                sx={{
                  '& .MuiInput-root': {
                    '&:before': { borderBottom: '1px solid rgba(147, 51, 234, 0.5)' },
                    '&:after': { borderBottom: '2px solid #9333ea' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #9333ea' },
                  },
                }}
              />
              <Typography className="futuristic-subtext mb-2 text-sm">
                Email: {user.email}
              </Typography>
              <Typography className="futuristic-subtext mb-4 text-sm">
                Joined: {new Date(profile?.signup_time).toLocaleDateString()}
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MuiButton
                  className="futuristic-button"
                  onClick={handleUpdateName}
                  disabled={!name}
                >
                  Update Profile
                </MuiButton>
              </motion.div>
            </motion.div>

            {/* Card 2: Resume Upload */}
            <motion.div
              className="futuristic-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h6" className="futuristic-text mb-4 font-semibold">
                Resume Upload
              </Typography>
              <Box className="upload-box mb-4">
                <Typography className="futuristic-subtext text-sm">
                  {fileName || 'Upload your resume (PDF, DOCX, TXT)'}
                </Typography>
              </Box>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MuiButton
                  variant="outlined"
                  component="label"
                  className="futuristic-button mr-4"
                  sx={{ border: 'none' }}
                >
                  Select Resume
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".txt,.docx,.pdf"
                  />
                </MuiButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MuiButton
                  className="futuristic-button"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </MuiButton>
              </motion.div>
            </motion.div>

            {/* Card 3: Auto-Fill Application Details */}
             {/* Full-width Card 3 */}
            <motion.div
                className="futuristic-card sm:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
              <ApplicationProfileForm user={user} />
            </motion.div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}