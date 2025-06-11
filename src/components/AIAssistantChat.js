import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Sparkles, 
  X, 
  Lightbulb,
  Target,
  FileText,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const AIAssistantChat = ({ isOpen, onClose }) => {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: FileText, label: 'Tailor my resume', action: 'tailor_resume', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Find jobs for me', action: 'find_jobs', gradient: 'from-green-500 to-teal-500' },
    { icon: TrendingUp, label: 'Improve my profile', action: 'improve_profile', gradient: 'from-purple-500 to-pink-500' },
    { icon: Lightbulb, label: 'Career advice', action: 'career_advice', gradient: 'from-orange-500 to-red-500' }
  ];

  const initializeChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Hey ${profile?.name || user?.email?.split('@')[0] || 'there'}! 👋 I'm your JobMate AI assistant. I'm here to help you land your dream job faster. What would you like to work on today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [profile?.name, user?.email]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    setTimeout(() => {
      const botResponse = generateAIResponse(content);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = {
      tailor_resume: "🎯 Perfect! I can help you create a tailored resume that matches any job perfectly. Do you have a specific job description you'd like me to analyze? You can paste it here or use our AI Tailoring tool for the full experience with visual comparisons and keyword optimization.",
      find_jobs: "🔍 I'd love to help you discover amazing opportunities! Based on your profile, I can search for roles that match your skills perfectly. What type of position are you looking for? (e.g., 'Software Engineer', 'Marketing Manager', 'Data Scientist', etc.)",
      improve_profile: "📈 Let's supercharge your profile! I can help you optimize your resume, enhance your LinkedIn presence, and make you irresistible to employers. What area would you like to focus on first - resume content, keywords, or overall presentation?",
      career_advice: "💡 I'm here to guide your career journey! Whether you need help with interview prep, salary negotiation, career transitions, or industry insights, I've got you covered. What specific advice are you looking for?",
      default: "I understand you're looking for help with your job search. I can assist with resume tailoring, job searching, profile optimization, and career advice. I'm powered by advanced AI to give you personalized, actionable guidance. What would you like to focus on?"
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
      improve_profile: "I want to improve my profile and increase my chances",
      career_advice: "I need personalized career advice and guidance"
    };

    handleSendMessage(actionMessages[action]);
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex items-start gap-4 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <motion.div 
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {message.type === 'user' ? <User className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
        </motion.div>
        <div className={`bg-white/90 backdrop-blur-sm border rounded-lg p-4 shadow-sm ${
          message.type === 'user'
            ? 'border-blue-200 bg-blue-50'
            : 'border-purple-200 bg-purple-50'
        }`}>
          <p className="text-gray-800 leading-relaxed">{message.content}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[700px] bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg flex flex-col z-50 shadow-xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-white">JobMate AI</h3>
            <p className="text-xs text-white/80 font-mono">Your Career Copilot</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-600 mb-4 font-semibold">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <motion.button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${action.gradient} mb-2 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 group-hover:text-blue-700 transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-3">
          <input
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-500 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ask me anything about your career..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantChat;