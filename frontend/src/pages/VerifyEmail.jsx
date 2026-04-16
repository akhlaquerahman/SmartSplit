import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ShieldCheck, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendOTP, loading, error, clearError } = useAuthStore();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await verifyEmail(email, otp);
    if (success) navigate('/dashboard');
  };

  const handleResend = async () => {
    await resendOTP(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-8 rounded-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h1>
          <p className="text-slate-500 text-sm">We've sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span></p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex justify-between items-center">
            {error}
            <button onClick={clearError} className="text-red-700 font-bold">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl tracking-[1em] font-bold py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="text-center mt-8">
          <button 
            onClick={handleResend}
            disabled={loading}
            className="text-primary-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Resend Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
