import React from 'react';
import AIPageHeader from '../components/AIPageHeader';
import ConversationKPIs from '../components/explorer/ConversationKPIs';
import AdvancedFilters from '../components/explorer/AdvancedFilters';
import ConversationDataGrid from '../components/explorer/ConversationDataGrid';
import ConversationDrawer from '../components/explorer/ConversationDrawer';
import useExplorerStore from '../store/useExplorerStore';
import { useConversationsList, useBulkDeleteConversations } from '../hooks/useConversationExplorer';
import { useQueryClient } from '@tanstack/react-query';

const Conversations = () => {
  const { filters, openDrawer } = useExplorerStore();
  const { data, isLoading, refetch } = useConversationsList(filters);
  const bulkDelete = useBulkDeleteConversations();
  const queryClient = useQueryClient();

  const handleExport = () => {
    console.log('Exporting data...', data);
    alert('Data exported to CSV');
  };

  const handleBulkDelete = () => {
    if (window.confirm('Are you sure you want to delete these conversations?')) {
      bulkDelete.mutate([], {
        onSuccess: () => alert('Bulk delete successful')
      });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 p-2 md:p-6 pb-20 flex min-h-[calc(100vh-64px)] gap-6 relative">
      <div className="flex-1 flex flex-col w-full">
        <div className="shrink-0 mb-4">
          <AIPageHeader title="Enterprise AI Conversations" description="Real-time monitoring, diagnostic pipeline, and telemetry of the AI Agent." />
        </div>
        <div className="shrink-0 mb-6">
          <ConversationKPIs />
        </div>
        <div className="flex-1 flex flex-col relative z-10">
          <AdvancedFilters onRefresh={refetch} onExport={handleExport} onBulkDelete={handleBulkDelete} selectedCount={0} />
          <ConversationDataGrid data={data} isLoading={isLoading} onRowClick={openDrawer} />
        </div>
      </div>
      <ConversationDrawer />
    </div>
  );
};
export default Conversations;