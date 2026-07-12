import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  ArrowLeft, 
  Printer, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReportPreview from '../../components/reports/ReportPreview';
import PrintableReport from '../../components/reports/PrintableReport';
import api from '../../utils/api';

const AdminReport = () => {
  const [searchParams] = useSearchParams();
  const urlGroupId = searchParams.get('groupId');
  const navigate = useNavigate();
  
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportDate, setReportDate] = useState(new Date());
  const reportRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    content: () => reportRef.current, // Fallback for some versions
    documentTitle: `SmartSplit_Admin_Report_${activeGroup?.name || 'Document'}`,
  });

  useEffect(() => {
    if (urlGroupId) {
      fetchAdminGroupDetails(urlGroupId);
    }
  }, [urlGroupId]);

  const fetchAdminGroupDetails = async (groupId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/groups/${groupId}`);
      setActiveGroup(response.data);
      setReportDate(new Date());
    } catch (err) {
      console.error('Error fetching admin group details:', err);
      setError(err.response?.data?.message || 'Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  if (!urlGroupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed text-slate-500 p-8">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No Workspace Selected</h2>
        <p className="text-center max-w-md">Please navigate to the Groups panel and select a workspace to generate its report.</p>
        <button onClick={() => navigate('/admin/groups')} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
          Go to Groups
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-slate-500 font-bold mt-4">Generating Admin Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-red-200 text-slate-500 p-8">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Error Generating Report</h2>
        <p className="text-center max-w-md text-red-500 font-medium">{error}</p>
        <button onClick={() => navigate('/admin/groups')} className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all">
          Back to Groups
        </button>
      </div>
    );
  }

  if (activeGroup) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back to Workspaces
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-3 border rounded-2xl shadow-sm transition-all bg-white dark:bg-slate-900 text-slate-600 hover:text-blue-600"
              title="Print Report"
            >
              <Printer size={20} />
            </button>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
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

  return null;
};

export default AdminReport;
