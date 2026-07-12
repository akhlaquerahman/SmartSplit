import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Database, Search, Filter } from 'lucide-react';
import DocumentTable from './DocumentTable';
import DocumentInspector from './DocumentInspector';

const CollectionBrowser = ({ collections, selectedCollection, onSelectCollection }) => {
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    if (!selectedCollection) return;
    setLoading(true);
    try {
      const response = await api.get(`/admin/db/collections/${selectedCollection}`, {
        params: { page, limit: 50, search }
      });
      setDocuments(response.data.documents);
      setTotal(response.data.total);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCollection, page, search]);

  const handleRowClick = (doc) => {
    setSelectedDocument(doc);
  };

  const handleDocumentUpdated = () => {
    fetchDocuments();
    setSelectedDocument(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col h-1/3 md:h-full overflow-y-auto shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Collections</h3>
        </div>
        <div className="p-2 space-y-1">
          {collections.map(col => (
            <button
              key={col.name}
              onClick={() => { onSelectCollection(col.name); setPage(1); setSearch(''); setSelectedDocument(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${selectedCollection === col.name ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-medium' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Database size={16} className={selectedCollection === col.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                {col.name}
              </div>
              <span className="text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{col.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {!selectedCollection ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Database size={48} className="mb-4 opacity-20" />
            <p>Select a collection to view documents</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {selectedCollection}
                  <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                    {total} documents
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <DocumentTable 
                documents={documents} 
                loading={loading} 
                onRowClick={handleRowClick} 
                selectedId={selectedDocument?._id}
              />
            </div>
            
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm bg-white dark:bg-slate-900">
              <span className="text-slate-500">Showing page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Inspector Drawer */}
        {selectedDocument && (
          <DocumentInspector 
            document={selectedDocument} 
            collectionName={selectedCollection}
            onClose={() => setSelectedDocument(null)}
            onUpdated={handleDocumentUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default CollectionBrowser;
