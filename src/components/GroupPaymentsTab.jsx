import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Download, Filter, FileText, FileSpreadsheet, ArrowDownToLine } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const GroupPaymentsTab = ({ groupId, groupMembers }) => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [payerId, setPayerId] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort,
      });
      if (payerId) params.append('payerId', payerId);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      const response = await api.get(`/groups/${groupId}/payments?${params.toString()}`);
      setPayments(response.data.payments);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [groupId, pagination.page, payerId, category, startDate, endDate, sort, search]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Payments Report', 14, 15);
    
    const tableColumn = ["Date", "Description", "Category", "Paid By", "Amount"];
    const tableRows = [];

    payments.forEach(payment => {
      const paymentData = [
        new Date(payment.createdAt).toLocaleDateString(),
        payment.description,
        payment.category,
        payment.paidBy?.name || 'Unknown',
        `Rs. ${payment.amount}`
      ];
      tableRows.push(paymentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`payments_report_${groupId}.pdf`);
  };

  const handleExportExcel = () => {
    const wsData = payments.map(payment => ({
      Date: new Date(payment.createdAt).toLocaleDateString(),
      Description: payment.description,
      Category: payment.category,
      'Paid By': payment.paidBy?.name || 'Unknown',
      Amount: payment.amount
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `payments_report_${groupId}.xlsx`);
  };

  const handleExportCSV = () => {
    const wsData = payments.map(payment => ({
      Date: new Date(payment.createdAt).toLocaleDateString(),
      Description: payment.description,
      Category: payment.category,
      'Paid By': payment.paidBy?.name || 'Unknown',
      Amount: payment.amount
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_report_${groupId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-black mt-2">{formatCurrency(summary.totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Expense</p>
          <p className="text-2xl font-black mt-2">{formatCurrency(summary.averageExpense)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Largest Expense</p>
          <p className="text-2xl font-black mt-2 text-rose-600">{formatCurrency(summary.largestExpense)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reimbursed</p>
          <p className="text-2xl font-black mt-2 text-emerald-600">{formatCurrency(summary.totalReimbursed)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search descriptions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-colors" title="Export PDF">
              <FileText size={16} /> <span className="hidden md:inline">PDF</span>
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors" title="Export Excel">
              <FileSpreadsheet size={16} /> <span className="hidden md:inline">Excel</span>
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors" title="Export CSV">
              <ArrowDownToLine size={16} /> <span className="hidden md:inline">CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select 
            value={payerId} 
            onChange={e => setPayerId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm outline-none"
          >
            <option value="">All Payers</option>
            {groupMembers.map(m => (
              <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
            ))}
          </select>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm outline-none"
          >
            <option value="">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transportation</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Housing">Housing & Utilities</option>
            <option value="General">General</option>
          </select>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm outline-none"
          />
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center text-slate-500">No payments found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{payment.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {payment.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.paidBy?.avatar && <img src={payment.paidBy.avatar} alt="" className="w-6 h-6 rounded-full" />}
                        <span className="text-sm font-medium">{payment.paidBy?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPaymentsTab;
