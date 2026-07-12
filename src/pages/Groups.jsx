import React, { useEffect, useState, useMemo } from 'react';
import useGroupStore from '../store/useGroupStore';
import useAuthStore from '../store/useAuthStore';
import { Plus, Users, Check, FolderOpen, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

import WorkspaceHeader from '../components/groups/WorkspaceHeader';
import GroupsKPIs from '../components/groups/GroupsKPIs';
import GroupsToolbar from '../components/groups/GroupsToolbar';
import EnterpriseGroupCard from '../components/groups/EnterpriseGroupCard';
import InsightsAndActivityPanel from '../components/groups/InsightsAndActivityPanel';

const Groups = () => {
  const { user: currentUser } = useAuthStore();
  const { groups, fetchGroups, loading, createGroup, updateGroup, deleteGroup } = useGroupStore();
  
  // Workspace UI State
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'Trip', country: 'India' });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGroupData, setDeleteGroupData] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showModal) {
        fetchFriends(friendSearch);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [friendSearch, showModal]);

  const fetchFriends = async (searchTerm = '') => {
    setFriendsLoading(true);
    try {
      const response = await api.get('/groups/friends', {
        params: { search: searchTerm }
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

  const handleEditGroup = async (e) => {
    e.preventDefault();
    if (!editGroupData) return;
    const success = await updateGroup(editGroupData._id, {
      name: editGroupData.name,
      description: editGroupData.description,
      category: editGroupData.category,
      country: editGroupData.country
    });
    if (success) {
      setShowEditModal(false);
      setEditGroupData(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupData) return;
    const success = await deleteGroup(deleteGroupData._id);
    if (success) {
      setShowDeleteModal(false);
      setDeleteGroupData(null);
    }
  };

  const toggleFriendSelection = (friend) => {
    if (selectedFriends.some(f => f._id === friend._id)) {
      setSelectedFriends(selectedFriends.filter(f => f._id !== friend._id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(groups.map(g => g.category).filter(Boolean));
    return Array.from(cats);
  }, [groups]);

  const processedGroups = useMemo(() => {
    return groups
      .filter(g => {
        if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.description?.toLowerCase().includes(search.toLowerCase())) return false;
        if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
        // Mock status filter (active if progress < 100, settled otherwise)
        if (statusFilter !== 'all') {
          const spent = g.summary?.totalExpense || 0;
          const budget = g.budget || Math.max(spent, 1000);
          const isSettled = spent > 0 && spent >= budget;
          if (statusFilter === 'active' && isSettled) return false;
          if (statusFilter === 'settled' && !isSettled) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'highest_budget') return (b.budget || 0) - (a.budget || 0);
        if (sortOrder === 'highest_spent') return (b.summary?.totalExpense || 0) - (a.summary?.totalExpense || 0);
        if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [groups, search, categoryFilter, statusFilter, sortOrder]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-2 pb-10">
      <WorkspaceHeader onCreateGroup={() => setShowModal(true)} />
      
      {groups.length > 0 && (
        <>
          <GroupsKPIs groups={groups} />
          <GroupsToolbar 
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            categories={categories}
          />
        </>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:w-2/3 xl:w-3/4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-[#16181d] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-6">
                <FolderOpen size={48} className="text-slate-300 dark:text-slate-700" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Groups Found</h2>
              <p className="text-slate-500 font-medium mb-8 max-w-sm text-balance">
                Your workspace is empty. Create a group to start tracking expenses and collaborating with your team.
              </p>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2"
              >
                <Plus size={20} /> Create Your First Group
              </button>
            </div>
          ) : processedGroups.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#16181d] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-slate-500 font-medium mb-4">No groups match your current filters.</p>
              <button 
                onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }} 
                className="text-primary-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"
            )}>
              {processedGroups.map((group) => (
                <EnterpriseGroupCard 
                  key={group._id} 
                  group={group} 
                  currentUser={currentUser}
                  viewMode={viewMode} 
                  onEdit={(g) => {
                    setEditGroupData({
                      _id: g._id,
                      name: g.name,
                      description: g.description,
                      category: g.category || 'Trip',
                      country: g.country || 'India'
                    });
                    setShowEditModal(true);
                  }}
                  onDelete={(g) => {
                    setDeleteGroupData(g);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">Create Workspace Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 hide-scrollbar">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all"
                      placeholder="e.g. Q3 Marketing Budget"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 h-24 resize-none transition-all"
                      placeholder="What is this group for?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Category</label>
                      <select
                        value={newGroup.category}
                        onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all cursor-pointer"
                      >
                        <option value="Trip">Trip</option>
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Country</label>
                      <select
                        value={newGroup.country}
                        onChange={(e) => setNewGroup({ ...newGroup, country: e.target.value })}
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all cursor-pointer"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-2">Add Members</label>
                    <input
                      type="text"
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      placeholder="Search directory..."
                      className="w-full p-3 mb-3 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-sm font-medium transition-all focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="space-y-2 border border-slate-100 dark:border-slate-800/50 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/20 max-h-48 overflow-y-auto hide-scrollbar">
                      {friendsLoading ? (
                        <div className="text-center py-4 text-slate-400 text-xs font-medium">Searching directory...</div>
                      ) : friends.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">
                          {friendSearch ? "No users found" : "Search to add members"}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-1.5">
                          {friends.map(friend => {
                            const isSelected = selectedFriends.some(f => f._id === friend._id);
                            return (
                              <button
                                key={friend._id}
                                type="button"
                                onClick={() => toggleFriendSelection(friend)}
                                className={cn(
                                  "flex items-center gap-3 p-2.5 rounded-lg transition-all text-left group",
                                  isSelected ? "bg-primary-50 dark:bg-primary-500/10" : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                                )}
                              >
                                <img src={friend.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" alt="" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{friend.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate font-medium">{friend.email}</p>
                                </div>
                                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center transition-colors border", isSelected ? "bg-primary-600 border-primary-600 text-white" : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400")}>
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && editGroupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">Edit Group</h2>
              <form onSubmit={handleEditGroup} className="space-y-4">
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 hide-scrollbar">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={editGroupData.name}
                      onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</label>
                    <textarea
                      value={editGroupData.description}
                      onChange={(e) => setEditGroupData({ ...editGroupData, description: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 h-24 resize-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Category</label>
                      <select
                        value={editGroupData.category}
                        onChange={(e) => setEditGroupData({ ...editGroupData, category: e.target.value })}
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all cursor-pointer"
                      >
                        <option value="Trip">Trip</option>
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Country</label>
                      <select
                        value={editGroupData.country}
                        onChange={(e) => setEditGroupData({ ...editGroupData, country: e.target.value })}
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 font-bold transition-all cursor-pointer"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Group Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteGroupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Delete Group?</h2>
              <p className="text-sm font-medium text-slate-500 mb-6 text-balance">
                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteGroupData.name}"</span>? This action will permanently remove all expenses, members, and settlement records associated with this group. This cannot be undone.
              </p>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95"
                >
                  Yes, Delete Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Groups;

