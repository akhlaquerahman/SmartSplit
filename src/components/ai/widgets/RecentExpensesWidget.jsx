import React, { useState, useEffect } from 'react';
import { FileText, Loader2, IndianRupee, Calendar, Clock } from 'lucide-react';
import api from '../../../utils/api';

const RecentExpensesWidget = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expenses, setExpenses] = useState([]);
  
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [fetchingExpenses, setFetchingExpenses] = useState(false);
  const [error, setError] = useState(null);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get('/groups');
        setGroups(data);
        if (data.length > 0) setSelectedGroup(data[0]._id);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch groups');
      } finally {
        setFetchingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch recent expenses for the selected group
  useEffect(() => {
    if (!selectedGroup) return;
    
    const fetchExpenses = async () => {
      setFetchingExpenses(true);
      setError(null);
      try {
        const { data } = await api.get(`/expenses/${selectedGroup}`);
        setExpenses(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch recent expenses');
      } finally {
        setFetchingExpenses(false);
      }
    };
    fetchExpenses();
  }, [selectedGroup]);

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-sm mx-auto flex flex-col h-[350px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 opacity-80" />
          <h3 className="font-medium text-sm">Recent Expenses</h3>
        </div>
        
        {/* Compact Group Selector */}
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          disabled={fetchingGroups}
          className="w-full text-xs p-1.5 border-none rounded bg-white/20 text-white placeholder-white focus:ring-1 focus:ring-white outline-none appearance-none backdrop-blur-sm cursor-pointer"
        >
          {fetchingGroups ? (
            <option className="text-gray-800">Loading...</option>
          ) : groups.length === 0 ? (
            <option className="text-gray-800" value="">No groups found</option>
          ) : (
            groups.map(g => (
              <option key={g._id} value={g._id} className="text-gray-800">{g.name}</option>
            ))
          )}
        </select>
      </div>
      
      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 thin-scrollbar">
        {error && (
          <div className="text-red-500 text-[10px] bg-red-50 p-2 rounded text-center my-2 mx-2">
            {error}
          </div>
        )}
        
        {fetchingExpenses ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-[10px] text-gray-500">Loading expenses...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 font-medium">No recent expenses</p>
            <p className="text-[10px] text-gray-400 mt-1">Expenses for this group will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {expenses.map((expense) => {
              const { date, time } = formatDateTime(expense.createdAt || expense.date);
              return (
                <div key={expense._id} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex justify-between items-center transition-all hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="text-xs font-medium text-gray-800 truncate">{expense.description}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center text-[9px] text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 opacity-70" /> {date}
                      </span>
                      <span className="flex items-center text-[9px] text-gray-500">
                        <Clock className="w-3 h-3 mr-1 opacity-70" /> {time}
                      </span>
                    </div>
                    {expense.paidBy && expense.paidBy.name && (
                      <div className="mt-1 flex items-center text-[9px] text-gray-500">
                        Paid by: <span className="font-medium text-gray-700 ml-1 truncate">{expense.paidBy.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center bg-blue-50/50 px-2 py-1 rounded">
                    <span className="text-xs font-semibold text-blue-700 font-mono">₹{expense.amount?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentExpensesWidget;
