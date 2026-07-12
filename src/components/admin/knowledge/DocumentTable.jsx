import React from 'react';

const getFileIcon = (type) => {
  switch(type?.toUpperCase()) {
    case 'PDF': return 'fas fa-file-pdf';
    case 'DOCX': return 'fas fa-file-word';
    case 'CSV': return 'fas fa-file-csv';
    case 'TXT': return 'fas fa-file-alt';
    default: return 'fas fa-file';
  }
};

export default function DocumentTable({ documents, isLoading, onRowClick, onDelete }) {
  if (isLoading) return <div className="table-loading">Loading documents...</div>;

  return (
    <table className="knowledge-table">
      <thead>
        <tr>
          <th>DOCUMENT</th>
          <th>STATUS</th>
          <th>CHUNKS (TOKENS)</th>
          <th>UPLOADER</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc._id} onClick={() => onRowClick(doc._id)} className="clickable-row">
            <td>
              <div className="doc-cell">
                <div className="doc-icon"><i className={getFileIcon(doc.type)}></i></div>
                <div className="doc-info">
                  <strong>{doc.title}</strong>
                  <span>{doc.type} • {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </td>
            <td>
              <span className={`status-badge ${doc.status.toLowerCase()}`}>
                {doc.status}
              </span>
            </td>
            <td>
              <div className="chunks-cell">
                <span className="chunks-count">{doc.totalChunks} chunks</span>
                {doc.totalTokens > 0 && <span className="tokens-count">~{doc.totalTokens} tkns</span>}
              </div>
            </td>
            <td>
              <span className="uploader-name">{doc.uploader ? doc.uploader.name : 'System'}</span>
            </td>
            <td>
              <div className="actions-cell">
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onRowClick(doc._id); }}><i className="fas fa-eye"></i></button>
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}><i className="fas fa-sync-alt"></i></button>
                <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(doc._id); }}><i className="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
        ))}
        {documents.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center empty-state">No documents found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
