import React from 'react';

const DocumentTable = ({ documents, loading, onRowClick, selectedId }) => {
  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>No documents found.</p>
      </div>
    );
  }

  // Generate columns dynamically from the first document's keys
  // Exclude complex nested objects for table view to keep it clean, or stringify them.
  const sampleDoc = documents[0];
  const allKeys = Object.keys(sampleDoc);
  
  // Prioritize common ID and display fields
  const priorityKeys = ['_id', 'name', 'email', 'title', 'status', 'createdAt'];
  const columns = priorityKeys.filter(k => allKeys.includes(k));
  
  allKeys.forEach(k => {
    if (!columns.includes(k) && typeof sampleDoc[k] !== 'object' && columns.length < 8) {
      columns.push(k);
    }
  });

  const renderCell = (value) => {
    if (value === null || value === undefined) return <span className="text-slate-400 italic">null</span>;
    if (typeof value === 'boolean') return <span className={`px-2 py-0.5 rounded-full text-xs ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{value.toString()}</span>;
    if (typeof value === 'object') return <span className="text-slate-400 text-xs">{"{...}"}</span>;
    const str = value.toString();
    return str.length > 30 ? str.substring(0, 30) + '...' : str;
  };

  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-slate-900">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {documents.map(doc => (
            <tr 
              key={doc._id} 
              onClick={() => onRowClick(doc)}
              className={`cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-slate-800/80 ${selectedId === doc._id ? 'bg-blue-50 dark:bg-slate-800' : ''}`}
            >
              {columns.map(col => (
                <td key={col} className="px-4 py-3 max-w-[200px] truncate">
                  {renderCell(doc[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;
