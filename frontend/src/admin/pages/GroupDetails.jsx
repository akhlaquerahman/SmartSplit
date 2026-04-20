import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const token = localStorage.getItem('token');

      // Fetch group details
      const groupResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch expenses for this group
      const expensesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/expenses?groupId=${id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch settlements for this group
      const settlementsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settlements?groupId=${id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGroup(groupResponse.data.group);
      setExpenses(expensesResponse.data.expenses);
      setSettlements(settlementsResponse.data.settlements);
    } catch (error) {
      console.error('Error fetching group details:', error);
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
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">{group.description || 'No description'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Receipt className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalExpenses()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <HandCoins className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Settlements</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalSettlements()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.members.map((member) => (
            <div key={member._id} className="flex items-center p-4 border border-gray-200 rounded-lg">
              <img
                className="h-10 w-10 rounded-full mr-3"
                src={member.user.avatar}
                alt={member.user.name}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses ({expenses.length})</h2>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.slice(0, 10).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full mr-3"
                    src={expense.paidBy.avatar}
                    alt={expense.paidBy.name}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">Paid by {expense.paidBy.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">₹{expense.amount}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {expenses.length > 10 && (
              <p className="text-center text-gray-500 text-sm">
                And {expenses.length - 10} more expenses...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses found for this group</p>
        )}
      </div>

      {/* Recent Settlements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Settlements ({settlements.length})</h2>
        {settlements.length > 0 ? (
          <div className="space-y-4">
            {settlements.slice(0, 10).map((settlement) => (
              <div key={settlement._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <img
                      className="h-6 w-6 rounded-full mr-2"
                      src={settlement.payerId.avatar}
                      alt={settlement.payerId.name}
                    />
                    <span className="text-sm text-gray-900">{settlement.payerId.name}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center">
                    <img
                      className="h-6 w-6 rounded-full mr-2"
                      src={settlement.receiverId.avatar}
                      alt={settlement.receiverId.name}
                    />
                    <span className="text-sm text-gray-900">{settlement.receiverId.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">₹{settlement.amount}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    settlement.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : settlement.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {settlement.status}
                  </span>
                </div>
              </div>
            ))}
            {settlements.length > 10 && (
              <p className="text-center text-gray-500 text-sm">
                And {settlements.length - 10} more settlements...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No settlements found for this group</p>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;