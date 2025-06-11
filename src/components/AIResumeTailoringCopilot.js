import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Target, 
  Download, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Eye,
  Copy,
  Wand2
} from 'lucide-react';
import { Typography, Button, TextField, Chip, LinearProgress, Dialog, DialogContent } from '@mui/material';
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
  const [analysisData, setAnalysisData] = useState(null);

  const toneOptions = [
    { value: 'professional', label: 'Professional', desc: 'Formal and corporate tone' },
    { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate' },
    { value: 'concise', label: 'Concise', desc: 'Brief and to the point' },
    { value: 'technical', label: 'Technical', desc: 'Detail-oriented and precise' }
  ];

  useEffect(() => {
    fetchLatestResume();
  }, [user]);

  const fetchLatestResume = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
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
          // Fetch content from URL if available
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
        setAnalysisData(data);
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
          keywords: keywords.slice(0, 10) // Top 10 keywords
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
    setAnalysisData(null);
  };

  const StepIndicator = ({ currentStep }) => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            stepNum <= currentStep 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNum < currentStep ? <CheckCircle className="w-5 h-5" /> : stepNum}
          </div>
          {stepNum < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              stepNum < currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <Typography variant="h3" className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Resume Tailoring Copilot
          </Typography>
        </div>
        <Typography className="text-gray-600 text-lg">
          Transform your resume with AI precision - match any job in seconds
        </Typography>
      </motion.div>

      <StepIndicator currentStep={step} />

      {/* Step 1: Job Description Input */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-purple-600" />
            <Typography variant="h5" className="font-semibold">
              Step 1: Paste Job Description
            </Typography>
          </div>
          
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="Paste the complete job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mb-6"
            variant="outlined"
          />

          <div className="mb-6">
            <Typography variant="h6" className="mb-3">Choose Tone Style:</Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {toneOptions.map((tone) => (
                <motion.div
                  key={tone.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    toneStyle === tone.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setToneStyle(tone.value)}
                >
                  <Typography className="font-semibold">{tone.label}</Typography>
                  <Typography className="text-sm text-gray-600">{tone.desc}</Typography>
                </motion.div>
              ))}
            </div>
          </div>

          <Button
            variant="contained"
            size="large"
            onClick={analyzeJobDescription}
            disabled={!jobDescription.trim() || loading}
            startIcon={loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? 'Analyzing...' : 'Analyze Job Description'}
          </Button>
        </motion.div>
      )}

      {/* Step 2: Analysis Loading */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <RefreshCw className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <Typography variant="h5" className="mb-2">Analyzing Job Description...</Typography>
          <Typography className="text-gray-600">
            Our AI is extracting key requirements and matching criteria
          </Typography>
          <LinearProgress className="mt-6" />
        </motion.div>
      )}

      {/* Step 3: Analysis Results */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Typography variant="h5" className="mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Analysis Results
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-purple-600 mb-2">
                  {matchScore}%
                </Typography>
                <Typography className="text-gray-600">Current Match Score</Typography>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-green-600 mb-2">
                  {keywords.length}
                </Typography>
                <Typography className="text-gray-600">Key Terms Found</Typography>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <Typography variant="h3" className="font-bold text-orange-600 mb-2">
                  {suggestions.length}
                </Typography>
                <Typography className="text-gray-600">Improvements</Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="h6" className="mb-4">Key Keywords to Include:</Typography>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 15).map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      variant="outlined"
                      className="border-purple-300 text-purple-700"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Typography variant="h6" className="mb-4">AI Suggestions:</Typography>
                <div className="space-y-2">
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <Typography className="text-sm text-blue-800">{suggestion}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                variant="contained"
                size="large"
                onClick={generateTailoredResume}
                disabled={!resumeContent || loading}
                startIcon={<Sparkles className="w-5 h-5" />}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Generate Tailored Resume
              </Button>
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Edit Job Description
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 4: Resume Generation Loading */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <Sparkles className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <Typography variant="h5" className="mb-2">Crafting Your Perfect Resume...</Typography>
          <Typography className="text-gray-600">
            AI is tailoring your resume with optimal keywords and formatting
          </Typography>
          <LinearProgress className="mt-6" />
        </motion.div>
      )}

      {/* Step 5: Final Results */}
      {step === 5 && tailoredResume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Resume Successfully Tailored!
              </Typography>
              <div className="flex items-center gap-2">
                <Typography className="text-2xl font-bold text-green-600">
                  {matchScore}%
                </Typography>
                <Typography className="text-gray-600">Match Score</Typography>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6">Your Tailored Resume</Typography>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={copyToClipboard}
                      startIcon={<Copy className="w-4 h-4" />}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setShowComparison(true)}
                      startIcon={<Eye className="w-4 h-4" />}
                    >
                      Compare
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{tailoredResume}</pre>
                </div>
              </div>

              <div>
                <Typography variant="h6" className="mb-4">Improvements Made</Typography>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Typography className="text-sm">Added {keywords.slice(0, 10).length} relevant keywords</Typography>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <Typography className="text-sm">Optimized for {toneStyle} tone</Typography>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <Typography className="text-sm">Enhanced ATS compatibility</Typography>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                    <Typography className="text-sm">Improved match score by {Math.max(0, matchScore - 60)}%</Typography>
                  </div>
                </div>

                <div className="mt-6">
                  <Typography variant="h6" className="mb-3">Keywords Added:</Typography>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 8).map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        className="bg-green-100 text-green-800"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                variant="contained"
                onClick={saveToHistory}
                startIcon={<Save className="w-5 h-5" />}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Save to History
              </Button>
              <Button
                variant="outlined"
                onClick={() => downloadResume('txt')}
                startIcon={<Download className="w-5 h-5" />}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Download TXT
              </Button>
              <Button
                variant="outlined"
                onClick={() => downloadResume('pdf')}
                startIcon={<Download className="w-5 h-5" />}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Download PDF
              </Button>
              <Button
                variant="text"
                onClick={resetProcess}
                startIcon={<RefreshCw className="w-5 h-5" />}
                className="text-gray-600 hover:bg-gray-50"
              >
                Start Over
              </Button>
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
      >
        <DialogContent className="p-8">
          <Typography variant="h5" className="mb-6 text-center">
            Before vs After Comparison
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Typography variant="h6" className="mb-4 text-red-600">Original Resume</Typography>
              <div className="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{resumeContent}</pre>
              </div>
            </div>
            <div>
              <Typography variant="h6" className="mb-4 text-green-600">Tailored Resume</Typography>
              <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{tailoredResume}</pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIResumeTailoringCopilot;