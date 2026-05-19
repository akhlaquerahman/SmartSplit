import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Flag, CheckCircle, XCircle, Clock, Trash2, X, Image } from 'lucide-react';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [groupId, setGroupId] = useState('');
  const [groupsList, setGroupsList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

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
    fetchSettlements();
  }, [status, page, groupId]);

  const fetchSettlements = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 10,
        status,
        ...(groupId && { groupId })
      });

      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/settlements?${params}`, {
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
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      await axios.patch(`${baseUrl}/api/admin/settlements/${settlementId}/flag`, {
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

  const handleDeleteSettlement = async (settlementId) => {
    if (!window.confirm('Are you sure you want to delete this settlement? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      await axios.delete(`${baseUrl}/api/admin/settlements/${settlementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSettlements(settlements.filter(s => s._id !== settlementId));
    } catch (error) {
      console.error('Error deleting settlement:', error);
      alert('Failed to delete settlement');
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
        <div className="flex flex-col sm:flex-row gap-4">
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
                  Added By
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
                    {settlement.groupId?.name || 'Deleted Group'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <img
                          className="h-6 w-6 rounded-full mr-2"
                          src={settlement.payerId?.avatar}
                          alt={settlement.payerId?.name}
                        />
                        <span className="text-sm text-gray-900">{settlement.payerId?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center">
                        <img
                          className="h-6 w-6 rounded-full mr-2"
                          src={settlement.receiverId?.avatar}
                          alt={settlement.receiverId?.name}
                        />
                        <span className="text-sm text-gray-900">{settlement.receiverId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-6 w-6 rounded-full mr-2"
                        src={settlement.addedBy?.avatar}
                        alt={settlement.addedBy?.name}
                      />
                      <span className="text-sm text-gray-900">{settlement.addedBy?.name || 'Unknown'}</span>
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
                      <button 
                        onClick={() => setSelectedSettlement(settlement)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="View Details"
                      >
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
                      <button
                        onClick={() => handleDeleteSettlement(settlement._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Settlement"
                      >
                        <Trash2 className="h-5 w-5" />
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

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Settlement Details</h2>
              <button onClick={() => setSelectedSettlement(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{selectedSettlement.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Method</p>
                      <p className="text-lg font-medium">{selectedSettlement.paymentType}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Group</p>
                    <p className="text-lg font-medium">{selectedSettlement.groupId?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">From</p>
                      <div className="flex items-center mt-1">
                        <img src={selectedSettlement.payerId?.avatar} className="w-6 h-6 rounded-full mr-2" />
                        <p className="text-sm font-medium">{selectedSettlement.payerId?.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">To</p>
                      <div className="flex items-center mt-1">
                        <img src={selectedSettlement.receiverId?.avatar} className="w-6 h-6 rounded-full mr-2" />
                        <p className="text-sm font-medium">{selectedSettlement.receiverId?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Added By</p>
                    <div className="flex items-center mt-1">
                      <img src={selectedSettlement.addedBy?.avatar} className="w-6 h-6 rounded-full mr-2" />
                      <p className="text-sm font-medium">{selectedSettlement.addedBy?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Note</p>
                    <p className="text-sm text-gray-700">{selectedSettlement.note || 'No note provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedSettlement.status)}</div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Payment Screenshot</p>
                  {selectedSettlement.screenshot ? (
                    <div className="rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center h-64">
                      <img src={selectedSettlement.screenshot} alt="Screenshot" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center h-64 text-gray-400">
                      <Image size={48} className="mb-2 opacity-20" />
                      <p>No screenshot uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedSettlement(null)}
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

export default Settlements;