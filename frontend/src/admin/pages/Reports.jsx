import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, CheckCircle, X, MessageSquare } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [status, page]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        status
      });

      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReports(response.data.reports);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, status, adminNote = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/reports/${reportId}/resolve`, {
        status,
        adminNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setReports(reports.map(report =>
        report._id === reportId
          ? { ...report, status, adminNote, resolvedAt: new Date() }
          : report
      ));
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Resolved</span>;
      case 'dismissed':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Dismissed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      expense: 'bg-blue-100 text-blue-800',
      settlement: 'bg-purple-100 text-purple-800',
      group: 'bg-green-100 text-green-800',
      user: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type] || colors.other}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Reports & Disputes</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full mr-3"
                      src={report.reportedBy.avatar}
                      alt={report.reportedBy.name}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.reportedBy.name}</div>
                      <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {getTypeBadge(report.type)}
                  {getStatusBadge(report.status)}
                </div>

                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{report.reason}</h4>
                  <p className="text-gray-600">{report.description}</p>
                </div>

                {report.adminNote && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center text-sm text-blue-800 mb-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Admin Response
                    </div>
                    <p className="text-blue-700">{report.adminNote}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const note = prompt('Enter resolution note:');
                        if (note !== null) handleResolveReport(report._id, 'resolved', note);
                      }}
                      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Enter dismissal note:');
                        if (note !== null) handleResolveReport(report._id, 'dismissed', note);
                      }}
                      className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </button>
                  </>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600" title="View Details">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;