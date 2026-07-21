import React, { useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useGroupStore from '../../../store/useGroupStore';
import useAuthStore from '../../../store/useAuthStore';

const NetBalanceCard = () => {
  const { groups, history } = useGroupStore();
  const { user } = useAuthStore();

  const stats = useMemo(() => {
    if (!user) return { owe: 0, owed: 0, netBalance: 0, pendingSettlements: 0, groupsIncluded: 0 };

    let totalBalance = 0, owe = 0, owed = 0, pendingSettlements = 0;
    
    groups.forEach(group => {
      const userBalance = group.summary?.memberBalances?.find(b => 
        (b.user?._id || b.user) === user?._id
      );
      const netBalance = userBalance?.netBalance || 0;
      
      totalBalance += netBalance;
      if (netBalance < 0) owe += Math.abs(netBalance);
      if (netBalance > 0) owed += netBalance;
    });

    const allSettlements = history.filter(h => h.type === 'settlement');
    pendingSettlements = allSettlements.filter(s => 
      s.status === 'Pending' && 
      ((s.payer?._id === user._id) || (s.receiver?._id === user._id) || (s.payer === user._id) || (s.receiver === user._id))
    ).length;

    return {
      owe: Math.round(owe * 100) / 100,
      owed: Math.round(owed * 100) / 100,
      netBalance: Math.round(totalBalance * 100) / 100,
      pendingSettlements,
      groupsIncluded: groups.length
    };
  }, [groups, history, user]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center p-3 border-b border-gray-50">
        <div className="flex items-center gap-2 text-purple-700">
          <Wallet className="w-4 h-4" />
          <h3 className="font-semibold text-sm">My Net Balance</h3>
        </div>
      </div>
      
      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-red-600 text-[10px] font-medium uppercase tracking-wide mb-1">
            <ArrowDownRight className="w-3 h-3" /> You Owe
          </div>
          <div className="text-lg font-bold text-red-700 font-mono">₹{stats.owe.toFixed(2)}</div>
        </div>
        
        <div className="bg-green-50 p-2.5 rounded-lg border border-green-100 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-green-600 text-[10px] font-medium uppercase tracking-wide mb-1">
            <ArrowUpRight className="w-3 h-3" /> You Are Owed
          </div>
          <div className="text-lg font-bold text-green-700 font-mono">₹{stats.owed.toFixed(2)}</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-purple-600 font-medium uppercase tracking-wide mb-0.5">Net Total</div>
            <div className="text-xl font-bold text-purple-800 font-mono">
              {stats.netBalance >= 0 ? '+' : '-'}₹{Math.abs(stats.netBalance).toFixed(2)}
            </div>
          </div>
          <div className="text-right flex flex-col justify-center">
            <div className="text-[10px] text-purple-600 font-medium">{stats.pendingSettlements} Pending</div>
            <div className="text-[10px] text-purple-600 opacity-80">Across {stats.groupsIncluded} Groups</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetBalanceCard;
