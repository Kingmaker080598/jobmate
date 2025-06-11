import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  ExternalLink,
  Heart,
  Send,
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Star
} from 'lucide-react';
import { Typography, Button, Chip, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import toast from 'react-hot-toast';

const JobBoard = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserJobData = async () => {
    if (!user) return;

    try {
      const [savedResponse, appliedResponse] = await Promise.all([
        supabase.from('saved_jobs').select('job_id').eq('user_id', user.id),
        supabase.from('job_applications').select('job_id').eq('user_id', user.id)
      ]);

      if (savedResponse.data) {
        setSavedJobs(new Set(savedResponse.data.map(item => item.job_id)));
      }
      if (appliedResponse.data) {
        setAppliedJobs(new Set(appliedResponse.data.map(item => item.job_id)));
      }
    } catch (error) {
      console.error('Error fetching user job data:', error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (salaryFilter) {
      filtered = filtered.filter(job => {
        const salary = parseInt(job.salary_min || 0);
        switch (salaryFilter) {
          case '50k': return salary >= 50000;
          case '75k': return salary >= 75000;
          case '100k': return salary >= 100000;
          case '150k': return salary >= 150000;
          default: return true;
        }
      });
    }

    if (experienceFilter) {
      filtered = filtered.filter(job => 
        job.experience_level === experienceFilter
      );
    }

    if (jobTypeFilter) {
      filtered = filtered.filter(job => 
        job.job_type === jobTypeFilter
      );
    }

    setFilteredJobs(filtered);
  };

  useEffect(() => {
    fetchJobs();
    fetchUserJobData();
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, locationFilter, salaryFilter, experienceFilter, jobTypeFilter]);

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Job removed from saved');
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: jobId });
        
        setSavedJobs(prev => new Set(prev).add(jobId));
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleQuickApply = async (job) => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }

    try {
      // Check if already applied
      if (appliedJobs.has(job.id)) {
        toast.error('You have already applied to this job');
        return;
      }

      // Get user profile for auto-fill
      const { data: profile } = await supabase
        .from('application_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error('Please complete your profile first');
        return;
      }

      // Record application
      await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          status: 'applied',
          applied_at: new Date().toISOString()
        });

      setAppliedJobs(prev => new Set(prev).add(job.id));
      toast.success('Application submitted successfully!');

      // Trigger auto-apply if external URL exists
      if (job.external_url) {
        await triggerAutoApply(job, profile);
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    }
  };

  const triggerAutoApply = async (job, profile) => {
    try {
      const response = await fetch('/api/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, profile })
      });

      if (response.ok) {
        toast.success('Auto-apply initiated in background');
      }
    } catch (error) {
      console.error('Auto-apply error:', error);
    }
  };

  const JobCard = ({ job }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedJob(job)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building className="w-4 h-4" />
            <span className="font-medium">{job.company}</span>
            {job.company_rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{job.company_rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.job_type}</span>
            </div>
            {job.salary_min && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${job.salary_min.toLocaleString()}{job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : '+'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveJob(job.id);
            }}
            className={`p-2 rounded-full transition-colors ${
              savedJobs.has(job.id) 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills && job.skills.slice(0, 3).map((skill, index) => (
          <Chip key={index} label={skill} size="small" variant="outlined" />
        ))}
        {job.skills && job.skills.length > 3 && (
          <Chip label={`+${job.skills.length - 3} more`} size="small" variant="outlined" />
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
          {job.applicant_count && (
            <>
              <Users className="w-4 h-4 ml-2" />
              <span>{job.applicant_count} applicants</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {appliedJobs.has(job.id) ? (
            <Chip label="Applied" color="success" size="small" />
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<Send className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickApply(job);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Quick Apply
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const JobDetailModal = ({ job, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span className="text-lg font-medium">{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Heart className="w-4 h-4" />}
                onClick={() => handleSaveJob(job.id)}
                className={savedJobs.has(job.id) ? 'text-red-600 border-red-600' : ''}
              >
                {savedJobs.has(job.id) ? 'Saved' : 'Save'}
              </Button>
              {job.external_url && (
                <Button
                  variant="outlined"
                  startIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => window.open(job.external_url, '_blank')}
                >
                  View Original
                </Button>
              )}
              {appliedJobs.has(job.id) ? (
                <Button variant="contained" disabled>
                  Applied
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Send className="w-4 h-4" />}
                  onClick={() => handleQuickApply(job)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Quick Apply
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Job Type</h4>
              <p className="text-gray-700">{job.job_type}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
              <p className="text-gray-700">{job.experience_level}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Salary</h4>
              <p className="text-gray-700">
                {job.salary_min ? `$${job.salary_min.toLocaleString()}${job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : '+'}` : 'Not specified'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
            <div className="prose max-w-none text-gray-700">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          {job.requirements && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.skills && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Chip key={index} label={skill} variant="outlined" />
                ))}
              </div>
            </div>
          )}

          {job.benefits && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <TextField
                fullWidth
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search className="w-5 h-5 text-gray-400 mr-2" />
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <TextField
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                size="small"
                className="min-w-[150px]"
              />
              <FormControl size="small" className="min-w-[120px]">
                <InputLabel>Salary</InputLabel>
                <Select
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  label="Salary"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="50k">$50k+</MenuItem>
                  <MenuItem value="75k">$75k+</MenuItem>
                  <MenuItem value="100k">$100k+</MenuItem>
                  <MenuItem value="150k">$150k+</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="min-w-[120px]">
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  label="Experience"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Entry">Entry Level</MenuItem>
                  <MenuItem value="Mid">Mid Level</MenuItem>
                  <MenuItem value="Senior">Senior Level</MenuItem>
                  <MenuItem value="Lead">Lead/Principal</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="min-w-[120px]">
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="font-bold text-gray-900">
            {filteredJobs.length} Jobs Found
          </Typography>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by relevance</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Typography variant="h6" className="text-gray-500 mb-2">
              No jobs found
            </Typography>
            <Typography className="text-gray-400">
              Try adjusting your search criteria
            </Typography>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobBoard;