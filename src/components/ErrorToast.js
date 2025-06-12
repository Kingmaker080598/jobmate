import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { getErrorDisplay } from '@/lib/errorHandler';

const ErrorToast = ({ error, onClose, autoClose = true }) => {
  const errorDisplay = getErrorDisplay(error);

  const getIcon = () => {
    switch (errorDisplay.severity) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return AlertTriangle;
    }
  };

  const getColors = () => {
    switch (errorDisplay.severity) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className={`fixed top-4 right-4 max-w-md w-full border rounded-lg shadow-lg p-4 z-50 ${getColors()}`}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{errorDisplay.title}</h4>
            <p className="text-sm mt-1 opacity-90">{errorDisplay.message}</p>
            {errorDisplay.action && (
              <p className="text-xs mt-2 font-medium opacity-75">{errorDisplay.action}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorToast;