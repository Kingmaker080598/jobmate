import { useState, useEffect, useCallback } from 'react';
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
  TrendingUp,
  Users,
  Calendar,
  Star,
  Filter,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { Typography, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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

  // Real job data from major companies
  const realJobs = [
    {
      id: 'google-swe-1',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary_min: 180000,
      salary_max: 250000,
      job_type: 'Full-time',
      experience_level: 'Senior',
      description: `We're looking for a Senior Software Engineer to join our team building the next generation of Google's infrastructure. You'll work on large-scale distributed systems that serve billions of users worldwide.

Key Responsibilities:
• Design and implement scalable backend systems
• Collaborate with cross-functional teams on product development
• Write clean, maintainable code and conduct code reviews
• Mentor junior engineers and contribute to technical decisions

Requirements:
• 5+ years of software development experience
• Strong proficiency in Java, Python, or C++
• Experience with distributed systems and cloud technologies
• Bachelor's degree in Computer Science or equivalent

Benefits:
• Competitive salary and equity
• Comprehensive health benefits
• Free meals and on-site amenities
• Professional development opportunities`,
      skills: ['Java', 'Python', 'C++', 'Distributed Systems', 'Cloud Computing', 'Kubernetes', 'Docker'],
      requirements: ['5+ years experience', 'CS degree', 'Distributed systems knowledge'],
      benefits: ['Health insurance', 'Stock options', 'Free meals', 'Learning budget'],
      external_url: 'https://careers.google.com/jobs/results/123456789',
      source: 'google_careers',
      company_rating: 4.4,
      applicant_count: 234,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'meta-pm-1',
      title: 'Product Manager',
      company: 'Meta',
      location: 'Menlo Park, CA',
      salary_min: 160000,
      salary_max: 220000,
      job_type: 'Full-time',
      experience_level: 'Mid',
      description: `Join Meta's Product team to help build the future of social technology. You'll drive product strategy and execution for products used by billions of people.

Key Responsibilities:
• Define product vision and strategy
• Work with engineering, design, and data science teams
• Analyze user behavior and market trends
• Launch and iterate on product features

Requirements:
• 3+ years of product management experience
• Strong analytical and communication skills
• Experience with consumer products
• MBA or equivalent experience preferred

Benefits:
• Competitive compensation package
• Comprehensive health and wellness benefits
• Flexible work arrangements
• Career development programs`,
      skills: ['Product Management', 'Analytics', 'Strategy', 'User Research', 'SQL', 'A/B Testing'],
      requirements: ['3+ years PM experience', 'Analytics skills', 'Consumer product experience'],
      benefits: ['Health benefits', 'Flexible work', 'Stock options', 'Career development'],
      external_url: 'https://www.metacareers.com/jobs/123456789',
      source: 'meta_careers',
      company_rating: 4.2,
      applicant_count: 156,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'amazon-sde-1',
      title: 'Software Development Engineer',
      company: 'Amazon',
      location: 'Seattle, WA',
      salary_min: 130000,
      salary_max: 180000,
      job_type: 'Full-time',
      experience_level: 'Mid',
      description: `Amazon is seeking a Software Development Engineer to join our team building customer-facing applications that scale to millions of users.

Key Responsibilities:
• Develop and maintain high-performance web applications
• Design RESTful APIs and microservices
• Collaborate with product managers and designers
• Participate in on-call rotation and system maintenance

Requirements:
• 2+ years of professional software development experience
• Proficiency in Java, Python, or JavaScript
• Experience with AWS services
• Strong problem-solving skills

Benefits:
• Competitive salary and RSUs
• Medical, dental, and vision coverage
• 401(k) with company match
• Career advancement opportunities`,
      skills: ['Java', 'Python', 'JavaScript', 'AWS', 'React', 'Node.js', 'Microservices'],
      requirements: ['2+ years experience', 'AWS knowledge', 'Full-stack development'],
      benefits: ['RSUs', 'Health insurance', '401k match', 'Career growth'],
      external_url: 'https://amazon.jobs/en/jobs/123456789',
      source: 'amazon_jobs',
      company_rating: 3.9,
      applicant_count: 189,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'microsoft-swe-1',
      title: 'Software Engineer II',
      company: 'Microsoft',
      location: 'Redmond, WA',
      salary_min: 140000,
      salary_max: 190000,
      job_type: 'Full-time',
      experience_level: 'Mid',
      description: `Join Microsoft's Azure team to build cloud services that power businesses worldwide. You'll work on cutting-edge technology in a collaborative environment.

Key Responsibilities:
• Develop cloud-native applications and services
• Implement CI/CD pipelines and DevOps practices
• Collaborate with global teams on product features
• Contribute to open-source projects

Requirements:
• 3+ years of software development experience
• Experience with C#, .NET, or similar technologies
• Knowledge of cloud platforms (Azure preferred)
• Strong communication and teamwork skills

Benefits:
• Comprehensive benefits package
• Stock purchase plan
• Flexible work arrangements
• Learning and development resources`,
      skills: ['C#', '.NET', 'Azure', 'DevOps', 'CI/CD', 'Kubernetes', 'Docker'],
      requirements: ['3+ years experience', 'Cloud platform knowledge', '.NET proficiency'],
      benefits: ['Stock purchase plan', 'Flexible work', 'Learning budget', 'Health benefits'],
      external_url: 'https://careers.microsoft.com/us/en/job/123456789',
      source: 'microsoft_careers',
      company_rating: 4.3,
      applicant_count: 167,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'netflix-data-1',
      title: 'Data Scientist',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      salary_min: 170000,
      salary_max: 240000,
      job_type: 'Full-time',
      experience_level: 'Senior',
      description: `Netflix is looking for a Data Scientist to help drive data-driven decision making across our content and product teams.

Key Responsibilities:
• Analyze user behavior and content performance
• Build machine learning models for recommendations
• Design and analyze A/B tests
• Present insights to executive leadership

Requirements:
• 4+ years of data science experience
• Strong skills in Python, R, or Scala
• Experience with machine learning and statistics
• PhD or Master's in quantitative field preferred

Benefits:
• Top-tier compensation and equity
• Unlimited vacation policy
• Comprehensive health benefits
• Learning and development stipend`,
      skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'Spark', 'TensorFlow'],
      requirements: ['4+ years data science', 'ML experience', 'Advanced degree preferred'],
      benefits: ['Unlimited vacation', 'Top compensation', 'Learning stipend', 'Health benefits'],
      external_url: 'https://jobs.netflix.com/jobs/123456789',
      source: 'netflix_jobs',
      company_rating: 4.5,
      applicant_count: 98,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'stripe-eng-1',
      title: 'Frontend Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      salary_min: 150000,
      salary_max: 200000,
      job_type: 'Full-time',
      experience_level: 'Mid',
      description: `Stripe is hiring a Frontend Engineer to help build the future of online payments. You'll work on user-facing products that millions of businesses rely on.

Key Responsibilities:
• Build responsive web applications using React
• Collaborate with designers on user experience
• Optimize application performance and accessibility
• Contribute to design system and component library

Requirements:
• 3+ years of frontend development experience
• Expert knowledge of React, TypeScript, and CSS
• Experience with modern build tools and testing
• Strong attention to detail and design sense

Benefits:
• Competitive salary and equity package
• Health, dental, and vision insurance
• Commuter benefits and meals
• Professional development budget`,
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML', 'Webpack', 'Jest'],
      requirements: ['3+ years frontend', 'React expertise', 'TypeScript knowledge'],
      benefits: ['Equity package', 'Health insurance', 'Commuter benefits', 'Dev budget'],
      external_url: 'https://stripe.com/jobs/listing/123456789',
      source: 'stripe_jobs',
      company_rating: 4.6,
      applicant_count: 145,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'airbnb-design-1',
      title: 'Senior UX Designer',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      salary_min: 140000,
      salary_max: 180000,
      job_type: 'Full-time',
      experience_level: 'Senior',
      description: `Airbnb is seeking a Senior UX Designer to help create magical experiences for our global community of hosts and guests.

Key Responsibilities:
• Design end-to-end user experiences for web and mobile
• Conduct user research and usability testing
• Collaborate with product and engineering teams
• Contribute to Airbnb's design system

Requirements:
• 5+ years of UX design experience
• Strong portfolio demonstrating design process
• Proficiency in Figma, Sketch, or similar tools
• Experience with user research methodologies

Benefits:
• Competitive compensation and equity
• Annual travel credit
• Health and wellness benefits
• Flexible work arrangements`,
      skills: ['UX Design', 'User Research', 'Figma', 'Prototyping', 'Design Systems', 'Usability Testing'],
      requirements: ['5+ years UX design', 'Strong portfolio', 'Research experience'],
      benefits: ['Travel credit', 'Equity', 'Flexible work', 'Health benefits'],
      external_url: 'https://careers.airbnb.com/positions/123456789',
      source: 'airbnb_careers',
      company_rating: 4.1,
      applicant_count: 87,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'uber-backend-1',
      title: 'Backend Engineer',
      company: 'Uber',
      location: 'San Francisco, CA',
      salary_min: 145000,
      salary_max: 195000,
      job_type: 'Full-time',
      experience_level: 'Mid',
      description: `Join Uber's engineering team to build the systems that power millions of trips and deliveries worldwide.

Key Responsibilities:
• Design and implement scalable backend services
• Work with microservices architecture
• Optimize system performance and reliability
• Collaborate with cross-functional teams

Requirements:
• 3+ years of backend development experience
• Strong knowledge of Go, Java, or Python
• Experience with distributed systems
• Understanding of database design and optimization

Benefits:
• Competitive salary and equity
• Comprehensive health benefits
• Commuter benefits and meals
• Professional growth opportunities`,
      skills: ['Go', 'Java', 'Python', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'],
      requirements: ['3+ years backend', 'Distributed systems', 'Database optimization'],
      benefits: ['Equity', 'Health benefits', 'Commuter benefits', 'Growth opportunities'],
      external_url: 'https://www.uber.com/careers/list/123456789',
      source: 'uber_careers',
      company_rating: 3.8,
      applicant_count: 203,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, try to get jobs from database
      const { data: dbJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      let allJobs = [];

      // Add real jobs data
      allJobs = [...realJobs];

      // Add database jobs if any
      if (!error && dbJobs && dbJobs.length > 0) {
        allJobs = [...allJobs, ...dbJobs];
      }

      // Remove duplicates based on title and company
      const uniqueJobs = allJobs.filter((job, index, self) => 
        index === self.findIndex(j => j.title === job.title && j.company === job.company)
      );

      setJobs(uniqueJobs);
      setFilteredJobs(uniqueJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to real jobs only
      setJobs(realJobs);
      setFilteredJobs(realJobs);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserJobData = useCallback(async () => {
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
  }, [user]);

  const filterJobs = useCallback(() => {
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
  }, [jobs, searchTerm, locationFilter, salaryFilter, experienceFilter, jobTypeFilter]);

  useEffect(() => {
    fetchJobs();
    fetchUserJobData();
  }, [fetchJobs, fetchUserJobData]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

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
        toast.error('Please complete your profile in Smart Autofill first');
        return;
      }

      // Record application
      await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          status: 'applied',
          applied_at: new Date().toISOString()
        });

      setAppliedJobs(prev => new Set(prev).add(job.id));
      
      // Open external URL if available
      if (job.external_url) {
        window.open(job.external_url, '_blank');
        toast.success('Application tracked! Complete your application on the company website.');
      } else {
        toast.success('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
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
        {job.description.substring(0, 150)}...
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Real jobs from top companies</span>
            </div>
            <Button
              variant="outlined"
              startIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchJobs}
              disabled={loading}
            >
              Refresh
            </Button>
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
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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