import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../../utils/api';

const CreateGroupWizard = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/groups', { name, description, category });
      setSuccess(true);
      // Event to refresh groups could be dispatched here
      window.dispatchEvent(new Event('refreshGroups'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center justify-center space-y-3 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h3 className="text-green-800 font-medium">Group Created Successfully</h3>
        <p className="text-green-600 text-sm text-center">Your new group is ready. You can now add members and expenses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Users className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-800">Create New Group</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Group Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Goa Trip 2026"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            placeholder="Optional details..."
            rows="2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white transition-all"
          >
            <option value="Trip">Trip</option>
            <option value="Home">Home</option>
            <option value="Couple">Couple</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Group
        </button>
      </form>
    </div>
  );
};

export default CreateGroupWizard;
