import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/useGroupStore';
import useAuthStore from '../store/useAuthStore';
import { Plus, ChevronLeft, Receipt, CheckCircle, HandCoins, UserPlus, Info, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeGroup,
    expenses,
    settlements,
    fetchGroupDetails,
    addExpense,
    addMember,
    removeMember,
    createSettlement,
    respondSettlement,
    loading,
    error
  } = useGroupStore();
  const { user: currentUser } = useAuthStore();

  const [tab, setTab] = useState('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'General',
    splitType: 'equal'
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [customShares, setCustomShares] = useState({});
  const [expenseError, setExpenseError] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    receiverId: '',
    amount: '',
    paymentType: 'UPI',
    screenshot: '',
    note: ''
  });

  const handleScreenshotUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettlementForm((prev) => ({ ...prev, screenshot: reader.result }));
    };
    reader.readAsDataURL(file);
  };
  const [settlementError, setSettlementError] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  useEffect(() => {
    fetchGroupDetails(id);
  }, [id]);

  useEffect(() => {
    if (activeGroup) {
      const ids = activeGroup.members.map((member) => member.user._id);
      setSelectedParticipants(ids);
      const initialShares = ids.reduce((acc, userId) => ({ ...acc, [userId]: '' }), {});
      setCustomShares(initialShares);
      setSettlementForm((prev) => ({
        ...prev,
        receiverId: ids.find((userId) => userId !== currentUser?._id) || ids[0] || ''
      }));
    }
  }, [activeGroup, currentUser]);

  const currentMemberBalance = useMemo(() => {
    if (!activeGroup?.summary?.memberBalances) return 0;
    const record = activeGroup.summary.memberBalances.find(
      (member) => member.user.toString() === currentUser?._id
    );
    return record ? record.balance : 0;
  }, [activeGroup, currentUser]);

  const totalExpense = activeGroup?.summary?.totalExpense ?? 0;
  const costPerPerson = activeGroup?.members?.length ? totalExpense / activeGroup.members.length : 0;
  const pendingRequests = settlements.filter((settlement) => settlement.status === 'pending');
  const paidMostName = activeGroup?.summary?.paidMost
    ? activeGroup.members.find((member) => member.user._id === activeGroup.summary.paidMost.userId)?.user.name
    : 'No activity yet';
  const owesMostName = activeGroup?.summary?.owesMost
    ? activeGroup.members.find((member) => member.user._id === activeGroup.summary.owesMost.userId)?.user.name
    : 'No activity yet';

  const handleToggleParticipant = (userId) => {
    setSelectedParticipants((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const updateCustomShare = (userId, value) => {
    setCustomShares((current) => ({ ...current, [userId]: value }));
  };

  const previewShares = useMemo(() => {
    const amount = parseFloat(expenseForm.amount) || 0;
    if (selectedParticipants.length === 0 || !activeGroup) return [];

    if (expenseForm.splitType === 'equal') {
      const baseShare = Number((amount / selectedParticipants.length).toFixed(2));
      return selectedParticipants.map((userId, index) => {
        const member = activeGroup.members.find((item) => item.user._id === userId);
        let shareAmount;
        if (index === selectedParticipants.length - 1) {
          shareAmount = Number((amount - (baseShare * (selectedParticipants.length - 1))).toFixed(2));
        } else {
          shareAmount = baseShare;
        }
        return { userId, name: member?.user.name || 'Member', amount: shareAmount || 0 };
      });
    }

    return selectedParticipants.map((userId) => {
      const member = activeGroup.members.find((item) => item.user._id === userId);
      return { userId, name: member?.user.name || 'Member', amount: Number(customShares[userId] || 0) };
    });
  }, [expenseForm.amount, expenseForm.splitType, selectedParticipants, customShares, activeGroup]);

  const memberPayments = useMemo(() => {
    if (!activeGroup) return [];

    return activeGroup.members.map((member) => {
      const memberId = member.user._id || member.user;
      const paid = expenses.reduce((sum, expense) => {
        const payerId = expense.paidBy?._id?.toString() || expense.paidBy?.toString();
        return payerId === memberId.toString() ? sum + expense.amount : sum;
      }, 0);
      const balanceRecord = activeGroup.summary.memberBalances.find((record) => {
        const recordId = record.user._id ? record.user._id.toString() : record.user.toString();
        return recordId === memberId.toString();
      });
      return {
        id: memberId.toString(),
        name: member.user.name,
        paid,
        balance: balanceRecord?.balance || 0
      };
    });
  }, [activeGroup, expenses]);

  const currentMemberPaid = memberPayments.find((member) => member.id === currentUser?._id)?.paid || 0;
  const currentMemberOwed = memberPayments.find((member) => member.id === currentUser?._id)?.balance || 0;

  const settlementTotalsByMember = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.members.map((member) => {
      const memberId = member.user._id;
      const completedSettlements = settlements.filter((settlement) => settlement.status === 'completed');
      const received = completedSettlements.reduce((sum, settlement) => {
        const receiverId = settlement.receiverId?._id?.toString() || settlement.receiverId?.toString();
        return receiverId === memberId ? sum + settlement.amount : sum;
      }, 0);
      const given = completedSettlements.reduce((sum, settlement) => {
        const payerId = settlement.payerId?._id?.toString() || settlement.payerId?.toString();
        return payerId === memberId ? sum + settlement.amount : sum;
      }, 0);
      const expenseRecord = memberPayments.find((record) => record.id === memberId);
      const spent = expenseRecord?.paid || 0;
      const net = spent - costPerPerson;
      return {
        id: memberId,
        name: member.user.name,
        received,
        given,
        spent,
        net,
      };
    });
  }, [activeGroup, settlements, memberPayments, costPerPerson]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeGroup) return;
    setExpenseError('');
    setIsSubmittingExpense(true);

    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) {
      setExpenseError('Please enter a valid amount greater than zero.');
      setIsSubmittingExpense(false);
      return;
    }

    if (selectedParticipants.length === 0) {
      setExpenseError('Please select at least one participant.');
      setIsSubmittingExpense(false);
      return;
    }

    const baseShare = Number((amount / selectedParticipants.length).toFixed(2));
    const splitDetails = selectedParticipants.map((userId, index) => {
      let shareAmount;
      if (expenseForm.splitType === 'equal') {
        if (index === selectedParticipants.length - 1) {
          shareAmount = Number((amount - (baseShare * (selectedParticipants.length - 1))).toFixed(2));
        } else {
          shareAmount = baseShare;
        }
      } else {
        shareAmount = Number(customShares[userId] || 0);
      }
      return { user: userId, amount: shareAmount };
    });

    const splitSum = splitDetails.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(splitSum - amount) > 0.1) {
      setExpenseError('Split amount does not match total expense. Please adjust the shares.');
      setIsSubmittingExpense(false);
      return;
    }

    const success = await addExpense({
      ...expenseForm,
      amount,
      groupId: id,
      splitDetails
    });

    if (success) {
      await fetchGroupDetails(id);
      setShowExpenseModal(false);
      setExpenseForm({ description: '', amount: '', category: 'General', splitType: 'equal' });
      setSelectedParticipants(activeGroup.members.map((member) => member.user._id));
      setCustomShares(activeGroup.members.reduce((acc, member) => ({ ...acc, [member.user._id]: '' }), {}));
      setTab('expenses');
      setExpenseError('');
    } else {
      setExpenseError(error || 'Unable to add expense. Please try again.');
    }

    setIsSubmittingExpense(false);
  };

  const handleAddMember = async () => {
    if (!activeGroup || !memberEmail) return;
    const success = await addMember(activeGroup._id, memberEmail);
    if (success) {
      setMemberEmail('');
      setShowAddMember(false);
    }
  };

  const handleCreateSettlement = async () => {
    if (!activeGroup) return;
    if (!settlementForm.receiverId) {
      setSettlementError('Please select the member you want to send the payment request to.');
      return;
    }
    const amount = Number(settlementForm.amount);
    if (!amount || amount <= 0) {
      setSettlementError('Enter a valid settlement amount.');
      return;
    }

    setSettlementError('');
    const success = await createSettlement({
      groupId: activeGroup._id,
      receiverId: settlementForm.receiverId,
      amount,
      paymentType: settlementForm.paymentType,
      screenshot: settlementForm.screenshot,
      note: settlementForm.note
    });
    if (success) {
      setShowSettlementModal(false);
      setSettlementForm({ receiverId: '', amount: '', paymentType: 'UPI', screenshot: '', note: '' });
    } else {
      setSettlementError(error || 'Failed to send settlement request.');
    }
  };

  const renderSettlementStatus = (status) => {
    const statusClass = status === 'pending'
      ? 'bg-amber-100 text-amber-700'
      : status === 'completed'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-rose-100 text-rose-700';

    const label = status === 'pending' ? 'Pending' : status === 'completed' ? 'Accepted' : 'Declined';

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
        {label}
      </span>
    );
  };

  const handleRespond = async (settlementId, action) => {
    if (!activeGroup) return;
    await respondSettlement(settlementId, action, activeGroup._id);
  };

  useEffect(() => {
    if (showSettlementModal) {
      setSettlementError('');
    }
  }, [showSettlementModal]);

  if (loading && !activeGroup) return <div className="text-center py-20">Loading group details...</div>;
  if (!activeGroup) return <div className="text-center py-20">{error || 'Group not found'}</div>;

  const isAdmin = activeGroup?.members?.some(
    (member) => member.user?._id === currentUser?._id && member.role === 'admin'
  );

  const balanceLabel = currentMemberBalance < 0
    ? `You owe ₹${Math.abs(currentMemberBalance).toFixed(2)}`
    : `You are owed ₹${currentMemberBalance.toFixed(2)}`;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex items-center gap-3 px-1 md:px-0">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold truncate">Group Details</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{activeGroup.name}</h2>
              <p className="text-slate-500 mt-1 text-sm">{activeGroup.description}</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button onClick={() => setShowExpenseModal(true)} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-4 py-3 text-sm font-bold transition-all shadow-lg shadow-primary-200 dark:shadow-none">
                <Plus size={18} /> Expense
              </button>
              {isAdmin && (
                <button onClick={() => setShowAddMember(true)} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm font-bold transition-all">
                  <UserPlus size={18} /> Member
                </button>
              )}
              <button onClick={() => setShowSettlementModal(true)} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm font-bold transition-all">
                <HandCoins size={18} /> Settle
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-5">
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total spent</p>
              <p className="text-xl font-bold mt-1">₹{totalExpense.toFixed(0)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Paid by you</p>
              <p className="text-xl font-bold mt-1 text-emerald-600">₹{currentMemberPaid.toFixed(0)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{currentMemberOwed < 0 ? 'You owe' : 'Owed to you'}</p>
              <p className={`text-xl font-bold mt-1 ${currentMemberOwed < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{Math.abs(currentMemberOwed).toFixed(0)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Members</p>
              <p className="text-xl font-bold mt-1">{activeGroup.members.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border col-span-2 lg:col-span-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pending</p>
              <p className="text-xl font-bold mt-1">{pendingRequests.length}</p>
            </div>
          </div>

          <div className="mt-8 flex overflow-x-auto no-scrollbar gap-2 -mx-2 px-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'members', label: 'Members' },
              { key: 'settlements', label: 'Settlements' }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap',
                  tab === item.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Group overview</h2>
                  <p className="text-slate-500 text-sm">A quick summary of current group activity and settlement health.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm text-slate-500">Total expenses</p>
                  <p className="mt-3 text-2xl font-bold">₹{totalExpense.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm text-slate-500">Average cost per person</p>
                  <p className="mt-3 text-2xl font-bold">₹{costPerPerson.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm text-slate-500">Pending settlements</p>
                  <p className="mt-3 text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm text-slate-500">Resolved settlements</p>
                  <p className="mt-3 text-2xl font-bold">{settlements.filter((item) => item.status !== 'pending').length}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950 p-6 border">
                <p className="text-sm text-slate-500">Group health</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border">
                    <p className="text-sm text-slate-500">Top payer</p>
                    <p className="mt-2 font-semibold">{paidMostName}</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border">
                    <p className="text-sm text-slate-500">Highest owed</p>
                    <p className="mt-2 font-semibold">{owesMostName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950 p-6 border">
                <p className="text-sm text-slate-500">Quick actions</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowExpenseModal(true)} className="rounded-2xl bg-primary-600 text-white py-3 font-semibold">Add Expense</button>
                  {isAdmin && <button onClick={() => setShowAddMember(true)} className="rounded-2xl border border-slate-200 py-3 font-semibold">Invite Member</button>}
                  <button onClick={() => setShowSettlementModal(true)} className="rounded-2xl border border-slate-200 py-3 font-semibold">Request Settlement</button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-6 md:p-8 border">
              <h2 className="text-xl font-bold mb-4">Member settlement totals</h2>
              <p className="text-slate-500 text-sm">Current received, given and net position for every member.</p>
              <div className="mt-6 space-y-4">
                {settlementTotalsByMember.map((member) => {
                  const totalOutflow = member.spent + member.given - member.received;
                  const remaining = costPerPerson - totalOutflow;
                  const isGiving = remaining > 0;
                  const displayAmount = Math.abs(remaining);
                  const netLabel = isGiving ? 'Net give' : 'Net receive';
                  return (
                    <div key={member.id} className="rounded-[1.5rem] bg-white dark:bg-slate-900 p-5 border shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{member.name}</p>
                          <p className="mt-2 text-lg font-semibold">₹{displayAmount.toFixed(2)}</p>
                        </div>
                        <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600">{netLabel}</div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Received</p>
                          <p className="mt-2 font-semibold text-emerald-600">₹{member.received.toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Given</p>
                          <p className="mt-2 font-semibold text-rose-600">₹{member.given.toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Spent</p>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">₹{member.spent.toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">{isGiving ? 'Give' : 'Receive'}</p>
                          <p className={`mt-2 font-semibold ${isGiving ? 'text-rose-600' : 'text-emerald-600'}`}>₹{displayAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'expenses' && (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Expense History</h2>
                  <p className="text-slate-500 text-sm">Track every spend in the group.</p>
                </div>
                <button onClick={() => setShowExpenseModal(true)} className="rounded-2xl bg-primary-600 text-white px-4 py-2 font-semibold">Add Expense</button>
              </div>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <Receipt size={40} className="mx-auto mb-4" />
                    No expenses recorded yet.
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense._id} className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{new Date(expense.createdAt).toLocaleDateString()}</p>
                          <p className="font-semibold">{expense.description}</p>
                          <p className="text-xs text-slate-400">Paid by {expense.paidBy?.name === currentUser?.name ? 'You' : expense.paidBy?.name}</p>
                        </div>
                        <div className="text-right md:text-left">
                          <p className="text-lg font-semibold">₹{expense.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{expense.category || 'General'}</p>
                        </div>
                      </div>
                      {expense.splitDetails?.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-white dark:bg-slate-900 p-4 border">
                          <p className="text-sm text-slate-500 mb-2">Split breakdown</p>
                          <div className="grid gap-2">
                            {expense.splitDetails.map((split) => {
                              const member = activeGroup.members.find((item) => item.user._id === split.user || item.user._id === split.user?._id || item.user._id === split.user?.toString());
                              const memberName = member?.user.name || (split.user?.name || 'Member');
                              return (
                                <div key={split.user?._id || split.user} className="flex items-center justify-between text-sm text-slate-600">
                                  <span>{memberName}</span>
                                  <span>₹{split.amount.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 border">
              <h2 className="text-xl font-bold mb-4">Expense insights</h2>
              <p className="text-slate-500 text-sm">See how spending is distributed across members and categories.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Most recent expense</p>
                  <p className="mt-2 font-semibold">{expenses[0]?.description || 'No expenses yet'}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Average expense</p>
                  <p className="mt-2 font-semibold">₹{expenses.length ? (expenses.reduce((sum, item) => sum + item.amount, 0) / expenses.length).toFixed(2) : '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Member Ledger</h2>
                  <p className="text-slate-500 text-sm">Manage membership and review balances.</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowAddMember(true)} className="rounded-2xl bg-primary-600 text-white px-4 py-2 font-semibold">Invite Member</button>
                )}
              </div>
              <div className="space-y-3">
                {activeGroup.members.map((member) => {
                  const memberBalance = activeGroup.summary.memberBalances.find((record) => record.user.toString() === member.user._id)?.balance || 0;
                  return (
                    <div key={member.user._id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border">
                      <div className="flex items-center gap-3">
                        <img src={member.user.avatar} className="w-12 h-12 rounded-full" />
                        <div>
                          <p className="font-semibold">{member.user.name}</p>
                          <p className="text-xs text-slate-500">{member.role === 'admin' ? 'Admin' : 'Member'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{memberBalance >= 0 ? `₹${memberBalance.toFixed(2)} owed` : `Owes ₹${Math.abs(memberBalance).toFixed(2)}`}</p>
                        {isAdmin && member.user._id !== currentUser._id && (
                          <button onClick={() => removeMember(activeGroup._id, member.user._id)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 border">
              <h2 className="text-xl font-bold mb-4">Member health</h2>
              <div className="space-y-4">
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Total members</p>
                  <p className="mt-2 text-2xl font-bold">{activeGroup.members.length}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Admins</p>
                  <p className="mt-2 text-2xl font-bold">{activeGroup.members.filter((member) => member.role === 'admin').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'settlements' && (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Settlements</h2>
                  <p className="text-slate-500 text-sm">Manage pending payments and history.</p>
                </div>
                <button onClick={() => setShowSettlementModal(true)} className="rounded-2xl bg-primary-600 text-white px-4 py-2 font-semibold">New request</button>
              </div>
              <div className="space-y-4">
                {settlements.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <HandCoins size={40} className="mx-auto mb-4" />
                    No settlement requests yet.
                  </div>
                ) : (
                  settlements.map((settlement) => (
                    <div key={settlement._id} className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{new Date(settlement.createdAt).toLocaleDateString()}</p>
                          <p className="font-semibold">{settlement.status === 'pending' ? 'Pending payment' : settlement.status === 'completed' ? 'Accepted' : 'Declined'}</p>
                          <p className="text-sm text-slate-500">{settlement.note || 'No description'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">₹{settlement.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{settlement.paymentType}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span>{renderSettlementStatus(settlement.status)}</span>
                        <button
                          onClick={() => setSelectedSettlement(settlement)}
                          className="rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-sm font-semibold"
                        >
                          View receipt
                        </button>
                      </div>
                      {settlement.status === 'pending' && (
                        <div className="mt-4 text-sm text-slate-600">
                          {settlement.payerId?._id?.toString() === currentUser?._id?.toString() || settlement.payerId?.toString() === currentUser?._id?.toString()
                            ? `Request sent to ${settlement.receiverId?.name || 'selected member'}`
                            : `Request received from ${settlement.payerId?.name || 'payer'}`}
                      </div>
                      )}
                      {settlement.status === 'pending' &&
                        (settlement.receiverId?._id?.toString() === currentUser?._id?.toString() || settlement.receiverId?.toString() === currentUser?._id?.toString()) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => handleRespond(settlement._id, 'accept')} className="rounded-2xl bg-primary-600 text-white px-4 py-2 text-sm font-semibold">Accept</button>
                          <button onClick={() => handleRespond(settlement._id, 'reject')} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">Decline</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 border">
              <h2 className="text-xl font-bold mb-4">Settlement summary</h2>
              <div className="space-y-4">
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Pending requests</p>
                  <p className="mt-2 text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Resolved requests</p>
                  <p className="mt-2 text-2xl font-bold">{settlements.filter((item) => item.status !== 'pending').length}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Total cost per person</p>
                  <p className="mt-2 text-2xl font-bold">₹{activeGroup.members.length ? (totalExpense / activeGroup.members.length).toFixed(2) : '0.00'}</p>
                  <p className="mt-2 text-xs text-slate-500">Average cost across all group members</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Member settlement totals</p>
                  <div className="mt-4 space-y-3">
                    {settlementTotalsByMember.map((member) => {
                      const remaining = costPerPerson - (member.spent + member.given - member.received);
                      const remainingLabel = remaining > 0 ? 'Give' : 'Receive';
                      const remainingValue = Math.abs(remaining).toFixed(2);
                      return (
                        <div key={member.id} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border">
                          <p className="font-semibold">{member.name}</p>
                          <div className="mt-2 grid grid-cols-4 gap-3 text-sm text-slate-600">
                            <div>
                              <p className="text-slate-500">Received</p>
                              <p className="font-semibold text-emerald-600">₹{member.received.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Given</p>
                              <p className="font-semibold text-rose-600">₹{member.given.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Spent</p>
                              <p className="font-semibold text-slate-700">₹{member.spent.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">{remainingLabel}</p>
                              <p className={`font-semibold ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{remainingValue}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-hidden mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4 overflow-y-auto pr-1 max-h-[calc(100vh-14rem)]">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Description <Info size={14} className="text-slate-300" />
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    placeholder="e.g. Pizza Night"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Split type</label>
                    <select
                      value={expenseForm.splitType}
                      onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    >
                      <option value="equal">Equal</option>
                      <option value="unequal">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                  <p className="text-sm font-semibold mb-3">Participants</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeGroup.members.map((member) => {
                      const checked = selectedParticipants.includes(member.user._id);
                      return (
                        <label key={member.user._id} className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:border-primary-500">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleParticipant(member.user._id)}
                            className="h-4 w-4 accent-primary-600"
                          />
                          <span className="text-sm font-medium">{member.user.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {expenseForm.splitType === 'unequal' && (
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                    <p className="text-sm font-semibold mb-3">Custom share amounts</p>
                    <div className="space-y-3">
                      {activeGroup.members
                        .filter((member) => selectedParticipants.includes(member.user._id))
                        .map((member) => (
                          <div key={member.user._id} className="flex items-center gap-3">
                            <img src={member.user.avatar} className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{member.user.name}</p>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={customShares[member.user._id] ?? ''}
                                onChange={(e) => updateCustomShare(member.user._id, e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-900 rounded-2xl border focus:border-primary-500 outline-none"
                                placeholder="Share amount"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {expenseError && (
                  <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600 p-4 text-sm text-rose-700 dark:text-rose-200">
                    {expenseError}
                  </div>
                )}

                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm font-semibold mb-3">Preview</p>
                  <div className="grid grid-cols-1 gap-3">
                    {previewShares.map((item) => (
                      <div key={item.userId} className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-3 border">
                        <span className="text-sm">{item.name}</span>
                        <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="w-full px-4 py-4 rounded-2xl border font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingExpense}
                    className="w-full px-4 py-4 rounded-2xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMember && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-md shadow-2xl max-h-[calc(100vh-4rem)] overflow-hidden mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Invite Member</h3>
                  <p className="text-slate-500 text-sm">Add someone to this group by email.</p>
                </div>
                <button onClick={() => setShowAddMember(false)} className="text-slate-500 hover:text-slate-900">Close</button>
              </div>
              <div className="space-y-4">
                <input
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  type="email"
                  placeholder="member@example.com"
                  className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                />
                <button onClick={handleAddMember} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-semibold">Invite</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettlementModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-lg shadow-2xl max-h-[calc(100vh-4rem)] overflow-hidden mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Request Settlement</h3>
                  <p className="text-slate-500 text-sm">Create a pending payment request for a group member.</p>
                </div>
                <button onClick={() => setShowSettlementModal(false)} className="text-slate-500 hover:text-slate-900">Close</button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 max-h-[calc(100vh-16rem)]">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Payer</p>
                  <div className="rounded-2xl border bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-700 dark:text-slate-200">
                    {currentUser?.name} (You)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select the member you will give money to</label>
                  <select
                    value={settlementForm.receiverId}
                    onChange={(e) => setSettlementForm({ ...settlementForm, receiverId: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="">Choose member</option>
                    {activeGroup.members
                      .filter((member) => member.user?._id !== currentUser?._id)
                      .map((member) => (
                        <option key={member.user?._id} value={member.user?._id}>{member.user?.name}</option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Choose the user who should receive this settlement request.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settlementForm.amount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, amount: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment type</label>
                  <select
                    value={settlementForm.paymentType}
                    onChange={(e) => setSettlementForm({ ...settlementForm, paymentType: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="w-full rounded-2xl border bg-slate-50 dark:bg-slate-950 p-2 text-sm text-slate-700 dark:text-slate-200"
                  />
                  {settlementForm.screenshot && (
                    <p className="mt-2 text-sm text-slate-500 truncate">Image ready to upload</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <textarea
                    value={settlementForm.note}
                    onChange={(e) => setSettlementForm({ ...settlementForm, note: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                    rows="3"
                    placeholder="Optional details for the request"
                  />
                </div>
                {settlementError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{settlementError}</div>
                )}
                {error && !settlementError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
                )}
                <button onClick={handleCreateSettlement} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-semibold">Send payment request</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSettlement && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-hidden mx-auto">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Settlement receipt</h3>
                  <p className="text-slate-500 text-sm">Detailed payment record for this settlement request.</p>
                </div>
                <button onClick={() => setSelectedSettlement(null)} className="text-slate-500 hover:text-slate-900">Close</button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] overflow-y-auto pr-1 max-h-[calc(100vh-16rem)]">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Status</p>
                    <div className="mt-3">{renderSettlementStatus(selectedSettlement.status)}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="mt-3 text-3xl font-bold">₹{selectedSettlement.amount.toFixed(2)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Payment type</p>
                    <p className="mt-3 font-semibold">{selectedSettlement.paymentType}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Requested on</p>
                    <p className="mt-3 font-semibold">{new Date(selectedSettlement.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">From</p>
                    <p className="mt-3 font-semibold">{selectedSettlement.payerId?.name || selectedSettlement.payerId?.email || 'Unknown'}</p>
                    <p className="text-sm text-slate-400">Payer</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">To</p>
                    <p className="mt-3 font-semibold">{selectedSettlement.receiverId?.name || selectedSettlement.receiverId?.email || 'Unknown'}</p>
                    <p className="text-sm text-slate-400">Receiver</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Note</p>
                    <p className="mt-3 text-slate-700 dark:text-slate-200">{selectedSettlement.note || 'No note provided'}</p>
                  </div>
                </div>
              </div>

              {selectedSettlement.screenshot && (
                <div className="mt-6 rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm text-slate-500 mb-4">Screenshot</p>
                  <img src={selectedSettlement.screenshot} alt="Settlement screenshot" className="w-full rounded-3xl object-cover" />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetails;
