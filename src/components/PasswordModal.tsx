import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { authService } from '../services/AuthService';

interface PasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter the dashboard password');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await authService.verifyDashboardPassword(password);
      
      if (isValid) {
        // Store authentication in sessionStorage (expires when browser closes)
        sessionStorage.setItem('dashboard_auth', 'true');
        sessionStorage.setItem('dashboard_auth_time', Date.now().toString());
        
        setPassword('');
        onSuccess();
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-8 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-600/20 rounded-full">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white heading-font mb-2">
            Dashboard Access
          </h2>
          <p className="text-gray-400">
            Enter the dashboard password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="Enter dashboard password"
                disabled={isVerifying}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={isVerifying}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="flex-1 inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-3 bg-purple-600/10 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-purple-300 text-center">
            🔒 Your session will expire when you close the browser
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;