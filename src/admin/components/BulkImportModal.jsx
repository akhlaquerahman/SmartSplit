import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const BulkImportModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    const headers = "Name,Email,Mobile,Role\nJohn Doe,john@example.com,1234567890,user\nJane Admin,jane@example.com,0987654321,admin";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURI(headers);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "users_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim());
          const user = {};
          headers.forEach((header, index) => {
            user[header] = values[index];
          });
          data.push(user);
        }
        
        if (data.length === 0) {
          setError('The CSV file is empty.');
          return;
        }

        setParsedData(data);
        setError('');
        setStep(2);
      } catch (err) {
        setError('Error parsing the CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    onSubmit(parsedData);
    setTimeout(() => {
      // Reset state after submitting
      setStep(1);
      setParsedData([]);
      setError('');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-[#16181d] rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bulk Import Users</h2>
                <p className="text-xs font-medium text-slate-500">Step {step} of 2</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Need a template?</h4>
                    <p className="text-xs font-medium text-blue-700/70 dark:text-blue-400/70 mt-1">
                      Download our CSV template to ensure your data is formatted correctly.
                    </p>
                  </div>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Download size={14} /> Download CSV
                  </button>
                </div>

                <div 
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                    error ? "border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/5" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Click to upload CSV file</h3>
                  <p className="text-xs font-medium text-slate-500 max-w-sm">
                    Upload your filled template. Ensure all required fields (Name, Email) are present.
                  </p>
                  
                  {error && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-100/50 px-3 py-1.5 rounded-lg">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Preview Data</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">Found {parsedData.length} records to import</p>
                  </div>
                  <button 
                    onClick={() => { setStep(1); setParsedData([]); }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Upload different file
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                      <tr>
                        {Object.keys(parsedData[0] || {}).map((header, i) => (
                          <th key={i} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700/60">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {parsedData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            {step === 2 && (
              <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Submit Import
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkImportModal;
