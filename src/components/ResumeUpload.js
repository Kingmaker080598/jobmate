// components/ResumeUpload.js

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Typography, Button as MuiButton, Box } from '@mui/material';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    console.log('📁 File selected:', selectedFile);
  
    if (!selectedFile) {
      setMessage('No file selected.');
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setMessage('Invalid file type. Please upload a PDF or Word document.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage(`Selected: ${selectedFile.name}`);
  };

  const handleUpload = async () => {
    console.log('✅ Upload button clicked'); // <- log this first
  
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
  
    setUploading(true);
    setMessage('Uploading...');
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('AUTH user:', user); // Debug log
  
      if (authError || !user) {
        throw new Error('You must be logged in to upload a resume.');
      }
  
      const userId = user.id;
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const timestamp = Date.now();
      const filePath = `${userId}/${timestamp}_${sanitizedName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: false });
  
      if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
  
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
  
      console.log('Public URL:', publicUrl); // Debug log
  
      const { error: insertError } = await supabase.from('resume_history').insert({
        user_id: userId,
        job_title: file.name,
        resume_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      });
  
      if (insertError) {
        console.error('DB Insert Error:', insertError); // Debug log
        throw new Error(`DB insert failed: ${insertError.message}`);
      }
  
      setMessage('Resume uploaded and recorded in history!');
      setFile(null);
    } catch (err) {
      console.error('FINAL ERROR:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  

  return (
    <div className="p-6">
      <motion.div
        className="futuristic-card max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h6" className="futuristic-text mb-4 font-semibold">
          Upload Your Resume
        </Typography>
        <Box className="space-y-4">
          <div>
            <Typography className="futuristic-text text-sm mb-2">
              Select Resume (.pdf, .docx)
            </Typography>
            <input
              type="file"
              accept=".pdf,.docx"
              className="futuristic-input"
              onChange={handleFileChange}
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MuiButton
              className="futuristic-button w-full flex items-center gap-2"
              onClick={handleUpload}
              // disabled={uploading || !file}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </MuiButton>
          </motion.div>
          {message && (
            <Typography
              className={message.includes('Error') ? 'error-text' : 'futuristic-text'}
              style={{ fontSize: '0.875rem' }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </motion.div>
    </div>
  );
}