import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Settings, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Typography, Button, Switch, FormControlLabel, Chip, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const AutoApplyDashboard = () => {
  const { user } = useUser();
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    applied: 0,
    failed: 0,
    successRate: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAutoApplyData();
    }
  }, [user]);

  const fetchAutoApplyData = async () => {
    try {
      const [applicationsRes, campaignsRes, settingsRes] = await Promise.all([
        supabase
          .from('auto_apply_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('auto_apply_campaigns')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('auto_apply_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (applicationsRes.data) {
        setApplications(applicationsRes.data);
        calculateStats(applicationsRes.data);
      }

      if (campaignsRes.data) {
        setCampaigns(campaignsRes.data);
      }

      if (settingsRes.data) {
        setAutoApplyEnabled(settingsRes.data.enabled);
      }
    } catch (error) {
      console.error('Error fetching auto-apply data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const total = apps.length;
    const applied = apps.filter(app => app.status === 'applied').length;
    const failed = apps.filter(app => app.status === 'failed').length;
    const pending = apps.filter(app => app.status === 'pending').length;
    const successRate = total > 0 ? Math.round((applied / total) * 100) : 0;

    setStats({ total, applied, failed, pending, successRate });
  };

  const toggleAutoApply = async () => {
    try {
      const newState = !autoApplyEnabled;
      
      const { error } = await supabase
        .from('auto_apply_settings')
        .upsert({
          user_id: user.id,
          enabled: newState,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setAutoApplyEnabled(newState);
      toast.success(`Auto-apply ${newState ? 'enabled' : 'disabled'}`);

      // Start/stop auto-apply service
      await fetch('/api/auto-apply/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, enabled: newState })
      });
    } catch (error) {
      console.error('Error toggling auto-apply:', error);
      toast.error('Failed to update auto-apply settings');
    }
  };

  const createCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('auto_apply_campaigns')
        .insert({
          user_id: user.id,
          name: `Campaign ${campaigns.length + 1}`,
          status: 'active',
          criteria: {
            keywords: '',
            location: '',
            salary_min: 0,
            experience_level: '',
            job_type: ''
          }
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [...prev, data]);
      setSelectedCampaign(data);
      toast.success('Campaign created successfully');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
    >
      <div className="flex items-center justify-between">
        <div>
          <Typography className="text-gray-600 text-sm font-medium">
            {title}
          </Typography>
          <Typography variant="h4" className="font-bold text-gray-900 mt-1">
            {value}
          </Typography>
          {subtitle && (
            <Typography className="text-gray-500 text-sm mt-1">
              {subtitle}
            </Typography>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const ApplicationRow = ({ application }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'applied': return 'success';
        case 'failed': return 'error';
        case 'pending': return 'warning';
        default: return 'default';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'applied': return <CheckCircle className="w-4 h-4" />;
        case 'failed': return <XCircle className="w-4 h-4" />;
        case 'pending': return <Clock className="w-4 h-4" />;
        default: return <AlertTriangle className="w-4 h-4" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-4 border border-gray-200"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Typography variant="h6" className="font-semibold text-gray-900">
              {application.job_title}
            </Typography>
            <Typography className="text-gray-600 text-sm">
              {application.company} • {application.location}
            </Typography>
            <Typography className="text-gray-500 text-xs mt-1">
              Applied: {new Date(application.created_at).toLocaleDateString()}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              label={application.status}
              color={getStatusColor(application.status)}
              size="small"
              icon={getStatusIcon(application.status)}
            />
          </div>
        </div>
        {application.error_message && (
          <div className="mt-3 p-2 bg-red-50 rounded text-red-700 text-sm">
            {application.error_message}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h4" className="font-bold text-gray-900">
                Auto-Apply Dashboard
              </Typography>
              <Typography className="text-gray-600 mt-1">
                Automate your job applications with AI-powered precision
              </Typography>
            </div>
            <div className="flex items-center gap-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoApplyEnabled}
                    onChange={toggleAutoApply}
                    color="primary"
                  />
                }
                label="Auto-Apply Enabled"
              />
              <Button
                variant="contained"
                startIcon={<Target className="w-4 h-4" />}
                onClick={createCampaign}
                className="bg-blue-600 hover:bg-blue-700"
              >
                New Campaign
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Total Applications"
            value={stats.total}
            subtitle="All time"
          />
          <StatCard
            icon={CheckCircle}
            title="Successfully Applied"
            value={stats.applied}
            subtitle={`${stats.successRate}% success rate`}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            subtitle="In queue"
            color="yellow"
          />
          <StatCard
            icon={XCircle}
            title="Failed"
            value={stats.failed}
            subtitle="Needs attention"
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <Typography variant="h6" className="font-semibold mb-4">
              Application Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <Typography variant="h6" className="font-semibold mb-4">
              Success Rate by Platform
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successRate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h6" className="font-semibold">
              Recent Applications
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Filter className="w-4 h-4" />}
            >
              Filter
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                No applications yet
              </Typography>
              <Typography className="text-gray-400">
                Enable auto-apply to start submitting applications automatically
              </Typography>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 10).map((application) => (
                <ApplicationRow key={application.id} application={application} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AutoApplyDashboard;