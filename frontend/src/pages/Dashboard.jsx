import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGroupStore from '../store/useGroupStore';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { groups, fetchGroups, loading } = useGroupStore();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'Trip', country: 'India' });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [friendsLoading, setFriendsLoading] = useState(false);

  const { createGroup } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showModal) {
        fetchFriends(friendSearch);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [friendSearch, showModal]);

  const fetchFriends = async (search = '') => {
    setFriendsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/groups/friends`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const success = await createGroup({ 
      ...newGroup, 
      memberEmails: selectedFriends.map(f => f.email) 
    });
    if (success) {
      setShowModal(false);
      setNewGroup({ name: '', description: '', category: 'Trip', country: 'India' });
      setSelectedFriends([]);
    }
  };

  const toggleFriendSelection = (friend) => {
    if (selectedFriends.some(f => f._id === friend._id)) {
      setSelectedFriends(selectedFriends.filter(f => f._id !== friend._id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const stats = groups.reduce((acc, group) => {
    const userBalance = group.summary?.memberBalances?.find(b => 
      (b.user?._id || b.user) === user?._id
    );
    const netBalance = userBalance?.netBalance || 0;
    
    acc.total += netBalance;
    if (netBalance < 0) acc.owe += Math.abs(netBalance);
    if (netBalance > 0) acc.owed += netBalance;
    
    return acc;
  }, { total: 0, owe: 0, owed: 0 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Here's what's happening with your expenses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          <Plus size={20} /> Create New Group
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-900/60 p-4 md:p-6 rounded-3xl border dark:border-slate-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 col-span-2 md:col-span-1 shadow-sm">
          <div>
            <p className="text-slate-500 text-xs md:text-sm mb-1 font-medium">Total Balance</p>
            <h3 className={cn(
              "text-xl md:text-2xl font-bold",
              stats.total > 0 ? "text-green-500" : stats.total < 0 ? "text-red-500" : ""
            )}>
              ₹{stats.total.toFixed(2)}
            </h3>
          </div>
          <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Wallet size={20} className="md:size-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-4 md:p-6 rounded-3xl border dark:border-slate-800/50 flex flex-col items-start justify-between gap-2 shadow-sm">
          <div>
            <p className="text-slate-500 text-xs md:text-sm mb-1 font-medium">You Owe</p>
            <h3 className="text-xl md:text-2xl font-bold text-red-500">₹{stats.owe.toFixed(2)}</h3>
          </div>
          <div className="p-2 md:p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
            <ArrowDownLeft size={20} className="md:size-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-4 md:p-6 rounded-3xl border dark:border-slate-800/50 flex flex-col items-start justify-between gap-2 shadow-sm">
          <div>
            <p className="text-slate-500 text-xs md:text-sm mb-1 font-medium">You are Owed</p>
            <h3 className="text-xl md:text-2xl font-bold text-green-500">₹{stats.owed.toFixed(2)}</h3>
          </div>
          <div className="p-2 md:p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
            <ArrowUpRight size={20} className="md:size-6" />
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={22} className="text-primary-600" /> Your Groups
        </h2>
        
        {loading && <div className="text-center py-10">Loading groups...</div>}
        
        {!loading && groups.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed flex flex-col items-center">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Plus size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 mb-6">No groups yet. Start by creating one!</p>
            <button onClick={() => setShowModal(true)} className="text-primary-600 font-bold hover:underline">
              Create your first group
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group._id} to={`/group/${group._id}`}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border hover:shadow-lg transition-all active:scale-95"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full">
                    {group.category}
                  </span>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((m, i) => (
                      <img key={i} src={m.user.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" title={m.user.name} />
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{group.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{group.description}</p>
                <div className="pt-4 border-t flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Expenses</span>
                  <span className="font-bold">₹{group.summary?.totalExpense?.toFixed(2) ?? '0.00'}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 no-scrollbar">
                <div>
                  <label className="block text-sm font-medium mb-1">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border focus:border-primary-500"
                    placeholder="e.g. Summer Trip 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border focus:border-primary-500 h-20"
                    placeholder="What's this group for?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select 
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({...newGroup, category: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border focus:border-primary-500"
                    >
                      <option value="Trip">Trip</option>
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select 
                      value={newGroup.country}
                      onChange={(e) => setNewGroup({...newGroup, country: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border focus:border-primary-500"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Add Friends</label>
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full p-2 mb-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border text-xs focus:border-primary-500"
                  />
                  <div className="space-y-2">
                    {friendsLoading ? (
                      <div className="text-center py-4 text-slate-500 text-xs">Searching...</div>
                    ) : friends.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-2">
                        {friendSearch ? "No users found" : "No friends found. Start typing to find people!"}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {friends.map(friend => {
                          const isSelected = selectedFriends.some(f => f._id === friend._id);
                          return (
                            <button
                              key={friend._id}
                              type="button"
                              onClick={() => toggleFriendSelection(friend)}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-xl border transition-all text-left",
                                isSelected ? "bg-primary-50 border-primary-500 dark:bg-primary-900/20" : "bg-white dark:bg-slate-900"
                              )}
                            >
                              <img src={friend.avatar} className="w-8 h-8 rounded-full" alt="" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{friend.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{friend.email}</p>
                              </div>
                              {isSelected && <Check size={16} className="text-primary-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
