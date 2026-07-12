import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { User, Mail, Calendar, MapPin, ChevronRight, Search, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/groups/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = Array.isArray(friends) ? friends.filter(friend => {
    if (!friend) return false;
    const name = friend.name || '';
    const email = friend.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Friends</h1>
          <p className="text-slate-500 mt-1">People you've shared groups and expenses with.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed flex flex-col items-center">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
            <User size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500">No friends found yet. Join groups to connect with people!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend._id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedFriend(friend)}
              className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || 'User')}&background=random`} 
                  alt={friend.name || 'User'} 
                  className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{friend.name || 'Unknown User'}</h3>
                  <p className="text-slate-500 text-sm truncate">{friend.email || 'No email provided'}</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Friend Detail Modal */}
      <AnimatePresence>
        {selectedFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedFriend(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800"
            >
              {/* Header Mesh Gradient */}
              <div className="relative h-28 flex-shrink-0 bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-600">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={16} className="stroke-[3]" />
                </button>
              </div>
              
              <div className="px-6 pb-8 -mt-14 text-center overflow-y-auto no-scrollbar">
                {/* Profile Image with Glow Ring */}
                <div className="relative inline-block mb-3.5">
                  <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-tr from-primary-500 to-indigo-500 blur-sm opacity-40 animate-pulse" />
                  <img 
                    src={selectedFriend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFriend.name || 'User')}&background=random`} 
                    alt={selectedFriend.name || 'User'} 
                    className="relative w-28 h-28 rounded-[1.75rem] mx-auto border-4 border-white dark:border-slate-900 shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-md" title="Active" />
                </div>
                
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">{selectedFriend.name || 'Unknown User'}</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 flex items-center justify-center gap-1.5 font-semibold">
                  <Mail size={12} className="opacity-70" /> {selectedFriend.email || 'No email provided'}
                </p>
                
                <div className="space-y-3.5 mt-6">
                  {/* Member Details Outline Block */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-[1.5rem] text-left border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mb-3">Member Profile Details</p>
                    <div className="space-y-3">
                      {/* Name Row */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 shrink-0">
                          <User size={14} className="text-primary-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Full Name</p>
                          <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{selectedFriend.name || 'Unknown User'}</p>
                        </div>
                      </div>

                      {/* Email Row */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 shrink-0">
                          <Mail size={14} className="text-primary-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Email Address</p>
                          <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{selectedFriend.email || 'No email provided'}</p>
                        </div>
                      </div>

                      {/* Mobile Row */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 shrink-0">
                          <Phone size={14} className="text-primary-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Mobile Number</p>
                          <p className={`font-extrabold text-xs truncate ${
                            selectedFriend.mobile ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-550 italic font-medium"
                          }`}>
                            {selectedFriend.mobile || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Level Block */}
                  <div className="p-4 bg-primary-50/20 dark:bg-primary-950/10 rounded-[1.5rem] text-left border border-primary-100/10 dark:border-primary-900/20">
                    <p className="text-[9px] uppercase font-black tracking-widest text-primary-600 dark:text-blue-400 mb-2">System Trust Verification</p>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Verified Member</p>
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-[8px] font-black rounded-md uppercase tracking-wider">100% Secure</span>
                    </div>
                  </div>
                </div>
                
                {/* Action button */}
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md shadow-primary-500/15 transition-all active:scale-98"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
