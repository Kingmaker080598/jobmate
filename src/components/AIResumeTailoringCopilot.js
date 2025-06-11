import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  Download, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Eye,
  Copy,
  Wand2,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Chip, Dialog, DialogContent } from '@mui/material';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const AIResumeTailoringCopilot = () => {
  const { user } = useUser();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [toneStyle, setToneStyle] = useState('professional');

  const toneOptions = [
    { value: 'professional', label: 'Professional', desc: 'Formal and corporate tone', gradient: 'from-blue-500 to-cyan-500' },
    { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate', gradient: 'from-orange-500 to-red-500' },
    { value: 'concise', label: 'Concise', desc: 'Brief and to the point', gradient: 'from-green-500 to-teal-500' },
    { value: 'technical', label: 'Technical', desc: 'Detail-oriented and precise', gradient: 'from-purple-500 to-pink-500' }
  ];

  const fetchLatestResume = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('resume_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const resume = data[0];
        if (resume.content) {
          setResumeContent(resume.content);
        } else if (resume.resume_url) {
          try {
            const response = await fetch(resume.resume_url);
            const text = await response.text();
            setResumeContent(text);
          } catch (err) {
            console.error('Error fetching resume content:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  useEffect(() => {
    fetchLatestResume();
    
    // Check for data from scraper
    const scrapedJobDescription = localStorage.getItem('jobDescriptionForTailoring');
    if (scrapedJobDescription) {
      setJobDescription(scrapedJobDescription);
      localStorage.removeItem('jobDescriptionForTailoring');
      toast.success('📥 Job description loaded from scraper!');
    }
  }, [user]);

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description first');
      return;
    }

    setLoading(true);
    setStep(2);

    try {
      const response = await fetch('/api/analyze-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, toneStyle })
      });

      const data = await response.json();
      
      if (response.ok) {
        setKeywords(data.keywords || []);
        setSuggestions(data.suggestions || []);
        setMatchScore(data.matchScore || 0);
        setStep(3);
        toast.success('✨ Job analysis complete!');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze job description');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const generateTailoredResume = async () => {
    if (!resumeContent || !jobDescription) {
      toast.error('Please ensure you have both resume content and job description');
      return;
    }

    setLoading(true);
    setStep(4);

    try {
      const response = await fetch('/api/generate-tailored-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeContent, 
          jobDescription, 
          toneStyle,
          keywords: keywords.slice(0, 10)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTailoredResume(data.tailoredResume);
        setMatchScore(data.newMatchScore || matchScore + 25);
        setStep(5);
        toast.success('🎉 Resume tailored successfully!');
      } else {
        throw new Error(data.error || 'Tailoring failed');
      }
    } catch (error) {
      console.error('Tailoring error:', error);
      toast.error('Failed to tailor resume');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!tailoredResume || !user) return;

    try {
      const jobTitle = jobDescription.split('\n')[0].slice(0, 80) || 'AI Tailored Resume';
      
      const { error } = await supabase.from('resume_history').insert({
        user_id: user.id,
        job_title: jobTitle,
        content: tailoredResume,
        file_name: `${jobTitle.replace(/\s+/g, '_')}_tailored.txt`,
        file_type: 'text/plain',
        tailored: true,
        match_score: matchScore,
        keywords_used: keywords.slice(0, 10)
      });

      if (error) throw error;
      toast.success('✅ Saved to resume history!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save resume');
    }
  };

  const downloadResume = (format = 'txt') => {
    if (!tailoredResume) return;

    const blob = new Blob([tailoredResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored_resume.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tailoredResume);
    toast.success('📋 Copied to clipboard!');
  };

  const resetProcess = () => {
    setStep(1);
    setJobDescription('');
    setTailoredResume('');
    setMatchScore(0);
    setKeywords([]);
    setSuggestions([]);
  };

  const StepIndicator = ({ currentStep }) => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3, 4, 5].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <motion.div 
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${
              stepNum <= currentStep 
                ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}
            whileHover={{ scale: 1.1 }}
            animate={stepNum === currentStep ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: stepNum === currentStep ? Infinity : 0, duration: 2 }}
          >
            {stepNum < currentStep ? <CheckCircle className="w-6 h-6" /> : stepNum}
            {stepNum <= currentStep && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-30 blur-lg" />
            )}
          </motion.div>
          {stepNum < 5 && (
            <div className={`w-16 h-1 mx-3 rounded-full ${
              stepNum < currentStep 
                ? 'bg-gradient-to-r from-cyan-400 to-purple-600' 
                : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold gradient-text cyber-heading">
            AI Resume Copilot
          </h1>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-12 h-12 text-purple-400" />
          </motion.div>
        </div>
        <p className="text-xl text-gray-300 elegant-text">
          Transform your resume with AI precision - match any job in seconds
        </p>
      </motion.div>

      <StepIndicator currentStep={step} />

      {/* Step 1: Job Description Input */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 hover-lift"
        >
          <div className="flex items-center gap-4 mb-8">
            <Target className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold gradient-text">Step 1: Job Description Analysis</h2>
          </div>
          
          <div className="cyber-input-container mb-8">
            <textarea
              className="cyber-input w-full h-64 resize-none"
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">Choose AI Tone Style:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {toneOptions.map((tone) => (
                <motion.div
                  key={tone.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`gradient-border p-6 cursor-pointer transition-all ${
                    toneStyle === tone.value
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'hover:border-purple-400/50'
                  }`}
                  onClick={() => setToneStyle(tone.value)}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tone.gradient} mb-4 mx-auto`} />
                  <h4 className="font-bold text-center mb-2">{tone.label}</h4>
                  <p className="text-sm text-gray-400 text-center">{tone.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            className="cyber-button w-full text-lg py-4"
            onClick={analyzeJobDescription}
            disabled={!jobDescription.trim() || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                Analyzing with AI...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Wand2 className="w-6 h-6" />
                Analyze Job Description
              </div>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Step 2: Analysis Loading */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-3xl font-bold mb-4 gradient-text">AI Analysis in Progress</h3>
          <p className="text-gray-300 mb-8">
            Our advanced AI is extracting key requirements and matching criteria
          </p>
          <div className="cyber-progress h-3 mb-4">
            <motion.div 
              className="cyber-progress-bar h-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
            />
          </div>
        </motion.div>
      )}

      {/* Step 3: Analysis Results */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <span className="gradient-text">Analysis Results</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div 
                className="hologram-card p-8 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {matchScore}%
                </div>
                <div className="text-gray-400">Current Match Score</div>
              </motion.div>
              
              <motion.div 
                className="hologram-card p-8 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {keywords.length}
                </div>
                <div className="text-gray-400">Key Terms Found</div>
              </motion.div>
              
              <motion.div 
                className="hologram-card p-8 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <Brain className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-orange-400 mb-2">
                  {suggestions.length}
                </div>
                <div className="text-gray-400">AI Suggestions</div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-cyan-400">Key Keywords to Include:</h3>
                <div className="flex flex-wrap gap-3">
                  {keywords.slice(0, 15).map((keyword, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Chip
                        label={keyword}
                        className="neon-border bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6 text-cyan-400">AI Optimization Suggestions:</h3>
                <div className="space-y-4">
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 glass-card hover-lift"
                    >
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-12">
              <motion.button
                className="cyber-button flex-1 text-lg py-4"
                onClick={generateTailoredResume}
                disabled={!resumeContent || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Generate Tailored Resume
                </div>
              </motion.button>
              
              <motion.button
                className="glass-card px-8 py-4 border border-purple-400/50 hover:border-purple-400 transition-colors"
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Edit Job Description
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 4: Resume Generation Loading */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-3xl font-bold mb-4 gradient-text">Crafting Your Perfect Resume</h3>
          <p className="text-gray-300 mb-8">
            AI is tailoring your resume with optimal keywords and formatting
          </p>
          <div className="cyber-progress h-3">
            <motion.div 
              className="cyber-progress-bar h-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Step 5: Final Results */}
      {step === 5 && tailoredResume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="gradient-text">Resume Successfully Tailored!</span>
              </h2>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-400">{matchScore}%</div>
                <div className="text-gray-400">Match Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Your Tailored Resume</h3>
                  <div className="flex gap-3">
                    <motion.button
                      className="glass-card px-4 py-2 border border-cyan-400/50 hover:border-cyan-400 transition-colors"
                      onClick={copyToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="glass-card px-4 py-2 border border-purple-400/50 hover:border-purple-400 transition-colors"
                      onClick={() => setShowComparison(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="glass-card p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300">{tailoredResume}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">AI Improvements Made</h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: `Added ${keywords.slice(0, 10).length} relevant keywords`, color: 'green' },
                    { icon: Zap, text: `Optimized for ${toneStyle} tone`, color: 'blue' },
                    { icon: Brain, text: 'Enhanced ATS compatibility', color: 'purple' },
                    { icon: TrendingUp, text: `Improved match score by ${Math.max(0, matchScore - 60)}%`, color: 'orange' }
                  ].map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 glass-card hover-lift"
                    >
                      <improvement.icon className={`w-6 h-6 text-${improvement.color}-400`} />
                      <span className="text-gray-300">{improvement.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-cyan-400">Keywords Added:</h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 8).map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Chip
                          label={keyword}
                          className="bg-green-500/20 text-green-300 border border-green-400/30"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-12">
              <motion.button
                className="cyber-button px-8 py-4"
                onClick={saveToHistory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5" />
                  Save to History
                </div>
              </motion.button>
              
              <motion.button
                className="glass-card px-8 py-4 border border-cyan-400/50 hover:border-cyan-400 transition-colors"
                onClick={() => downloadResume('txt')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  Download TXT
                </div>
              </motion.button>
              
              <motion.button
                className="glass-card px-8 py-4 border border-purple-400/50 hover:border-purple-400 transition-colors"
                onClick={() => downloadResume('pdf')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  Download PDF
                </div>
              </motion.button>
              
              <motion.button
                className="glass-card px-8 py-4 border border-gray-400/50 hover:border-gray-400 transition-colors"
                onClick={resetProcess}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Start Over
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Dialog */}
      <Dialog
        open={showComparison}
        onClose={() => setShowComparison(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: 'glass-card border border-cyan-400/30'
        }}
      >
        <DialogContent className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text">
            Before vs After Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-400">Original Resume</h3>
              <div className="glass-card p-6 max-h-96 overflow-y-auto border border-red-400/30">
                <pre className="whitespace-pre-wrap text-sm text-gray-300">{resumeContent}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">Tailored Resume</h3>
              <div className="glass-card p-6 max-h-96 overflow-y-auto border border-green-400/30">
                <pre className="whitespace-pre-wrap text-sm text-gray-300">{tailoredResume}</pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIResumeTailoringCopilot;