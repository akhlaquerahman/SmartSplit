import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, ChevronRight, Search, X } from 'lucide-react';
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`} 
                  alt={friend.name} 
                  className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{friend.name}</h3>
                  <p className="text-slate-500 text-sm truncate">{friend.email}</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedFriend(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="relative h-32 flex-shrink-0 bg-gradient-to-br from-primary-600 to-indigo-600">
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-8 pb-10 -mt-16 text-center overflow-y-auto no-scrollbar">
                <div className="relative inline-block mb-4">
                  <img 
                    src={selectedFriend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFriend.name)}&background=random`} 
                    alt={selectedFriend.name} 
                    className="w-32 h-32 rounded-[2rem] mx-auto border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg" title="Online" />
                </div>
                
                <h2 className="text-2xl font-black">{selectedFriend.name}</h2>
                <p className="text-slate-500 mb-8 flex items-center justify-center gap-2">
                  <Mail size={16} /> {selectedFriend.email}
                </p>
                
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-left border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Member Details</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
                          <User size={16} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-bold text-sm">{selectedFriend.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
                          <Mail size={16} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email Address</p>
                          <p className="font-bold text-sm truncate max-w-[200px]">{selectedFriend.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-primary-50/50 dark:bg-primary-900/10 rounded-3xl text-left border border-primary-100/50 dark:border-primary-900/20">
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary-500 mb-2">Trust Level</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-primary-900 dark:text-primary-100">Verified Member</p>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black rounded-lg uppercase">100% Secure</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="w-full mt-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
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
