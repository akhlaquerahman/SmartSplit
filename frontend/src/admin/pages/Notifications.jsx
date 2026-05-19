import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Check, 
  CheckSquare, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Inbox,
  Clock
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [isRead, setIsRead] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [type, isRead, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 15,
        type,
        isRead
      });

      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(response.data.notifications || []);
      setTotalPages(response.data.pages || 1);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      await axios.patch(`${baseUrl}/api/admin/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      await axios.patch(`${baseUrl}/api/admin/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      await axios.delete(`${baseUrl}/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const deleted = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'alert':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600 animate-pulse" />
            System Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor registration audits, user dispute submissions, and financial flag triggers.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Severity</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Read Status</label>
            <select
              value={isRead}
              onChange={(e) => { setIsRead(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Notifications</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center text-gray-500 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full">
              <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Your Inbox is Clear</p>
              <p className="text-sm mt-1">No notifications matched the selected filters.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border divide-y overflow-hidden">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`p-4 sm:p-5 transition-colors flex items-start gap-4 hover:bg-gray-50/50 ${
                  !notification.isRead ? 'bg-blue-50/20 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className={`p-2 rounded-lg border ${getBadgeClass(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-semibold truncate ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 gap-1 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 self-center">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="h-4.5 w-4.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
