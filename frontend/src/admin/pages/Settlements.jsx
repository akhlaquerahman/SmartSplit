import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Flag, CheckCircle, XCircle, Clock } from 'lucide-react';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSettlements();
  }, [status, page]);

  const fetchSettlements = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        status
      });

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settlements?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSettlements(response.data.settlements);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagSettlement = async (settlementId, flagged, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/settlements/${settlementId}/flag`, {
        flagged,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setSettlements(settlements.map(settlement =>
        settlement._id === settlementId
          ? { ...settlement, isFlagged: flagged, flagReason: reason }
          : settlement
      ));
    } catch (error) {
      console.error('Error flagging settlement:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Completed</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center"><XCircle className="h-3 w-3 mr-1" />Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</span>;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Settlement Monitoring</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Settlements</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settlement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <tr key={settlement._id} className={`hover:bg-gray-50 ${settlement.isFlagged ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{settlement.paymentType}</div>
                      <div className="text-sm text-gray-500">{settlement.note || 'No note'}</div>
                      {settlement.isFlagged && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Flagged: {settlement.flagReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {settlement.groupId.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <img
                          className="h-6 w-6 rounded-full mr-2"
                          src={settlement.payerId.avatar}
                          alt={settlement.payerId.name}
                        />
                        <span className="text-sm text-gray-900">{settlement.payerId.name}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center">
                        <img
                          className="h-6 w-6 rounded-full mr-2"
                          src={settlement.receiverId.avatar}
                          alt={settlement.receiverId.name}
                        />
                        <span className="text-sm text-gray-900">{settlement.receiverId.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{settlement.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(settlement.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View Details">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter flag reason:');
                          if (reason) handleFlagSettlement(settlement._id, !settlement.isFlagged, reason);
                        }}
                        className={`p-1 rounded ${settlement.isFlagged ? 'text-red-600 hover:text-red-800' : 'text-gray-600 hover:text-gray-800'}`}
                        title={settlement.isFlagged ? 'Unflag Settlement' : 'Flag Settlement'}
                      >
                        <Flag className="h-5 w-5" />
                      </button>
                    </div>
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
    </div>
  );
};

export default Settlements;