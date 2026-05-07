import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGroupStore from '../store/useGroupStore';
import { Plus, Users, Check } from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Groups = () => {
  const { groups, fetchGroups, loading, createGroup } = useGroupStore();
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'Trip', country: 'India' });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [friendsLoading, setFriendsLoading] = useState(false);

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
      const response = await api.get('/groups/friends', {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your groups and open any group to settle expenses.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md shadow-primary-200 dark:shadow-none"
        >
          <Plus size={20} /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-center py-10 col-span-full">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed flex flex-col items-center col-span-full">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 mb-6">No groups yet. Create a group to start tracking expenses.</p>
            <button onClick={() => setShowModal(true)} className="text-primary-600 font-bold hover:underline">
              Create your first group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <Link key={group._id} to={`/group/${group._id}`}>
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full">
                    {group.category}
                  </span>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member, i) => (
                      <img
                        key={i}
                        src={member.user.avatar}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                        title={member.user.name}
                      />
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{group.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{group.description}</p>
                <div className="pt-4 border-t flex justify-between items-center text-sm">
                  <span className="text-slate-400">Members</span>
                  <span className="font-bold">{group.members.length}</span>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>

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
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Group Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500"
                    placeholder="e.g. Summer Trip"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500 h-20"
                    placeholder="What is this group for?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Category</label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500"
                    >
                      <option value="Trip">Trip</option>
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Country</label>
                    <select
                      value={newGroup.country}
                      onChange={(e) => setNewGroup({ ...newGroup, country: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Add Friends</label>
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

export default Groups;
