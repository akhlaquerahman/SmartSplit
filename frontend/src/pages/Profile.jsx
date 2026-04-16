import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { User, Phone, Image, Lock, Loader2, Check, ShieldAlert, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile, requestPasswordOtp, verifyPasswordOtp, loading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [success, setSuccess] = useState('');

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
        alert('Image is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    const res = await updateProfile({ name, mobile, avatar });
    if (res) setSuccess('Profile updated successfully!');
  };

  const handleRequestPasswordOtp = async () => {
    const res = await requestPasswordOtp();
    if (res) setOtpSent(true);
  };

  const handleVerifyPassword = async () => {
    const res = await verifyPasswordOtp(otp, newPassword);
    if (res) {
      setSuccess('Password updated successfully!');
      setShowPasswordModal(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and security preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="glass p-6 rounded-2xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img 
                src={avatar || `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-all cursor-pointer">
                <Camera size={16} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h2>
            <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
            
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
            >
              <Lock size={16} /> Change Password
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="glass p-8 rounded-2xl space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm flex justify-between items-center">
                {error}
                <button onClick={clearError} className="font-bold cursor-pointer">×</button>
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2">
                <Check size={16} /> {success}
              </div>
            )}

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
                <div 
                  onClick={() => document.getElementById('avatar-upload').click()}
                  className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 group"
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary-600 shadow-sm transition-all">
                    <Camera size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Click to upload new photo</p>
                    <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden relative"
            >
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Change Password</h2>
              <p className="text-slate-500 text-sm mb-6">Securing your account with email verification</p>

              {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

              {!otpSent ? (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex gap-3 text-amber-700 dark:text-amber-400 text-sm">
                    <ShieldAlert className="shrink-0" size={20} />
                    <p>Changing your password will send a verification code to <b>{user.email}</b></p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleRequestPasswordOtp}
                      disabled={loading}
                      className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Code from Email</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full text-center text-2xl font-bold py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleVerifyPassword}
                      disabled={loading || otp.length < 6 || newPassword.length < 6}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Now'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
