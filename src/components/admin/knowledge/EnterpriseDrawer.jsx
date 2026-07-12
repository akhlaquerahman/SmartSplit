import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocumentDetails, searchPreview } from '../../../services/knowledgeApi';

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

  if (isLoading) return <div className="drawer-overlay"><div className="drawer-panel loading">Loading...</div></div>;
  if (!data?.data) return null;

  const { doc, chunks } = data.data;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{doc.title}</h2>
          <button className="btn-icon" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        <div className="drawer-tabs">
          {['Overview', 'Chunks', 'Search Preview', 'Versions'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="drawer-content">
          {activeTab === 'Overview' && (
            <div className="tab-pane">
              <div className="detail-grid">
                <div><strong>Category:</strong> {doc.category}</div>
                <div><strong>Language:</strong> {doc.language}</div>
                <div><strong>Status:</strong> {doc.status}</div>
                <div><strong>Tokens:</strong> {doc.totalTokens}</div>
                <div><strong>Chunks:</strong> {doc.totalChunks}</div>
                <div><strong>Version:</strong> v{doc.version}</div>
                <div><strong>Created:</strong> {new Date(doc.createdAt).toLocaleString()}</div>
                <div><strong>Updated:</strong> {new Date(doc.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          {activeTab === 'Chunks' && (
            <div className="tab-pane">
              <div className="chunks-list">
                {chunks?.map(chunk => (
                  <div key={chunk._id} className="chunk-card">
                    <div className="chunk-header">
                      <span>Chunk #{chunk.chunkIndex}</span>
                      <span className="badge badge-gray">{chunk.tokenCount} tokens</span>
                    </div>
                    <p className="chunk-text">{chunk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Search Preview' && (
            <div className="tab-pane search-preview">
              <div className="search-box">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Ask a question..."
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn-primary" onClick={handleSearch}>Test Search</button>
              </div>

              {searchResults && (
                <div className="search-results">
                  <h4>Top Context Retrieved</h4>
                  {searchResults.map((res, i) => (
                    <div key={i} className="result-card">
                      <div className="result-score">Sim: {(res.score * 100).toFixed(1)}%</div>
                      <p>{res.payload.text}</p>
                    </div>
                  ))}
                  {searchResults.length === 0 && <p>No results found.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Versions' && (
            <div className="tab-pane text-center">
              <p>Versioning system coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
