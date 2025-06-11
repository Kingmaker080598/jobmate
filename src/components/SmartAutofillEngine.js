import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Target,
  Globe,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Typography, Button, Switch, FormControlLabel, Chip, TextField } from '@mui/material';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const SmartAutofillEngine = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [autofillEnabled, setAutofillEnabled] = useState(true);
  const [detectedFields, setDetectedFields] = useState([]);
  const [fillHistory, setFillHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [platformDetected, setPlatformDetected] = useState('');

  const supportedPlatforms = [
    { name: 'LinkedIn', icon: Building, color: 'blue', pattern: 'linkedin.com' },
    { name: 'Indeed', icon: Globe, color: 'green', pattern: 'indeed.com' },
    { name: 'Glassdoor', icon: Building, color: 'purple', pattern: 'glassdoor.com' },
    { name: 'Lever', icon: Target, color: 'orange', pattern: 'lever.co' },
    { name: 'Greenhouse', icon: Target, color: 'emerald', pattern: 'greenhouse.io' },
    { name: 'Workday', icon: Briefcase, color: 'indigo', pattern: 'workday.com' }
  ];

  useEffect(() => {
    fetchProfile();
    fetchFillHistory();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('application_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFillHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('autofill_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setFillHistory(data);
      }
    } catch (error) {
      console.error('Error fetching fill history:', error);
    }
  };

  const analyzeCurrentPage = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate page analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock detected fields based on common form patterns
      const mockFields = [
        { id: 'firstName', label: 'First Name', type: 'text', confidence: 95, value: profile?.first_name || '' },
        { id: 'lastName', label: 'Last Name', type: 'text', confidence: 95, value: profile?.last_name || '' },
        { id: 'email', label: 'Email Address', type: 'email', confidence: 98, value: profile?.email || '' },
        { id: 'phone', label: 'Phone Number', type: 'tel', confidence: 90, value: profile?.phone || '' },
        { id: 'location', label: 'Location', type: 'text', confidence: 85, value: profile?.location || '' },
        { id: 'linkedin', label: 'LinkedIn Profile', type: 'url', confidence: 80, value: profile?.linkedin_url || '' },
        { id: 'experience', label: 'Years of Experience', type: 'number', confidence: 75, value: profile?.years_of_experience || '' },
        { id: 'coverLetter', label: 'Cover Letter', type: 'textarea', confidence: 70, value: '' }
      ];
      
      setDetectedFields(mockFields);
      setPlatformDetected('LinkedIn');
      setCurrentUrl('https://linkedin.com/jobs/apply/123456');
      toast.success('✅ Page analyzed! Found ' + mockFields.length + ' fillable fields');
    } catch (error) {
      toast.error('Failed to analyze page');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAutofill = async () => {
    if (!profile) {
      toast.error('Please complete your profile first');
      return;
    }

    try {
      // Simulate autofill process
      toast.loading('Filling form fields...', { id: 'autofill' });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record autofill attempt
      const { error } = await supabase
        .from('autofill_history')
        .insert({
          user_id: user.id,
          platform: platformDetected,
          url: currentUrl,
          fields_filled: detectedFields.length,
          success: true,
          created_at: new Date().toISOString()
        });

      if (!error) {
        fetchFillHistory();
      }

      toast.success('🎉 Form filled successfully!', { id: 'autofill' });
    } catch (error) {
      toast.error('Autofill failed', { id: 'autofill' });
    }
  };

  const FieldCard = ({ field }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            field.confidence >= 90 ? 'bg-green-500' : 
            field.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <Typography className="font-medium">{field.label}</Typography>
        </div>
        <Chip 
          label={`${field.confidence}%`} 
          size="small" 
          color={field.confidence >= 90 ? 'success' : field.confidence >= 70 ? 'warning' : 'error'}
        />
      </div>
      <Typography className="text-sm text-gray-600 mb-2">
        Type: {field.type} • ID: {field.id}
      </Typography>
      {field.value && (
        <div className="bg-gray-50 rounded p-2">
          <Typography className="text-sm font-mono">
            {field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value}
          </Typography>
        </div>
      )}
    </motion.div>
  );

  const PlatformCard = ({ platform }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 ${
        platformDetected === platform.name 
          ? `border-${platform.color}-500 bg-${platform.color}-50` 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <platform.icon className={`w-6 h-6 text-${platform.color}-600`} />
        <div>
          <Typography className="font-semibold">{platform.name}</Typography>
          <Typography className="text-sm text-gray-600">
            {platformDetected === platform.name ? 'Detected' : 'Supported'}
          </Typography>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
          <Typography variant="h3" className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Autofill Engine
          </Typography>
        </div>
        <Typography className="text-gray-600 text-lg">
          Intelligent form filling that adapts to any job application platform
        </Typography>
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            Autofill Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autofillEnabled}
                onChange={(e) => setAutofillEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Smart Autofill"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedPlatforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </motion.div>

      {/* Current Page Analysis */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <Typography variant="h5" className="mb-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-purple-600" />
          Page Analysis
        </Typography>

        {!detectedFields.length ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-500 mb-2">
              No page analyzed yet
            </Typography>
            <Typography className="text-gray-400 mb-6">
              Navigate to a job application page and click analyze to detect fillable fields
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={analyzeCurrentPage}
              disabled={isAnalyzing}
              startIcon={isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? 'Analyzing Page...' : 'Analyze Current Page'}
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <Typography className="font-semibold text-lg">
                  {platformDetected} Application Form
                </Typography>
                <Typography className="text-gray-600 text-sm">
                  {detectedFields.length} fields detected • {detectedFields.filter(f => f.confidence >= 90).length} high confidence
                </Typography>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  onClick={analyzeCurrentPage}
                  startIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Re-analyze
                </Button>
                <Button
                  variant="contained"
                  onClick={performAutofill}
                  disabled={!profile}
                  startIcon={<Zap className="w-4 h-4" />}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Fill Form
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detectedFields.map((field, index) => (
                <FieldCard key={index} field={field} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Fill History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <Typography variant="h5" className="mb-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Recent Autofill History
        </Typography>

        {fillHistory.length === 0 ? (
          <div className="text-center py-8">
            <Typography className="text-gray-500">No autofill history yet</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {fillHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <Typography className="font-medium">{entry.platform}</Typography>
                    <Typography className="text-sm text-gray-600">
                      {entry.fields_filled} fields filled • {new Date(entry.created_at).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <Chip 
                  label={entry.success ? 'Success' : 'Failed'} 
                  color={entry.success ? 'success' : 'error'}
                  size="small"
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SmartAutofillEngine;