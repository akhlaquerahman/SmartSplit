import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Eye, Calendar, DollarSign, Image, X } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupsList, setGroupsList] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchGroupsList();
  }, []);

  const fetchGroupsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/groups?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupsList(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups list:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, groupId, startDate, endDate, page]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(groupId && { groupId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/expenses?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setExpenses(response.data.expenses);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setGroupId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Expense Monitoring</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Groups</option>
            {groupsList.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      <div className="text-sm text-gray-500">{expense.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.groupId.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={expense.paidBy.avatar}
                        alt={expense.paidBy.name}
                      />
                      <div className="text-sm font-medium text-gray-900">{expense.paidBy.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{expense.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedExpense(expense)}
                      className="text-blue-600 hover:text-blue-900" 
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Expense Details</h2>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Description</p>
                    <p className="text-lg font-medium">{selectedExpense.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Group</p>
                    <p className="text-lg font-medium">{selectedExpense.groupId.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                      <p className="text-xl font-bold text-green-600">₹{selectedExpense.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Category</p>
                      <p className="text-lg font-medium">{selectedExpense.category}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Paid By</p>
                    <div className="flex items-center mt-1">
                      <img src={selectedExpense.paidBy.avatar} className="w-8 h-8 rounded-full mr-2" />
                      <p className="font-medium">{selectedExpense.paidBy.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Date</p>
                    <p className="font-medium">{new Date(selectedExpense.date).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Payment Proof</p>
                  {selectedExpense.receipt ? (
                    <div className="rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center h-64">
                      <img src={selectedExpense.receipt} alt="Proof" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center h-64 text-gray-400">
                      <Image size={48} className="mb-2 opacity-20" />
                      <p>No proof uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedExpense(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;