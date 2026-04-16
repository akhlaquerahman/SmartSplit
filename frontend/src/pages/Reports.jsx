import React, { useEffect } from 'react';
import useGroupStore from '../store/useGroupStore';
import { BarChart3, Users, PieChart, FileText } from 'lucide-react';

const Reports = () => {
  const { groups, fetchGroups, loading } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, []);

  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
  const averageMembers = groups.length ? (totalMembers / groups.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-500">Overview of your groups and member activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary-600">
            <FileText size={24} />
            <div>
              <p className="text-sm text-slate-500">Groups</p>
              <p className="text-3xl font-bold">{totalGroups}</p>
            </div>
          </div>
          <p className="text-slate-500">Total groups you are part of.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Users size={24} />
            <div>
              <p className="text-sm text-slate-500">Members</p>
              <p className="text-3xl font-bold">{totalMembers}</p>
            </div>
          </div>
          <p className="text-slate-500">Total members across all groups.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <BarChart3 size={24} />
            <div>
              <p className="text-sm text-slate-500">Avg. members</p>
              <p className="text-3xl font-bold">{averageMembers}</p>
            </div>
          </div>
          <p className="text-slate-500">Average group size across your groups.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Group health</h2>
        {loading ? (
          <div className="text-center py-10">Loading group data...</div>
        ) : groups.length === 0 ? (
          <p className="text-slate-500">No groups yet. Create a group to start seeing reports.</p>
        ) : (
          <div className="grid gap-4">
            {groups.map((group) => (
              <div key={group._id} className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-slate-500 text-sm">{group.members.length} members</p>
                  </div>
                  <span className="text-sm text-slate-400">{group.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
