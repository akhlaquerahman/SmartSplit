import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import UsersKPIs from '../components/UsersKPIs';
import UsersToolbar from '../components/UsersToolbar';
import UsersHeader from '../components/UsersHeader';
import UsersTable from '../components/UsersTable';
import UserDrawer from '../components/UserDrawer';
import BulkImportModal from '../components/BulkImportModal';
import { RefreshCw } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Selection & Drawer
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Bulk Import Modal
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchUsers();
    // Reset selection when filters change
    setSelectedUsers([]);
  }, [search, status, role, page, limit]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get(`/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        status,
        role: role !== 'all' ? role : ''
      });
      const response = await api.get(`/admin/users?${params}`);
      
      // Inject dummy isOnline status for the UI demonstration
      const enhancedUsers = response.data.users.map(u => ({
        ...u,
        isOnline: Math.random() > 0.7
      }));
      
      setUsers(enhancedUsers);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (user) => {
    setDrawerUser(user);
    setIsDrawerOpen(true);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    
    const confirmMsg = `Are you sure you want to ${action} ${selectedUsers.length} selected users?`;
    if (!window.confirm(confirmMsg)) return;
    
    // For demonstration, since bulk API doesn't exist, we will just alert.
    // In a real scenario, this would be an API call like:
    // await api.post(`/admin/users/bulk/${action}`, { userIds: selectedUsers });
    
    alert(`Bulk ${action} executed for ${selectedUsers.length} users! (Simulated)`);
    setSelectedUsers([]);
    fetchUsers();
  };

  const handleSaveUser = async (userId, updatedData) => {
    setIsSaving(true);
    try {
      const response = await api.put(`/admin/users/${userId}`, updatedData);
      
      if (updatedData.upiId !== drawerUser.upiId) {
        await api.patch(`/admin/users/${userId}/upi`, { upiId: updatedData.upiId });
      }

      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, ...updatedData, status: updatedData.status } : u));
      setDrawerUser({ ...drawerUser, ...updatedData, status: updatedData.status });
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockUser = async (userId, isCurrentlyBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, {
        isBlocked: !isCurrentlyBlocked
      });

      // Update local state
      const newStatus = !isCurrentlyBlocked;
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: newStatus, status: newStatus ? 'suspended' : 'active' } : u));
      if (drawerUser && drawerUser._id === userId) {
        setDrawerUser({ ...drawerUser, isBlocked: newStatus, status: newStatus ? 'suspended' : 'active' });
      }
    } catch (error) {
      console.error('Error updating block status:', error);
    }
  };

  const handleCreateUser = () => {
    setDrawerUser(null); // null indicates create mode
    setIsDrawerOpen(true);
  };

  const handleResetPassword = (userId) => {
    // In a real application this would hit an API endpoint
    alert(`A password reset link has been sent to the user's email address. (Simulated)`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      // Simulate API call to delete
      setUsers(users.filter(u => u._id !== userId));
      alert(`User deleted successfully. (Simulated)`);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV from current users
    if (users.length === 0) {
      alert("No users to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Joined"];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const user of users) {
      const values = [
        user._id,
        `"${(user.name || '').replace(/"/g, '""')}"`,
        `"${user.email || ''}"`,
        `"${user.mobile || user.mobileNumber || ''}"`,
        user.role,
        user.isBlocked ? 'Suspended' : (user.isVerified ? 'Verified' : 'Pending'),
        new Date(user.createdAt).toISOString()
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImportSubmit = (importedUsers) => {
    // In a real app, this would be an API call to save bulk users
    // Simulate API delay
    setLoading(true);
    setTimeout(() => {
      // Refresh list
      fetchUsers();
      setIsBulkImportOpen(false);
      alert(`Successfully imported ${importedUsers.length} users! (Simulated)`);
    }, 1000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <UsersHeader 
        onCreateUser={handleCreateUser} 
        onExportCSV={handleExportCSV} 
        onImport={() => setIsBulkImportOpen(true)} 
      />

      <UsersKPIs stats={stats} />

      <UsersToolbar 
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        role={role}
        setRole={setRole}
        selectedCount={selectedUsers.length}
        onBulkAction={handleBulkAction}
      />
      
      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Users...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <UsersTable 
            users={users}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onRowClick={handleRowClick}
            onResetPassword={handleResetPassword}
            onSuspendUser={handleBlockUser}
            onDeleteUser={handleDeleteUser}
          />
          
          {/* Pagination */}
          {(totalPages > 1 || users.length > 0) && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  Rows per page:
                </span>
                <select 
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span className="text-xs font-bold text-slate-500 ml-2">
                  Showing Page {page} of {totalPages}
                </span>
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
      <UserDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={drawerUser}
        onSave={handleSaveUser}
        onBlock={handleBlockUser}
        isSaving={isSaving}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSubmit={handleBulkImportSubmit}
      />
    </div>
  );
};

export default Users;