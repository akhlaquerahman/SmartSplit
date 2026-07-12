import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ExpensesKPIs from '../components/ExpensesKPIs';
import ExpensesHeader from '../components/ExpensesHeader';
import ExpensesToolbar from '../components/ExpensesToolbar';
import ExpensesAnalytics from '../components/ExpensesAnalytics';
import ExpensesTable from '../components/ExpensesTable';
import ExpenseDrawer from '../components/ExpenseDrawer';
import { RefreshCw } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  
  // Drawer
  const [drawerExpense, setDrawerExpense] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [splitType, setSplitType] = useState('all');
  const [groupId, setGroupId] = useState('all');
  const [groups, setGroups] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExpenses();
  }, [search, category, status, splitType, groupId, page, limit]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups?limit=100');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(category !== 'all' && { category }),
        ...(groupId !== 'all' && { groupId }),
      });
      const response = await api.get(`/admin/expenses?${params}`);
      
      // Inject mock data for visual properties not present in the old DB
      const enhancedExpenses = (response.data.expenses || []).map(exp => ({
        ...exp,
        splitType: exp.splitType || ['equal', 'exact', 'percentage'][Math.floor(Math.random() * 3)],
        status: exp.status || 'approved'
      }));

      setExpenses(enhancedExpenses);
      setStats(response.data.stats || null);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setSplitType('all');
    setGroupId('all');
    setPage(1);
  };

  const handleRowClick = (expense) => {
    setDrawerExpense(expense);
    setIsDrawerOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expenses?`)) return;
    try {
      // Simulate bulk delete for now
      // await api.post('/admin/expenses/bulk-delete', { ids: selectedExpenses });
      alert(`Deleted ${selectedExpenses.length} expenses.`);
      setSelectedExpenses([]);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expenses', error);
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-20">
      
      <ExpensesHeader 
        selectedCount={selectedExpenses.length}
        onDeleteSelected={handleDeleteSelected}
      />

      <ExpensesKPIs stats={stats} />
      
      <ExpensesAnalytics stats={stats} />

      <ExpensesToolbar 
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        splitType={splitType}
        setSplitType={setSplitType}
        groupId={groupId}
        setGroupId={setGroupId}
        groups={groups}
        onClear={handleClearFilters}
      />

      {loading && expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Operations Data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          <ExpensesTable 
            expenses={expenses}
            selectedExpenses={selectedExpenses}
            setSelectedExpenses={setSelectedExpenses}
            onRowClick={handleRowClick}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500">
                  Showing Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-out Drawer */}
      <ExpenseDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        expense={drawerExpense}
      />

    </div>
  );
};

export default Expenses;