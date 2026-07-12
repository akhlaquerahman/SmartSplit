import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import GroupsHeader from '../components/GroupsHeader';
import GroupsKPIs from '../components/GroupsKPIs';
import GroupsToolbar from '../components/GroupsToolbar';
import EnterpriseGroupCard from '../components/EnterpriseGroupCard';
import GroupsTable from '../components/GroupsTable';
import GroupDrawer from '../components/GroupDrawer';
import BulkImportModal from '../components/BulkImportModal';
import { RefreshCw, FolderSearch } from 'lucide-react';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Drawer State
  const [drawerGroup, setDrawerGroup] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [search, category, status, page]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get(`/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        search,
        status: status !== 'all' ? status : '',
        category: category !== 'all' ? category : ''
      });
      
      const response = await api.get(`/admin/groups?${params}`);
      
      // Inject some mock properties for the visual demo if they are missing
      const enhancedGroups = response.data.groups.map(g => ({
        ...g,
        isArchived: g.isArchived || false,
        budget: g.budget || 25000,
        totalExpenses: g.totalExpenses || Math.floor(Math.random() * 20000)
      }));
      
      setGroups(enhancedGroups);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (group) => {
    setDrawerGroup(group);
    setIsDrawerOpen(true);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/groups/${groupId}`);
      setGroups(groups.filter(group => group._id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete workspace.');
    }
  };

  const handleCreateWorkspace = () => {
    setDrawerGroup(null);
    setIsDrawerOpen(true);
  };

  const handleExportCSV = () => {
    if (groups.length === 0) {
      alert("No workspaces to export.");
      return;
    }
    const headers = ["ID", "Workspace Name", "Owner", "Category", "Status", "Budget", "Created"];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const group of groups) {
      const values = [
        group._id,
        `"${(group.name || '').replace(/"/g, '""')}"`,
        `"${group.createdBy?.name || ''}"`,
        group.category || 'General',
        group.isArchived ? 'Archived' : 'Active',
        group.budget || 0,
        new Date(group.createdAt).toISOString()
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workspaces_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImportSubmit = (importedGroups) => {
    setLoading(true);
    setTimeout(() => {
      fetchGroups();
      setIsBulkImportOpen(false);
      alert(`Successfully imported ${importedGroups.length} workspaces! (Simulated)`);
    }, 1000);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-20">
      <GroupsHeader 
        onCreateWorkspace={handleCreateWorkspace}
        onExportCSV={handleExportCSV}
        onImport={() => setIsBulkImportOpen(true)}
      />
      
      <GroupsKPIs stats={stats} />
      
      <GroupsToolbar 
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      {loading && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Workspaces...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm text-slate-400">
          <FolderSearch size={48} className="opacity-20 mb-2" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Workspaces Found</p>
          <p className="text-xs">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <EnterpriseGroupCard 
                  key={group._id} 
                  group={group} 
                  onClick={handleRowClick}
                  onDelete={handleDeleteGroup}
                />
              ))}
            </div>
          ) : (
            <GroupsTable 
              groups={groups}
              onRowClick={handleRowClick}
              onDeleteGroup={handleDeleteGroup}
            />
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs font-bold text-slate-500">
                Showing Page {page} of {totalPages}
              </span>
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
      <GroupDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        group={drawerGroup}
        onDelete={handleDeleteGroup}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSubmit={handleBulkImportSubmit}
      />
    </div>
  );
};

export default Groups;