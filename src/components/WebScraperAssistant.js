import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Download, 
  Eye, 
  RefreshCw, 
  CheckCircle,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Chip } from '@mui/material';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const WebScraperAssistant = () => {
  const { user } = useUser();
  const [currentUrl, setCurrentUrl] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [scrapingHistory, setScrapingHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const supportedSites = [
    { name: 'LinkedIn Jobs', pattern: 'linkedin.com/jobs', icon: Building, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Indeed', pattern: 'indeed.com', icon: Search, color: 'green', gradient: 'from-green-500 to-teal-500' },
    { name: 'Glassdoor', pattern: 'glassdoor.com', icon: Building, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { name: 'AngelList', pattern: 'angel.co', icon: Target, color: 'orange', gradient: 'from-orange-500 to-red-500' },
    { name: 'Remote.co', pattern: 'remote.co', icon: Globe, color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
    { name: 'ZipRecruiter', pattern: 'ziprecruiter.com', icon: Search, color: 'red', gradient: 'from-red-500 to-pink-500' }
  ];

  const fetchScrapingHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('scraping_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setScrapingHistory(data);
      }
    } catch (error) {
      console.error('Error fetching scraping history:', error);
    }
  }, [user]);

  const simulateCurrentTab = () => {
    const mockUrls = [
      'https://www.linkedin.com/jobs/view/3234567890',
      'https://www.indeed.com/viewjob?jk=abc123def456',
      'https://www.glassdoor.com/job-listing/software-engineer-google-JV_IC1147401_KO0,17_KE18,24.htm'
    ];
    setCurrentUrl(mockUrls[Math.floor(Math.random() * mockUrls.length)]);
  };

  useEffect(() => {
    fetchScrapingHistory();
    simulateCurrentTab();
  }, [fetchScrapingHistory]);

  const scrapeCurrentPage = async () => {
    if (!currentUrl) {
      toast.error('No active job page detected');
      return;
    }

    setLoading(true);
    toast.loading('Extracting job details with AI...', { id: 'scrape' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockJobData = {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA (Remote)',
        salary: '$120,000 - $180,000',
        jobType: 'Full-time',
        experience: 'Mid-Senior level',
        description: `We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.

Key Responsibilities:
• Develop and maintain web applications using React, Node.js, and TypeScript
• Collaborate with cross-functional teams to define and implement new features
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to team growth

Requirements:
• 5+ years of experience in software development
• Strong proficiency in JavaScript, React, and Node.js
• Experience with cloud platforms (AWS, GCP, or Azure)
• Knowledge of database systems (SQL and NoSQL)
• Excellent communication and problem-solving skills
• Bachelor's degree in Computer Science or related field

Benefits:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and unlimited PTO
• Professional development budget
• Modern office with free meals and snacks`,
        requirements: [
          '5+ years of software development experience',
          'Proficiency in JavaScript, React, Node.js',
          'Experience with cloud platforms',
          'Strong problem-solving skills',
          'Bachelor\'s degree preferred'
        ],
        skills: [
          'JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'SQL', 'NoSQL', 'Git', 'Agile'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work',
          'Unlimited PTO',
          'Professional development'
        ],
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        url: currentUrl
      };

      setScrapedData(mockJobData);

      const { error } = await supabase
        .from('scraping_history')
        .insert({
          user_id: user.id,
          url: currentUrl,
          job_title: mockJobData.title,
          company: mockJobData.company,
          scraped_data: mockJobData,
          success: true,
          created_at: new Date().toISOString()
        });

      if (!error) {
        fetchScrapingHistory();
      }

      toast.success('✅ Job details extracted successfully!', { id: 'scrape' });
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error('Failed to extract job details', { id: 'scrape' });
    } finally {
      setLoading(false);
    }
  };

  const sendToAITailoring = () => {
    if (!scrapedData) return;
    
    localStorage.setItem('jobDescriptionForTailoring', scrapedData.description);
    localStorage.setItem('jobDataForTailoring', JSON.stringify(scrapedData));
    
    toast.success('📤 Job data sent to AI Resume Tailoring!');
    window.location.href = '/ai-tailoring';
  };

  const saveJobToBoard = async () => {
    if (!scrapedData || !user) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: scrapedData.title,
          company: scrapedData.company,
          location: scrapedData.location,
          description: scrapedData.description,
          salary_text: scrapedData.salary,
          job_type: scrapedData.jobType,
          experience_level: scrapedData.experience,
          skills: scrapedData.skills,
          requirements: scrapedData.requirements,
          benefits: scrapedData.benefits,
          external_url: scrapedData.url,
          source: 'scraped',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('💾 Job saved to your job board!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save job');
    }
  };

  const SiteCard = ({ site }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-lg shadow-md border-2 p-6 cursor-pointer transition-all ${
        currentUrl.includes(site.pattern) 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${site.gradient} flex items-center justify-center`}>
          <site.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900">{site.name}</h4>
          <p className="text-sm text-gray-500">
            {currentUrl.includes(site.pattern) ? 'Currently Active' : 'Supported Platform'}
          </p>
        </div>
      </div>
      {currentUrl.includes(site.pattern) && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 font-semibold">DETECTED</span>
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
          <Globe className="w-12 h-12 text-green-500" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Web Scraper
          </h1>
          <Brain className="w-12 h-12 text-purple-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Extract job details from any posting with AI-powered precision
        </p>
      </motion.div>

      {/* Current Page Detection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-8"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-900">
          <Eye className="w-8 h-8 text-blue-600" />
          Page Detection & Extraction
        </h2>

        <div className="mb-8">
          <div className="mb-6">
            <input
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter job posting URL or let AI detect current tab..."
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <motion.button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
              onClick={scrapeCurrentPage}
              disabled={loading || !currentUrl}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  AI Extracting...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Download className="w-6 h-6" />
                  Extract Job Details
                </div>
              )}
            </motion.button>
            
            <motion.button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-lg border border-gray-300 transition-colors"
              onClick={simulateCurrentTab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                Detect Tab
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Supported Platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedSites.map((site) => (
              <SiteCard key={site.name} site={site} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scraped Data Display */}
      {scrapedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-4 text-gray-900">
              <CheckCircle className="w-8 h-8 text-green-600" />
              Extracted Job Intelligence
            </h2>
            <div className="flex gap-4">
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={sendToAITailoring}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Send to AI Tailoring
                </div>
              </motion.button>
              <motion.button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg border border-gray-300 transition-colors"
                onClick={saveJobToBoard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5" />
                  Save to Board
                </div>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <Building className="w-6 h-6 text-blue-600" />
                  Job Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{scrapedData.title}</h4>
                    <p className="text-lg text-gray-700">{scrapedData.company}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">{scrapedData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{scrapedData.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">{scrapedData.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">{scrapedData.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">AI-Extracted Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {scrapedData.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Chip
                        label={skill}
                        variant="outlined"
                        color="primary"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-900">Experience Level</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <span className="text-blue-600 font-semibold">{scrapedData.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Job Description</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{scrapedData.description}</pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scraping History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-900">
          <Clock className="w-8 h-8 text-purple-600" />
          Extraction History
        </h2>

        {scrapingHistory.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No extraction history yet</p>
            <p className="text-gray-400 text-sm">Start scraping jobs to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapingHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setScrapedData(entry.scraped_data)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{entry.job_title}</h4>
                      <p className="text-gray-600">
                        {entry.company} • {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip 
                      label={entry.success ? 'Success' : 'Failed'} 
                      color={entry.success ? 'success' : 'error'}
                      variant="outlined"
                    />
                    <motion.button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
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

export default WebScraperAssistant;