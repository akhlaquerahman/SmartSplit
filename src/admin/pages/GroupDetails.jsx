import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, Users, Receipt, HandCoins, Calendar, DollarSign, User } from 'lucide-react';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      
      

      // Fetch group details
      const groupResponse = await api.get(`/admin/groups/${id}`);

      console.log('Admin Group Detail Response:', groupResponse.data);

      if (groupResponse.data && groupResponse.data.group) {
        setGroup(groupResponse.data.group);
      } else {
        console.error('Group data not found in response:', groupResponse.data);
      }

      // Fetch expenses for this group
      try {
        const expensesResponse = await api.get(`/admin/expenses?groupId=${id}&limit=50`);
        setExpenses(expensesResponse.data.expenses || []);
      } catch (expErr) {
        console.error('Error fetching admin expenses:', expErr);
      }

      // Fetch settlements for this group
      try {
        const settlementsResponse = await api.get(`/admin/settlements?groupId=${id}&limit=50`);
        setSettlements(settlementsResponse.data.settlements || []);
      } catch (setErr) {
        console.error('Error fetching admin settlements:', setErr);
      }

    } catch (error) {
      console.error('Error fetching group details:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const calculateTotalSettlements = () => {
    return settlements.reduce((total, settlement) => total + settlement.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Group not found</p>
        <button
          onClick={() => navigate('/admin/groups')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/groups')}
          className="p-2 text-gray-400 hover:text-gray-650 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-xl transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{group.name}</h1>
          <p className="text-sm text-gray-550 dark:text-slate-400">{group.description || 'No description'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Members</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{group.members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
          <div className="flex items-center">
            <Receipt className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Expenses</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">₹{calculateTotalExpenses()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
          <div className="flex items-center">
            <HandCoins className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Settlements</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">₹{calculateTotalSettlements()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Created</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Members */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
        <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Group Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.members.map((member) => (
            <div key={member._id} className="flex items-center p-4 border border-gray-150 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
              <img
                className="h-10 w-10 rounded-full border border-gray-200 dark:border-slate-800 object-cover mr-3"
                src={member.user.avatar}
                alt={member.user.name}
              />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{member.user.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-450">{member.user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
        <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Recent Expenses ({expenses.length})</h2>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.slice(0, 10).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-150 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-slate-800 mr-3"
                    src={expense.paidBy?.avatar}
                    alt={expense.paidBy?.name}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-450">Paid by <span className="font-semibold">{expense.paidBy?.name}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-green-600 dark:text-green-400">₹{expense.amount}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {expenses.length > 10 && (
              <p className="text-center text-gray-500 dark:text-slate-500 text-xs font-bold">
                And {expenses.length - 10} more expenses...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-505 dark:text-slate-500 text-center py-8 text-xs font-bold">No expenses found for this group</p>
        )}
      </div>

      {/* Recent Settlements */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-808/80 p-6 shadow-sm">
        <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Recent Settlements ({settlements.length})</h2>
        {settlements.length > 0 ? (
          <div className="space-y-4">
            {settlements.slice(0, 10).map((settlement) => (
              <div key={settlement._id} className="flex items-center justify-between p-4 border border-gray-150 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <img
                      className="h-6 w-6 rounded-full object-cover border border-gray-200 dark:border-slate-800 mr-2"
                      src={settlement.payerId?.avatar}
                      alt={settlement.payerId?.name}
                    />
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-200">{settlement.payerId?.name}</span>
                  </div>
                  <span className="text-gray-400 dark:text-slate-650">→</span>
                  <div className="flex items-center">
                    <img
                      className="h-6 w-6 rounded-full object-cover border border-gray-200 dark:border-slate-800 mr-2"
                      src={settlement.receiverId?.avatar}
                      alt={settlement.receiverId?.name}
                    />
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-205">{settlement.receiverId?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mb-1">₹{settlement.amount}</p>
                  <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full border ${
                    settlement.status === 'completed'
                      ? 'bg-green-105/30 text-green-800 border-green-200/20 dark:bg-green-950/30 dark:text-green-400'
                      : settlement.status === 'rejected'
                      ? 'bg-red-105/30 text-red-800 border-red-200/20 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-yellow-105/30 text-yellow-800 border-yellow-200/20 dark:bg-yellow-950/30 dark:text-yellow-400'
                  }`}>
                    {settlement.status}
                  </span>
                </div>
              </div>
            ))}
            {settlements.length > 10 && (
              <p className="text-center text-gray-500 dark:text-slate-500 text-xs font-bold">
                And {settlements.length - 10} more settlements...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-555 dark:text-slate-550 text-center py-8 text-xs font-bold">No settlements found for this group</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;