import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
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
  Activity,
  Save,
  Edit3,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import { Switch, FormControlLabel, Chip, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    github_url: '',
    years_of_experience: '',
    education: '',
    pronouns: '',
    gender: '',
    race_ethnicity: '',
    disability_status: '',
    veteran_status: '',
    work_auth_status: '',
    needs_sponsorship: false,
    willing_to_relocate: false,
    prefers_remote: false,
    expected_salary: ''
  });

  const supportedPlatforms = [
    { name: 'LinkedIn', icon: Building, color: 'blue', pattern: 'linkedin.com', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Indeed', icon: Globe, color: 'green', pattern: 'indeed.com', gradient: 'from-green-500 to-teal-500' },
    { name: 'Glassdoor', icon: Building, color: 'purple', pattern: 'glassdoor.com', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Lever', icon: Target, color: 'orange', pattern: 'lever.co', gradient: 'from-orange-500 to-red-500' },
    { name: 'Greenhouse', icon: Target, color: 'emerald', pattern: 'greenhouse.io', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Workday', icon: Briefcase, color: 'indigo', pattern: 'workday.com', gradient: 'from-indigo-500 to-purple-500' }
  ];

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('application_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
    }
  }, [user]);

  const fetchFillHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('autofill_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setFillHistory(data);
      }
    } catch (error) {
      console.log('Fill history fetch error:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchFillHistory();
  }, [fetchProfile, fetchFillHistory]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('application_profile')
        .upsert({
          ...formData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: ['user_id'] });

      if (error) throw error;

      setProfile(formData);
      setIsEditing(false);
      toast.success('✅ Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const analyzeCurrentPage = async () => {
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFields = [
        { id: 'firstName', label: 'First Name', type: 'text', confidence: 95, value: formData?.first_name || '', icon: User },
        { id: 'lastName', label: 'Last Name', type: 'text', confidence: 95, value: formData?.last_name || '', icon: User },
        { id: 'email', label: 'Email Address', type: 'email', confidence: 98, value: formData?.email || '', icon: Mail },
        { id: 'phone', label: 'Phone Number', type: 'tel', confidence: 90, value: formData?.phone || '', icon: Phone },
        { id: 'location', label: 'Location', type: 'text', confidence: 85, value: formData?.location || '', icon: MapPin },
        { id: 'linkedin', label: 'LinkedIn Profile', type: 'url', confidence: 80, value: formData?.linkedin_url || '', icon: Building },
        { id: 'experience', label: 'Years of Experience', type: 'number', confidence: 75, value: formData?.years_of_experience || '', icon: Briefcase },
        { id: 'coverLetter', label: 'Cover Letter', type: 'textarea', confidence: 70, value: '', icon: Target }
      ];
      
      setDetectedFields(mockFields);
      setPlatformDetected('LinkedIn');
      setCurrentUrl('https://linkedin.com/jobs/apply/123456');
      toast.success('✅ Demo form analyzed! Found ' + mockFields.length + ' fillable fields');
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

      toast.success('🎉 Demo form filled successfully!', { id: 'autofill' });
    } catch (error) {
      toast.error('Autofill failed', { id: 'autofill' });
    }
  };

  const FieldCard = ({ field }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            field.confidence >= 90 ? 'bg-green-100 text-green-600' : 
            field.confidence >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
          }`}>
            <field.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-900">{field.label}</h4>
            <p className="text-sm text-gray-500">Type: {field.type} • ID: {field.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          field.confidence >= 90 ? 'bg-green-100 text-green-700' : 
          field.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {field.confidence}%
        </div>
      </div>
      {field.value && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-mono text-gray-700">
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
      className={`bg-white rounded-lg shadow-md border-2 p-6 cursor-pointer transition-all ${
        platformDetected === platform.name 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${platform.gradient} flex items-center justify-center`}>
          <platform.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900">{platform.name}</h4>
          <p className="text-sm text-gray-500">
            {platformDetected === platform.name ? 'Currently Detected' : 'Supported Platform'}
          </p>
        </div>
      </div>
      {platformDetected === platform.name && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 font-semibold">ACTIVE</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Zap className="w-12 h-12 text-yellow-500" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Smart Autofill
          </h1>
          <Brain className="w-12 h-12 text-purple-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Intelligent form filling that adapts to any job application platform
        </p>
      </motion.div>

      {/* Profile Setup Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-4 text-gray-900">
            <User className="w-8 h-8 text-blue-600" />
            Application Profile Setup
          </h2>
          <div className="flex items-center gap-4">
            {profile && !isEditing && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Profile Complete</span>
              </div>
            )}
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </div>

        {!profile && !isEditing && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup Your Autofill Profile</h3>
            <p className="text-gray-600 mb-6">
              Complete your profile to enable intelligent form filling across job platforms
            </p>
            <motion.button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Setup Profile
            </motion.button>
          </div>
        )}

        {(isEditing || profile) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              
              <TextField
                label="LinkedIn URL"
                value={formData.linkedin_url}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Portfolio URL"
                value={formData.portfolio_url}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Years of Experience"
                value={formData.years_of_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Education"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
              
              <TextField
                label="Expected Salary"
                value={formData.expected_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_salary: e.target.value }))}
                fullWidth
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </div>

            {/* Work Authorization & Preferences */}
            {isEditing && (
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Authorization & Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormControl fullWidth>
                    <InputLabel>Work Authorization Status</InputLabel>
                    <Select
                      value={formData.work_auth_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, work_auth_status: e.target.value }))}
                      label="Work Authorization Status"
                    >
                      <MenuItem value="">Prefer not to say</MenuItem>
                      <MenuItem value="authorized">Authorized to work in the US</MenuItem>
                      <MenuItem value="need_sponsorship">Need sponsorship now</MenuItem>
                      <MenuItem value="future_sponsorship">Need sponsorship in future</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      label="Gender"
                    >
                      <MenuItem value="">Prefer not to say</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Non-binary">Non-binary</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="flex flex-wrap gap-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.willing_to_relocate}
                        onChange={(e) => setFormData(prev => ({ ...prev, willing_to_relocate: e.target.checked }))}
                      />
                    }
                    label="Willing to relocate"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.prefers_remote}
                        onChange={(e) => setFormData(prev => ({ ...prev, prefers_remote: e.target.checked }))}
                      />
                    }
                    label="Prefers remote work"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.needs_sponsorship}
                        onChange={(e) => setFormData(prev => ({ ...prev, needs_sponsorship: e.target.checked }))}
                      />
                    }
                    label="Needs visa sponsorship"
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Platform Support */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-4 text-gray-900">
            <Settings className="w-8 h-8 text-blue-600" />
            Supported Platforms
          </h2>
          <div className="flex items-center gap-4">
            <FormControlLabel
              control={
                <Switch
                  checked={autofillEnabled}
                  onChange={(e) => setAutofillEnabled(e.target.checked)}
                />
              }
              label={
                <span className="text-lg font-semibold text-gray-700">
                  Smart Autofill {autofillEnabled ? 'Enabled' : 'Disabled'}
                </span>
              }
            />
            <div className={`w-3 h-3 rounded-full ${autofillEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedPlatforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </motion.div>

      {/* Page Analysis & Testing */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-8"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-900">
          <Target className="w-8 h-8 text-purple-600" />
          Test Autofill (Demo)
        </h2>

        {!detectedFields.length ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-8 flex items-center justify-center">
              <Globe className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to Test</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Test the autofill functionality with a simulated job application form
            </p>
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-lg text-lg transition-colors"
              onClick={analyzeCurrentPage}
              disabled={isAnalyzing || !profile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Analyzing Demo Form...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  Test Autofill Demo
                </div>
              )}
            </motion.button>
            {!profile && (
              <p className="text-red-600 text-sm mt-4">
                Please complete your profile setup first
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Demo: {platformDetected} Application Form
                </h3>
                <p className="text-gray-600 text-lg">
                  {detectedFields.length} fields detected • {detectedFields.filter(f => f.confidence >= 90).length} high confidence
                </p>
              </div>
              <div className="flex gap-4">
                <motion.button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg border border-gray-300 transition-colors"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  onClick={performAutofill}
                  disabled={!profile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    Fill Demo Form
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
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-900">
          <Activity className="w-8 h-8 text-green-600" />
          Autofill Performance History
        </h2>

        {fillHistory.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No autofill history yet</p>
            <p className="text-gray-400 text-sm">Start using autofill to see your performance metrics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fillHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{entry.platform}</h4>
                      <p className="text-gray-600">
                        {entry.fields_filled} fields filled • {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Success Rate</div>
                      <div className="text-lg font-bold text-green-600">95%</div>
                    </div>
                    <Chip 
                      label={entry.success ? 'Success' : 'Failed'} 
                      color={entry.success ? 'success' : 'error'}
                      variant="outlined"
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