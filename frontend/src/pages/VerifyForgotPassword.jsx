import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyForgotPassword = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      navigate('/forgot-password');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-forgot-password-otp', {
        email,
        otp
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp } });
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', {
        email
      });
      setError(''); // Clear any previous errors
      alert('New OTP sent to your email');
    } catch (error) {
      setError('Failed to resend OTP');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">OTP Verified!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Redirecting to password reset...
          </p>
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
            onClick={() => navigate('/forgot-password')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify OTP</h1>
            <p className="text-slate-500 text-sm">Enter the 6-digit code sent to your email</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="text-red-700 font-bold">×</button>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Mail className="h-5 w-5 text-slate-400 mr-2" />
            <span className="text-sm text-slate-600 dark:text-slate-400">{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="text-primary-600 font-bold hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>
        </div>

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

export default VerifyForgotPassword;