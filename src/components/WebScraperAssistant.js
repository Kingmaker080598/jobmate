import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Download, 
  Eye, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { Typography, Button, TextField, Chip, Card, CardContent } from '@mui/material';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const WebScraperAssistant = () => {
  const { user } = useUser();
  const [currentUrl, setCurrentUrl] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingHistory, setScrapingHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const supportedSites = [
    { name: 'LinkedIn Jobs', pattern: 'linkedin.com/jobs', icon: Building, color: 'blue' },
    { name: 'Indeed', pattern: 'indeed.com', icon: Search, color: 'green' },
    { name: 'Glassdoor', pattern: 'glassdoor.com', icon: Building, color: 'purple' },
    { name: 'AngelList', pattern: 'angel.co', icon: Target, color: 'orange' },
    { name: 'Remote.co', pattern: 'remote.co', icon: Globe, color: 'teal' },
    { name: 'ZipRecruiter', pattern: 'ziprecruiter.com', icon: Search, color: 'red' }
  ];

  useEffect(() => {
    fetchScrapingHistory();
    simulateCurrentTab();
  }, [user]);

  const simulateCurrentTab = () => {
    // Simulate detecting current tab URL
    const mockUrls = [
      'https://www.linkedin.com/jobs/view/3234567890',
      'https://www.indeed.com/viewjob?jk=abc123def456',
      'https://www.glassdoor.com/job-listing/software-engineer-google-JV_IC1147401_KO0,17_KE18,24.htm'
    ];
    setCurrentUrl(mockUrls[Math.floor(Math.random() * mockUrls.length)]);
  };

  const fetchScrapingHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
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
  };

  const scrapeCurrentPage = async () => {
    if (!currentUrl) {
      toast.error('No active job page detected');
      return;
    }

    setLoading(true);
    toast.loading('Extracting job details...', { id: 'scrape' });

    try {
      // Simulate scraping process
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

      // Save to history
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
    
    // Store scraped data in localStorage for the AI tailoring component
    localStorage.setItem('jobDescriptionForTailoring', scrapedData.description);
    localStorage.setItem('jobDataForTailoring', JSON.stringify(scrapedData));
    
    toast.success('📤 Job data sent to AI Resume Tailoring!');
    
    // Navigate to AI tailoring page
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
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 ${
        currentUrl.includes(site.pattern) 
          ? `border-${site.color}-500 bg-${site.color}-50` 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <site.icon className={`w-6 h-6 text-${site.color}-600`} />
        <div>
          <Typography className="font-semibold">{site.name}</Typography>
          <Typography className="text-sm text-gray-600">
            {currentUrl.includes(site.pattern) ? 'Active' : 'Supported'}
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
          <Globe className="w-8 h-8 text-green-600" />
          <Typography variant="h3" className="font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Web Scraper Assistant
          </Typography>
        </div>
        <Typography className="text-gray-600 text-lg">
          Extract job details from any job posting with AI-powered precision
        </Typography>
      </motion.div>

      {/* Current Page Detection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <Typography variant="h5" className="mb-6 flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-600" />
          Current Page Detection
        </Typography>

        <div className="mb-6">
          <TextField
            fullWidth
            label="Current Tab URL"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            variant="outlined"
            className="mb-4"
          />
          
          <div className="flex gap-4">
            <Button
              variant="contained"
              size="large"
              onClick={scrapeCurrentPage}
              disabled={loading || !currentUrl}
              startIcon={loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? 'Extracting...' : 'Extract Job Details'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={simulateCurrentTab}
              startIcon={<RefreshCw className="w-4 h-4" />}
            >
              Detect Current Tab
            </Button>
          </div>
        </div>

        <div>
          <Typography variant="h6" className="mb-4">Supported Platforms</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5" className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Extracted Job Details
            </Typography>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={sendToAITailoring}
                startIcon={<Sparkles className="w-4 h-4" />}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Send to AI Tailoring
              </Button>
              <Button
                variant="outlined"
                onClick={saveJobToBoard}
                startIcon={<Target className="w-4 h-4" />}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Save to Job Board
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="mb-6">
                <CardContent>
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Job Overview
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography className="font-semibold text-lg">{scrapedData.title}</Typography>
                      <Typography className="text-gray-600">{scrapedData.company}</Typography>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{scrapedData.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{scrapedData.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{scrapedData.jobType}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" className="mb-4">Key Information</Typography>
                  <div className="space-y-4">
                    <div>
                      <Typography className="font-semibold mb-2">Required Skills</Typography>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Typography className="font-semibold mb-2">Experience Level</Typography>
                      <Chip label={scrapedData.experience} color="primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent>
                  <Typography variant="h6" className="mb-4">Job Description</Typography>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{scrapedData.description}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scraping History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <Typography variant="h5" className="mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-600" />
          Recent Extractions
        </Typography>

        {scrapingHistory.length === 0 ? (
          <div className="text-center py-8">
            <Typography className="text-gray-500">No extraction history yet</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapingHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <Typography className="font-medium">{entry.job_title}</Typography>
                    <Typography className="text-sm text-gray-600">
                      {entry.company} • {new Date(entry.created_at).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip 
                    label={entry.success ? 'Success' : 'Failed'} 
                    color={entry.success ? 'success' : 'error'}
                    size="small"
                  />
                  <Button
                    size="small"
                    onClick={() => setScrapedData(entry.scraped_data)}
                    startIcon={<Eye className="w-3 h-3" />}
                  >
                    View
                  </Button>
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