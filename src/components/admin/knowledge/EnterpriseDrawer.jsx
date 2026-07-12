import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocumentDetails, searchPreview } from '../../../services/knowledgeApi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Search, Settings } from 'lucide-react';

export default function EnterpriseDrawer({ docId, onClose }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documentDetails', docId],
    queryFn: () => fetchDocumentDetails(docId)
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await searchPreview(searchQuery);
    setSearchResults(res.data);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full md:w-[480px] xl:w-[600px] bg-white dark:bg-[#16181d] shadow-2xl z-50 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#16181d] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                  {isLoading ? 'Loading...' : data?.data?.doc?.title || 'Document Details'}
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Knowledge Base</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : !data?.data ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Document not found
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800/60 hide-scrollbar shrink-0 px-6 bg-white dark:bg-[#16181d]">
                {['Overview', 'Chunks', 'Search Preview', 'Versions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors relative ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#111111]">
                {activeTab === 'Overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Metadata</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{data.data.doc.category}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Language</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{data.data.doc.language}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{data.data.doc.status}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Version</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">v{data.data.doc.version}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{new Date(data.data.doc.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Updated</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{new Date(data.data.doc.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{data.data.doc.totalChunks}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chunks</p>
                      </div>
                      <div className="w-px h-12 bg-slate-200 dark:bg-slate-800"></div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{data.data.doc.totalTokens}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tokens</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Chunks' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {data.data.chunks?.map(chunk => (
                      <div key={chunk._id} className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Chunk #{chunk.chunkIndex}</span>
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-widest">{chunk.tokenCount} tokens</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium font-mono whitespace-pre-wrap break-words">{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Search Preview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          value={searchQuery} 
                          onChange={e => setSearchQuery(e.target.value)} 
                          placeholder="Ask a question..."
                          onKeyDown={e => e.key === 'Enter' && handleSearch()}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900 dark:text-white"
                        />
                      </div>
                      <button onClick={handleSearch} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-colors text-sm uppercase tracking-wider">
                        Test
                      </button>
                    </div>

                    {searchResults && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Top Context Retrieved</h4>
                        {searchResults.map((res, i) => (
                          <div key={i} className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-bl-lg">
                              Sim: {(res.score * 100).toFixed(1)}%
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-mono whitespace-pre-wrap break-words">{res.payload.text}</p>
                          </div>
                        ))}
                        {searchResults.length === 0 && (
                          <div className="text-center py-10 bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60">
                            <p className="text-sm font-semibold text-slate-500">No matching context found.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Versions' && (
                  <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 border-dashed">
                    <Settings className="text-slate-400 mb-3" size={32} />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Versioning coming soon</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
