import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import JobBoard from '@/components/JobBoard';
import JobImporter from '@/components/JobImporter';
import { motion } from 'framer-motion';
import { Typography, Tabs, Tab, Box } from '@mui/material';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Typography variant="h4" className="font-bold text-gray-900 mb-4">
              Job Search Hub
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Browse Jobs" />
              <Tab label="Import Jobs" />
            </Tabs>
          </div>
        </div>

        <Box hidden={activeTab !== 0}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <JobBoard />
          </motion.div>
        </Box>

        <Box hidden={activeTab !== 1}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <JobImporter />
          </motion.div>
        </Box>
      </div>
    </RequireAuth>
  );
}