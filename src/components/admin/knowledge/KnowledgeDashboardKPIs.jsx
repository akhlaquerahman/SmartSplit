import React from 'react';

export default function KnowledgeDashboardKPIs({ data, isLoading }) {
  if (isLoading) return <div className="kpi-skeleton">Loading KPIs...</div>;
  if (!data) return null;

  return (
    <div className="knowledge-kpis">
      <div className="kpi-card">
        <h3>Total Documents</h3>
        <p className="kpi-value">{data.total}</p>
      </div>
      <div className="kpi-card">
        <h3>Indexed Documents</h3>
        <p className="kpi-value">{data.indexed}</p>
      </div>
      <div className="kpi-card">
        <h3>Total Chunks</h3>
        <p className="kpi-value">{data.totalChunks}</p>
      </div>
      <div className="kpi-card">
        <h3>Vector Count</h3>
        <p className="kpi-value">{data.totalChunks}</p>
      </div>
      <div className="kpi-card">
        <h3>Average Search Time</h3>
        <p className="kpi-value">124ms</p>
      </div>
      <div className="kpi-card">
        <h3>Training Queue</h3>
        <p className="kpi-value">{data.total - data.indexed - data.failed}</p>
      </div>
    </div>
  );
}
