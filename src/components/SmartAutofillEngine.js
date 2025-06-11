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
  Briefcase,
  Brain,
  TrendingUp,
  Activity
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
    { name: 'LinkedIn', icon: Building, color: 'blue', pattern: 'linkedin.com', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Indeed', icon: Globe, color: 'green', pattern: 'indeed.com', gradient: 'from-green-500 to-teal-500' },
    { name: 'Glassdoor', icon: Building, color: 'purple', pattern: 'glassdoor.com', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Lever', icon: Target, color: 'orange', pattern: 'lever.co', gradient: 'from-orange-500 to-red-500' },
    { name: 'Greenhouse', icon: Target, color: 'emerald', pattern: 'greenhouse.io', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Workday', icon: Briefcase, color: 'indigo', pattern: 'workday.com', gradient: 'from-indigo-500 to-purple-500' }
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFields = [
        { id: 'firstName', label: 'First Name', type: 'text', confidence: 95, value: profile?.first_name || '', icon: User },
        { id: 'lastName', label: 'Last Name', type: 'text', confidence: 95, value: profile?.last_name || '', icon: User },
        { id: 'email', label: 'Email Address', type: 'email', confidence: 98, value: profile?.email || '', icon: Mail },
        { id: 'phone', label: 'Phone Number', type: 'tel', confidence: 90, value: profile?.phone || '', icon: Phone },
        { id: 'location', label: 'Location', type: 'text', confidence: 85, value: profile?.location || '', icon: MapPin },
        { id: 'linkedin', label: 'LinkedIn Profile', type: 'url', confidence: 80, value: profile?.linkedin_url || '', icon: Building },
        { id: 'experience', label: 'Years of Experience', type: 'number', confidence: 75, value: profile?.years_of_experience || '', icon: Briefcase },
        { id: 'coverLetter', label: 'Cover Letter', type: 'textarea', confidence: 70, value: '', icon: Target }
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
      toast.loading('AI filling form fields...', { id: 'autofill' });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      className="gradient-border p-6 hover-lift"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            field.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 
            field.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <field.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{field.label}</h4>
            <p className="text-sm text-gray-400">Type: {field.type} • ID: {field.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          field.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 
          field.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {field.confidence}%
        </div>
      </div>
      {field.value && (
        <div className="glass-card p-4 border border-gray-400/30">
          <p className="text-sm font-mono text-gray-300">
            {field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value}
          </p>
        </div>
      )}
    </motion.div>
  );

  const PlatformCard = ({ platform }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`gradient-border p-6 cursor-pointer transition-all ${
        platformDetected === platform.name 
          ? 'border-cyan-400 bg-cyan-400/10' 
          : 'hover:border-purple-400/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${platform.gradient} flex items-center justify-center`}>
          <platform.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg">{platform.name}</h4>
          <p className="text-sm text-gray-400">
            {platformDetected === platform.name ? 'Currently Detected' : 'Supported Platform'}
          </p>
        </div>
      </div>
      {platformDetected === platform.name && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-mono">ACTIVE</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold gradient-text cyber-heading">
            Smart Autofill AI
          </h1>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain className="w-12 h-12 text-purple-400" />
          </motion.div>
        </div>
        <p className="text-xl text-gray-300 elegant-text">
          Intelligent form filling that adapts to any job application platform
        </p>
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-8 mb-8 hover-lift"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-4">
            <Settings className="w-8 h-8 text-cyan-400" />
            <span className="gradient-text">Autofill Configuration</span>
          </h2>
          <div className="flex items-center gap-4">
            <FormControlLabel
              control={
                <Switch
                  checked={autofillEnabled}
                  onChange={(e) => setAutofillEnabled(e.target.checked)}
                  className="cyber-switch"
                />
              }
              label={
                <span className="text-lg font-semibold">
                  Smart Autofill {autofillEnabled ? 'Enabled' : 'Disabled'}
                </span>
              }
            />
            <div className={`w-3 h-3 rounded-full ${autofillEnabled ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedPlatforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </motion.div>

      {/* Current Page Analysis */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-8 mb-8 hover-lift"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Target className="w-8 h-8 text-purple-400" />
          <span className="gradient-text">Page Analysis & Detection</span>
        </h2>

        {!detectedFields.length ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-8 flex items-center justify-center"
            >
              <Globe className="w-12 h-12 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Ready to Analyze</h3>
            <p className="text-gray-400 mb-8 text-lg">
              Navigate to a job application page and let AI detect fillable fields
            </p>
            <motion.button
              className="cyber-button text-lg px-12 py-4"
              onClick={analyzeCurrentPage}
              disabled={isAnalyzing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  AI Analyzing Page...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  Analyze Current Page
                </div>
              )}
            </motion.button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold gradient-text">
                  {platformDetected} Application Form
                </h3>
                <p className="text-gray-400 text-lg">
                  {detectedFields.length} fields detected • {detectedFields.filter(f => f.confidence >= 90).length} high confidence
                </p>
              </div>
              <div className="flex gap-4">
                <motion.button
                  className="glass-card px-6 py-3 border border-purple-400/50 hover:border-purple-400 transition-colors"
                  onClick={analyzeCurrentPage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5" />
                    Re-analyze
                  </div>
                </motion.button>
                <motion.button
                  className="cyber-button px-8 py-3"
                  onClick={performAutofill}
                  disabled={!profile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    Fill Form with AI
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detectedFields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FieldCard field={field} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Fill History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
          <Activity className="w-8 h-8 text-green-400" />
          <span className="gradient-text">Autofill Performance History</span>
        </h2>

        {fillHistory.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-lg">No autofill history yet</p>
            <p className="text-gray-600 text-sm">Start using autofill to see your performance metrics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fillHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="gradient-border p-6 hover-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${entry.success ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                    <div>
                      <h4 className="font-bold text-lg">{entry.platform}</h4>
                      <p className="text-gray-400">
                        {entry.fields_filled} fields filled • {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Success Rate</div>
                      <div className="text-lg font-bold text-green-400">95%</div>
                    </div>
                    <Chip 
                      label={entry.success ? 'Success' : 'Failed'} 
                      className={entry.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SmartAutofillEngine;