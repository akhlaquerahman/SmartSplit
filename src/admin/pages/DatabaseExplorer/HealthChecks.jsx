import React from 'react';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

const HealthChecks = () => {
  const checks = [
    { title: 'Orphaned Expenses', status: 'healthy', count: 0, description: 'Expenses without a valid group reference.' },
    { title: 'Duplicate Users', status: 'warning', count: 2, description: 'Users with the same email or phone number.' },
    { title: 'Pending Settlements', status: 'error', count: 5, description: 'Settlements pending for more than 7 days.' },
    { title: 'Missing Payment Proofs', status: 'healthy', count: 0, description: 'Completed settlements without proof.' },
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <Activity className="text-blue-500" />
          Database Health Checks
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Run automated scans to detect inconsistencies, orphans, and broken relationships in your collections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4">
            <div className="mt-1">
              {check.status === 'healthy' && <CheckCircle className="text-green-500 w-6 h-6" />}
              {check.status === 'warning' && <AlertTriangle className="text-amber-500 w-6 h-6" />}
              {check.status === 'error' && <ShieldAlert className="text-red-500 w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{check.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  check.status === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-500/20' : 
                  check.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20' : 
                  'bg-red-100 text-red-700 dark:bg-red-500/20'
                }`}>
                  {check.count > 0 ? `${check.count} found` : 'Clear'}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{check.description}</p>
              
              {check.count > 0 && (
                <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 text-center">
        <Activity className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold mb-2">Smart Data Troubleshooter</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4">
          Need to find a specific missing expense or trace a corrupted user profile? 
          Use the troubleshooter to run deep diagnostic queries across all related collections.
        </p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
          Launch Troubleshooter
        </button>
      </div>
    </div>
  );
};

export default HealthChecks;
