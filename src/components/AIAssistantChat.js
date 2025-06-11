import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  RefreshCw,
  Lightbulb,
  Target,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Typography, TextField, Button, Chip } from '@mui/material';
import { useUser } from '@/contexts/UserContext';

const AIAssistantChat = ({ isOpen, onClose }) => {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: FileText, label: 'Tailor my resume', action: 'tailor_resume' },
    { icon: Target, label: 'Find jobs for me', action: 'find_jobs' },
    { icon: TrendingUp, label: 'Improve my profile', action: 'improve_profile' },
    { icon: Lightbulb, label: 'Career advice', action: 'career_advice' }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Hey ${profile?.name || user?.email?.split('@')[0] || 'there'}! 👋 I'm your JobMate AI assistant. I'm here to help you land your dream job faster. What would you like to work on today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (content = inputMessage) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateAIResponse(content);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = {
      tailor_resume: "🎯 Great choice! I can help you tailor your resume for specific jobs. Do you have a job description you'd like me to analyze? You can paste it here or use our AI Tailoring tool for a more detailed experience.",
      find_jobs: "🔍 I'd love to help you find the perfect opportunities! Based on your profile, I can search for roles that match your skills. What type of position are you looking for? (e.g., 'Software Engineer', 'Marketing Manager', etc.)",
      improve_profile: "📈 Let's optimize your profile! I can help you enhance your resume, improve your LinkedIn presence, and make you more attractive to employers. What area would you like to focus on first?",
      career_advice: "💡 I'm here to guide your career journey! Whether you need help with interview prep, salary negotiation, or career transitions, I've got you covered. What specific advice are you looking for?",
      default: "I understand you're looking for help with your job search. I can assist with resume tailoring, job searching, profile optimization, and career advice. What would you like to focus on?"
    };

    const lowerInput = userInput.toLowerCase();
    let responseKey = 'default';

    if (lowerInput.includes('resume') || lowerInput.includes('tailor')) {
      responseKey = 'tailor_resume';
    } else if (lowerInput.includes('job') || lowerInput.includes('find') || lowerInput.includes('search')) {
      responseKey = 'find_jobs';
    } else if (lowerInput.includes('profile') || lowerInput.includes('improve') || lowerInput.includes('optimize')) {
      responseKey = 'improve_profile';
    } else if (lowerInput.includes('advice') || lowerInput.includes('help') || lowerInput.includes('career')) {
      responseKey = 'career_advice';
    }

    return {
      id: Date.now(),
      type: 'bot',
      content: responses[responseKey],
      timestamp: new Date()
    };
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      tailor_resume: "I want to tailor my resume for a specific job",
      find_jobs: "Help me find relevant job opportunities",
      improve_profile: "I want to improve my profile",
      career_advice: "I need career advice"
    };

    handleSendMessage(actionMessages[action]);
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
        }`}>
          {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className={`rounded-lg p-3 ${
          message.type === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <Typography className="text-sm">{message.content}</Typography>
          <Typography className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <div>
            <Typography className="font-semibold">JobMate AI</Typography>
            <Typography className="text-xs opacity-90">Your Career Copilot</Typography>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200">
          <Typography className="text-sm text-gray-600 mb-3">Quick actions:</Typography>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-2 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <action.icon className="w-3 h-3 text-purple-600" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything about your job search..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantChat;