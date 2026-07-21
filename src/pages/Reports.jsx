import React, { useEffect, useState, useMemo, useRef } from 'react';
import useGroupStore from '../store/useGroupStore';
import { useReactToPrint } from 'react-to-print';
import { 
  BarChart3, 
  Users, 
  PieChart, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar,
  Clock,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReportPreview from '../components/reports/ReportPreview';
import PrintableReport from '../components/reports/PrintableReport';

const Reports = () => {
  const { groups, fetchGroups, activeGroup, fetchGroupDetails, loading } = useGroupStore();
  const [searchParams] = useSearchParams();
  const urlGroupId = searchParams.get('groupId');
  const shouldPrint = searchParams.get('print') === 'true';
  const [selectedGroupId, setSelectedGroupId] = useState(urlGroupId || null);
  const [reportDate, setReportDate] = useState(new Date());
  const reportRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    content: () => reportRef.current, // Fallback for some versions
    documentTitle: `SmartSplit_Report_${activeGroup?.name || 'Document'}`,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (urlGroupId) {
      handleGroupClick(urlGroupId).then(() => {
        if (shouldPrint) {
          setTimeout(() => {
            if (reportRef.current) handlePrint();
          }, 1000);
        }
      });
    }
  }, [urlGroupId, shouldPrint]);

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setReportDate(new Date());
    await fetchGroupDetails(groupId);
  };

  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
  const averageMembers = groups.length ? (totalMembers / groups.length).toFixed(1) : '0.0';

  if (selectedGroupId && activeGroup && activeGroup._id === selectedGroupId) {
    const { summary, expenses, settlements, members } = activeGroup;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedGroupId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back to Reports
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-3 border rounded-2xl shadow-sm transition-all bg-white dark:bg-slate-900 text-slate-600 hover:text-primary-600"
              title="Print Report"
            >
              <Printer size={20} />
            </button>
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold border border-primary-100 dark:border-primary-900/30 flex items-center gap-2">
              <Clock size={14} /> 
              Last Updated: {reportDate.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Responsive UI Preview */}
        <div className="w-full">
          <ReportPreview group={activeGroup} />
        </div>

        {/* Hidden Printable Report strictly for PDF generation */}
        <div style={{ display: 'none' }}>
          <PrintableReport ref={reportRef} group={activeGroup} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Financial Reports</h1>
        <p className="text-slate-500 text-lg">In-depth analysis and group performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border shadow-xl shadow-primary-500/5 transition-all">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-2xl w-fit mb-6">
            <FileText size={32} />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Total Groups</p>
          <p className="text-5xl font-black">{totalGroups}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border shadow-xl shadow-emerald-500/5 transition-all">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl w-fit mb-6">
            <Users size={32} />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Total Network</p>
          <p className="text-5xl font-black">{totalMembers}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border shadow-xl shadow-blue-500/5 transition-all">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl w-fit mb-6">
            <TrendingUp size={32} />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Connections</p>
          <p className="text-5xl font-black">{averageMembers}</p>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <PieChart size={28} className="text-primary-600" /> Active Groups
        </h2>
        {loading && !selectedGroupId ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            <p className="text-slate-500 font-bold">Aggregating data...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed">
            <p className="text-slate-500">No groups found. Generate your first group to start reporting.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGroupClick(group._id)}
                className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} className="text-primary-600" />
                </div>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="px-3 py-1 bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm">{group.category}</span>
                    <h3 className="text-xl font-black mt-4 mb-2 truncate">{group.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{group.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={16} />
                      <span className="text-xs font-bold">{group.members.length} members</span>
                    </div>
                    <span className="text-primary-600 font-black text-sm">View Report</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
