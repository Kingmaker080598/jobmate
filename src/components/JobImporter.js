import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Linkedin, 
  Globe, 
  Building, 
  RefreshCw, 
  CheckCircle,
  Settings
} from 'lucide-react';
import { Typography, Button, TextField, Switch, FormControlLabel, Chip } from '@mui/material';
import toast from 'react-hot-toast';

const JobImporter = () => {
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState({
    linkedin: 0,
    indeed: 0,
    glassdoor: 0,
    total: 0
  });
  const [searchCriteria, setSearchCriteria] = useState({
    keywords: '',
    location: '',
    experience: '',
    salary: '',
    jobType: '',
    datePosted: '24h'
  });
  const [autoImport, setAutoImport] = useState(false);
  const [importSources, setImportSources] = useState({
    linkedin: true,
    indeed: true,
    glassdoor: true,
    ziprecruiter: false,
    monster: false
  });

  const handleImportJobs = async (source = 'all') => {
    setImporting(true);
    toast.loading('Importing jobs...', { id: 'import' });

    try {
      const response = await fetch('/api/import-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          criteria: searchCriteria,
          sources: importSources
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setImportStats(data.stats);
        toast.success(`Successfully imported ${data.stats.total} jobs!`, { id: 'import' });
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`, { id: 'import' });
    } finally {
      setImporting(false);
    }
  };

  const handleAutoImportToggle = async (enabled) => {
    setAutoImport(enabled);
    
    try {
      const response = await fetch('/api/auto-import-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          criteria: searchCriteria,
          sources: importSources
        })
      });

      if (response.ok) {
        toast.success(`Auto-import ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update auto-import settings');
      }
    } catch (error) {
      console.error('Auto-import error:', error);
      toast.error('Failed to update auto-import settings');
      setAutoImport(!enabled);
    }
  };

  const SourceCard = ({ source, icon: Icon, name, enabled, count }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 transition-all ${
        enabled 
          ? 'border-blue-200 bg-blue-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
          <Typography variant="h6" className="font-semibold">
            {name}
          </Typography>
        </div>
        <Switch
          checked={enabled}
          onChange={(e) => setImportSources(prev => ({
            ...prev,
            [source]: e.target.checked
          }))}
          color="primary"
        />
      </div>
      <div className="flex justify-between items-center">
        <Typography className="text-sm text-gray-600">
          Last import: {count} jobs
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleImportJobs(source)}
          disabled={importing || !enabled}
          startIcon={<Download className="w-4 h-4" />}
        >
          Import
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Job Importer
        </Typography>
        <Typography className="text-gray-600">
          Import jobs from multiple platforms and keep your job board updated automatically
        </Typography>
      </div>

      {/* Search Criteria */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <Typography variant="h6" className="font-semibold mb-4">
          Search Criteria
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            label="Keywords"
            placeholder="e.g., Software Engineer, React"
            value={searchCriteria.keywords}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              keywords: e.target.value
            }))}
            fullWidth
          />
          <TextField
            label="Location"
            placeholder="e.g., San Francisco, Remote"
            value={searchCriteria.location}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              location: e.target.value
            }))}
            fullWidth
          />
          <TextField
            label="Experience Level"
            placeholder="e.g., Entry, Mid, Senior"
            value={searchCriteria.experience}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              experience: e.target.value
            }))}
            fullWidth
          />
          <TextField
            label="Minimum Salary"
            placeholder="e.g., 80000"
            value={searchCriteria.salary}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              salary: e.target.value
            }))}
            fullWidth
          />
          <TextField
            label="Job Type"
            placeholder="e.g., Full-time, Remote"
            value={searchCriteria.jobType}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              jobType: e.target.value
            }))}
            fullWidth
          />
          <TextField
            label="Date Posted"
            placeholder="e.g., 24h, 7d, 30d"
            value={searchCriteria.datePosted}
            onChange={(e) => setSearchCriteria(prev => ({
              ...prev,
              datePosted: e.target.value
            }))}
            fullWidth
          />
        </div>
      </motion.div>

      {/* Import Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-semibold">
            Import Sources
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoImport}
                onChange={(e) => handleAutoImportToggle(e.target.checked)}
                color="primary"
              />
            }
            label="Auto-import (daily)"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SourceCard
            source="linkedin"
            icon={Linkedin}
            name="LinkedIn"
            enabled={importSources.linkedin}
            count={importStats.linkedin}
          />
          <SourceCard
            source="indeed"
            icon={Globe}
            name="Indeed"
            enabled={importSources.indeed}
            count={importStats.indeed}
          />
          <SourceCard
            source="glassdoor"
            icon={Building}
            name="Glassdoor"
            enabled={importSources.glassdoor}
            count={importStats.glassdoor}
          />
          <SourceCard
            source="ziprecruiter"
            icon={Globe}
            name="ZipRecruiter"
            enabled={importSources.ziprecruiter}
            count={0}
          />
          <SourceCard
            source="monster"
            icon={Globe}
            name="Monster"
            enabled={importSources.monster}
            count={0}
          />
        </div>
      </motion.div>

      {/* Import Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-semibold">
            Import Actions
          </Typography>
          <div className="flex items-center gap-2">
            <Chip
              label={`Total: ${importStats.total} jobs`}
              color="primary"
              variant="outlined"
            />
            {autoImport && (
              <Chip
                label="Auto-import ON"
                color="success"
                icon={<CheckCircle className="w-4 h-4" />}
              />
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="contained"
            size="large"
            onClick={() => handleImportJobs('all')}
            disabled={importing}
            startIcon={importing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {importing ? 'Importing...' : 'Import All Sources'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Settings className="w-5 h-5" />}
          >
            Advanced Settings
          </Button>
        </div>
      </motion.div>

      {/* Import Status */}
      {importing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <Typography variant="h6" className="font-semibold mb-4">
            Import Progress
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <Typography>Scanning LinkedIn jobs...</Typography>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <Typography>Scanning Indeed jobs...</Typography>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <Typography>Scanning Glassdoor jobs...</Typography>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JobImporter;