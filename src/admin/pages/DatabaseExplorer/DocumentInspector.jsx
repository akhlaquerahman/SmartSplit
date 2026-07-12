import React, { useState } from 'react';
import api from '../../../utils/api';
import { X, Save, Trash2, RotateCcw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../../context/ThemeContext';

const DocumentInspector = ({ document, collectionName, onClose, onUpdated }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // overview, json
  const [jsonContent, setJsonContent] = useState(JSON.stringify(document, null, 2));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsedData = JSON.parse(jsonContent);
      
      // Remove immutable fields
      delete parsedData._id;
      
                  
      await api.put(`/admin/db/collections/${collectionName}/${document._id}`, parsedData);
      
      onUpdated();
    } catch (error) {
      console.error('Error updating document', error);
      alert('Failed to update: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      setDeleting(true);
                  
      await api.delete(`/admin/db/collections/${collectionName}/${document._id}`);
      
      onUpdated();
    } catch (error) {
      console.error('Error deleting document', error);
      alert('Failed to delete: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
                  
      await api.post(`/admin/db/collections/${collectionName}/restore/${document._id}`, {});
      
      onUpdated();
    } catch (error) {
      console.error('Error restoring document', error);
      alert('Failed to restore: ' + (error.response?.data?.message || error.message));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[600px] max-w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 animate-in slide-in-from-right-8">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h3 className="font-bold text-lg">Document Inspector</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">{document._id}</p>
        </div>
        <div className="flex items-center gap-2">
          {document.isDeleted ? (
            <button onClick={handleRestore} disabled={restoring} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Restore Document">
              <RotateCcw size={18} />
            </button>
          ) : (
            <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Soft Delete Document">
              <Trash2 size={18} />
            </button>
          )}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 border-b border-slate-200 dark:border-slate-800 text-sm">
        <button 
          className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'json' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('json')}
        >
          JSON Editor
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900 p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {Object.entries(document).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{key}</span>
                {typeof value === 'object' && value !== null ? (
                  <pre className="text-sm font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className={`text-sm ${value === null || value === undefined ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200'} ${typeof value === 'boolean' ? 'font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs' : ''}`}>
                    {value === null || value === undefined ? 'null' : String(value)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'json' && (
          <div className="h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={jsonContent}
              onChange={(value) => setJsonContent(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                formatOnPaste: true,
              }}
            />
          </div>
        )}
      </div>

      {activeTab === 'json' && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || jsonContent === JSON.stringify(document, null, 2)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentInspector;
