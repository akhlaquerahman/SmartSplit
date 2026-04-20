import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        email
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/verify-forgot-password', { state: { email } });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass w-full max-w-md p-8 rounded-2xl text-center"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We've sent a password reset OTP to <strong>{email}</strong>
          </p>
          <p className="text-sm text-slate-500">Redirecting to verification page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_50%)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-8 rounded-2xl relative z-10"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>
            <p className="text-slate-500 text-sm">Reset your password</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="text-red-700 font-bold">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="name@example.com"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Enter the email address associated with your account
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset OTP'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;