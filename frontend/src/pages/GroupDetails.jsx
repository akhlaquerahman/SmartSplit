import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/useGroupStore';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import { Plus, ChevronLeft, Receipt, HandCoins, UserPlus, Info, Image, X, UploadCloud, QrCode, MessageCircle, Edit2, Trash2, History, Calendar } from 'lucide-react';
import ChatDrawer from '../components/ChatDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { QRCodeSVG } from 'qrcode.react';

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeGroup,
    expenses,
    settlements,
    fetchGroupDetails,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchExpenseEditHistory,
    addMember,
    removeMember,
    createSettlement,
    respondSettlement,
    loading,
    error
  } = useGroupStore();
  const { user: currentUser } = useAuthStore();

  // Edit Expense State Hooks
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editExpenseForm, setEditExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'General',
    splitType: 'equal',
    paidBy: '',
    receipt: '',
    paymentMethod: 'UPI',
    date: ''
  });
  const [editSelectedParticipants, setEditSelectedParticipants] = useState([]);
  const [editCustomShares, setEditCustomShares] = useState({});
  const [editExpenseError, setEditExpenseError] = useState('');
  const [isSubmittingEditExpense, setIsSubmittingEditExpense] = useState(false);

  // Edit History State Hooks
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedExpenseForHistory, setSelectedExpenseForHistory] = useState(null);
  const [expenseEditHistoryList, setExpenseEditHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [tab, setTab] = useState('overview');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openGroupMenu, setOpenGroupMenu] = useState(false);
  const [expandedSplitIds, setExpandedSplitIds] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'General',
    splitType: 'equal',
    paidBy: '',
    receipt: '',
    paymentMethod: 'UPI'
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [customShares, setCustomShares] = useState({});
  const [expenseError, setExpenseError] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    payerId: '',
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
  
  const handleReceiptUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setExpenseForm((prev) => ({ ...prev, receipt: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const [settlementError, setSettlementError] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (showAddMember && !memberEmail) {
      fetchFriends();
    }
  }, [showAddMember]);

  useEffect(() => {
    if (!showAddMember || !memberEmail) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchFriends(memberEmail);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [memberEmail, showAddMember]);

  const availableFriends = useMemo(() => {
    if (!friends || !activeGroup?.members) return [];
    return friends.filter(f => !activeGroup.members.some(m => {
      const mId = m.user?._id?.toString() || m.user?.toString();
      const fId = f._id?.toString();
      return mId === fId;
    }));
  }, [friends, activeGroup]);
  const fetchFriends = async (search = '') => {
    setFriendsLoading(true);
    try {
      const response = await api.get('/groups/friends', {
        params: { search }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

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
        payerId: currentUser?._id || '',
        receiverId: ids.find((userId) => userId !== currentUser?._id) || ids[0] || ''
      }));
      setExpenseForm((prev) => ({
        ...prev,
        paidBy: '',
        receipt: ''
      }));
    }
  }, [activeGroup, currentUser]);

  const memberSummaries = useMemo(() => {
    if (!activeGroup?.members || !activeGroup?.summary?.memberBalances) return [];

    return activeGroup.members.map((member) => {
      const memberId = member.user?._id?.toString() || member.user?.toString();
      if (!memberId) return null;

      const summaryRecord = activeGroup.summary.memberBalances.find((record) => {
        const recordId = record.user?._id?.toString?.() || record.user?.toString?.();
        return recordId === memberId;
      });

      return {
        id: memberId,
        name: member.user?.name || 'Unknown User',
        avatar: member.user?.avatar,
        role: member.role,
        totalShare: summaryRecord?.totalShare || 0,
        totalPaid: summaryRecord?.totalPaid || 0,
        balance: summaryRecord?.balance || 0,
        netBalance: summaryRecord?.netBalance || 0,
        settlementPaid: summaryRecord?.settlementPaid || 0,
        settlementReceived: summaryRecord?.settlementReceived || 0
      };
    }).filter(Boolean);
  }, [activeGroup]);

  const currentMemberSummary = useMemo(() => (
    memberSummaries.find((member) => member.id === currentUser?._id) || null
  ), [memberSummaries, currentUser]);

  const totalExpense = activeGroup?.summary?.totalExpense ?? 0;
  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [expenses]);
  const sortedSettlements = useMemo(() => [...settlements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [settlements]);
  const pendingRequests = sortedSettlements.filter((settlement) => settlement.status === 'pending');
  const paidMostName = activeGroup?.summary?.paidMost
    ? activeGroup.members.find((member) => (member.user?._id || member.user) === activeGroup.summary.paidMost.userId)?.user?.name
    : 'No activity yet';
  const owesMostName = activeGroup?.summary?.owesMost
    ? activeGroup.members.find((member) => (member.user?._id || member.user) === activeGroup.summary.owesMost.userId)?.user?.name
    : 'No activity yet';

  const insightsData = useMemo(() => {
    // 1. Total Transactions
    const totalTransactions = sortedExpenses.length;
    const totalSpendAmt = sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 2. Monthly Trend
    const monthlyTrend = {};
    sortedExpenses.forEach(exp => {
      const d = new Date(exp.date || exp.createdAt);
      const m = d.toLocaleString('en-US', { month: 'short' });
      monthlyTrend[m] = (monthlyTrend[m] || 0) + exp.amount;
    });
    const monthsData = Object.entries(monthlyTrend).slice(-3); // Last 3 months
    const maxMonthVal = monthsData.length > 0 ? Math.max(...monthsData.map(([, val]) => val)) : 1;

    // 3. Highest Spender
    const spenderSums = {};
    sortedExpenses.forEach(exp => {
      const pId = exp.paidBy?._id || exp.paidBy;
      if (pId) {
        spenderSums[pId] = (spenderSums[pId] || 0) + exp.amount;
      }
    });
    let topSpenderId = null;
    let topSpenderVal = 0;
    Object.entries(spenderSums).forEach(([id, val]) => {
      if (val > topSpenderVal) {
        topSpenderVal = val;
        topSpenderId = id;
      }
    });
    const topSpenderName = activeGroup?.members?.find(m => (m.user?._id || m.user) === topSpenderId)?.user?.name || 'No Spender';

    // 4. Most Used Category
    const categorySums = {};
    sortedExpenses.forEach(exp => {
      const c = exp.category || 'General';
      categorySums[c] = (categorySums[c] || 0) + exp.amount;
    });
    let topCat = 'General';
    let topCatVal = 0;
    Object.entries(categorySums).forEach(([cat, val]) => {
      if (val > topCatVal) {
        topCatVal = val;
        topCat = cat;
      }
    });
    const topCatPct = totalSpendAmt > 0 ? Math.round((topCatVal / totalSpendAmt) * 100) : 0;

    // 5. Your Contribution
    const myPaidSum = sortedExpenses
      .filter(exp => {
        const pId = exp.paidBy?._id || exp.paidBy;
        return pId === currentUser?._id;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    const myPct = totalSpendAmt > 0 ? Math.round((myPaidSum / totalSpendAmt) * 100) : 0;

    // 6. Pending Settlements
    const pendingCount = pendingRequests.length;

    // 7. Average Spend per Member
    const memberCount = activeGroup?.members?.length || 1;
    const avgAmt = memberCount > 0 ? totalSpendAmt / memberCount : 0;

    // 8. Smart Insights List
    const smartInsightsList = [];
    if (totalTransactions > 0) {
      if (topCatVal > 0) {
        smartInsightsList.push(`${topCat} spending accounted for ${topCatPct}% of group expenses.`);
      }
      if (topSpenderVal > 0) {
        smartInsightsList.push(`${topSpenderName} spent the highest in the group, contributing ₹${topSpenderVal.toFixed(0)}.`);
      }
      smartInsightsList.push("Most expenses are shared equally across members.");
    } else {
      smartInsightsList.push("No transactions have been recorded in this group yet.");
    }

    return {
      totalTransactions,
      totalSpendAmt,
      monthsData,
      maxMonthVal,
      topSpenderName,
      topSpenderVal,
      topCat,
      topCatPct,
      myPaidSum,
      myPct,
      pendingCount,
      avgAmt,
      smartInsightsList
    };
  }, [sortedExpenses, activeGroup, currentUser, pendingRequests]);

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
        const member = activeGroup.members.find((item) => (item.user?._id || item.user) === userId);
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
      const member = activeGroup.members.find((item) => (item.user?._id || item.user) === userId);
      return { userId, name: member?.user.name || 'Member', amount: Number(customShares[userId] || 0) };
    });
  }, [expenseForm.amount, expenseForm.splitType, selectedParticipants, customShares, activeGroup]);

  const currentMemberPaid = currentMemberSummary?.totalPaid || 0;
  const currentMemberShare = currentMemberSummary?.totalShare || 0;
  const currentMemberBalance = currentMemberSummary?.netBalance || 0;

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

    if (!expenseForm.paidBy) {
      setExpenseError('Please select who paid for this expense.');
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
      participants: selectedParticipants,
      splitDetails
    });

    if (success) {
      setShowExpenseModal(false);
      setExpenseForm({ 
        description: '', 
        amount: '', 
        category: 'General', 
        splitType: 'equal', 
        paidBy: '',
        receipt: '',
        paymentMethod: 'UPI'
      });
      setSelectedParticipants(activeGroup.members.map((member) => member.user._id));
      setCustomShares(activeGroup.members.reduce((acc, member) => ({ ...acc, [member.user._id]: '' }), {}));
      setTab('expenses');
      setExpenseError('');
    } else {
      setExpenseError(error || 'Unable to add expense. Please try again.');
    }

    setIsSubmittingExpense(false);
  };

  // Edit Expense useMemo and Handlers
  const editPreviewShares = useMemo(() => {
    const amount = parseFloat(editExpenseForm.amount) || 0;
    if (editSelectedParticipants.length === 0 || !activeGroup) return [];

    if (editExpenseForm.splitType === 'equal') {
      const baseShare = Number((amount / editSelectedParticipants.length).toFixed(2));
      return editSelectedParticipants.map((userId, index) => {
        const member = activeGroup.members.find((item) => (item.user?._id || item.user) === userId);
        let shareAmount;
        if (index === editSelectedParticipants.length - 1) {
          shareAmount = Number((amount - (baseShare * (editSelectedParticipants.length - 1))).toFixed(2));
        } else {
          shareAmount = baseShare;
        }
        return { userId, name: member?.user.name || 'Member', amount: shareAmount || 0 };
      });
    }

    return editSelectedParticipants.map((userId) => {
      const member = activeGroup.members.find((item) => (item.user?._id || item.user) === userId);
      return { userId, name: member?.user.name || 'Member', amount: Number(editCustomShares[userId] || 0) };
    });
  }, [editExpenseForm.amount, editExpenseForm.splitType, editSelectedParticipants, editCustomShares, activeGroup]);

  const canEditExpense = (expense) => {
    if (!currentUser) return false;
    
    const addedById = expense.addedBy?._id || expense.addedBy;
    const isCreator = addedById?.toString() === currentUser._id?.toString();
    const isGroupAdmin = activeGroup?.members?.some(
      (member) => member.user?._id === currentUser._id && member.role === 'admin'
    );
    const isSystemAdmin = currentUser.role === 'admin';
    
    return isCreator || isGroupAdmin || isSystemAdmin;
  };

  const handleShowEditExpenseModal = (expense) => {
    setEditingExpenseId(expense._id);
    setEditExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category || 'General',
      splitType: expense.splitType || 'equal',
      paidBy: expense.paidBy?._id || expense.paidBy,
      receipt: expense.receipt || '',
      paymentMethod: expense.paymentMethod || 'UPI',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    
    const participantIds = expense.participants.map(p => p._id || p);
    setEditSelectedParticipants(participantIds);
    
    const customSharesMap = {};
    activeGroup.members.forEach(member => {
      customSharesMap[member.user._id] = '';
    });
    if (expense.splitType === 'unequal' && expense.splitDetails) {
      expense.splitDetails.forEach(split => {
        const uId = split.user?._id || split.user;
        customSharesMap[uId] = split.amount.toString();
      });
    }
    setEditCustomShares(customSharesMap);
    setEditExpenseError('');
    setShowEditExpenseModal(true);
  };

  const handleToggleEditParticipant = (userId) => {
    setEditSelectedParticipants((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const updateEditCustomShare = (userId, value) => {
    setEditCustomShares((current) => ({ ...current, [userId]: value }));
  };

  const handleEditReceiptUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setEditExpenseError('Receipt image must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditExpenseForm((prev) => ({ ...prev, receipt: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditExpense = async (e) => {
    e.preventDefault();
    if (!activeGroup || !editingExpenseId) return;
    setEditExpenseError('');
    setIsSubmittingEditExpense(true);

    const amount = parseFloat(editExpenseForm.amount);
    if (!amount || amount <= 0) {
      setEditExpenseError('Please enter a valid amount greater than zero.');
      setIsSubmittingEditExpense(false);
      return;
    }

    if (editSelectedParticipants.length === 0) {
      setEditExpenseError('Please select at least one participant.');
      setIsSubmittingEditExpense(false);
      return;
    }

    if (!editExpenseForm.paidBy) {
      setEditExpenseError('Please select who paid for this expense.');
      setIsSubmittingEditExpense(false);
      return;
    }

    const baseShare = Number((amount / editSelectedParticipants.length).toFixed(2));
    const splitDetails = editSelectedParticipants.map((userId, index) => {
      let shareAmount;
      if (editExpenseForm.splitType === 'equal') {
        if (index === editSelectedParticipants.length - 1) {
          shareAmount = Number((amount - (baseShare * (editSelectedParticipants.length - 1))).toFixed(2));
        } else {
          shareAmount = baseShare;
        }
      } else {
        shareAmount = Number(editCustomShares[userId] || 0);
      }
      return { user: userId, amount: shareAmount };
    });

    const splitSum = splitDetails.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(splitSum - amount) > 0.1) {
      setEditExpenseError('Split amount does not match total expense. Please adjust the shares.');
      setIsSubmittingEditExpense(false);
      return;
    }

    const success = await updateExpense(editingExpenseId, {
      ...editExpenseForm,
      amount,
      groupId: id,
      participants: editSelectedParticipants,
      splitDetails
    });

    if (success) {
      setShowEditExpenseModal(false);
      setEditingExpenseId(null);
    } else {
      setEditExpenseError(error || 'Unable to update expense. Please try again.');
    }

    setIsSubmittingEditExpense(false);
  };

  const handleShowExpenseHistory = async (expense) => {
    setSelectedExpenseForHistory(expense);
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const historyList = await fetchExpenseEditHistory(expense._id);
      setExpenseEditHistoryList(historyList);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteExpenseClick = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      const success = await deleteExpense(expenseId, id);
      if (!success) {
        alert(error || 'Failed to delete expense.');
      }
    }
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
      payerId: settlementForm.payerId,
      receiverId: settlementForm.receiverId,
      amount,
      paymentType: settlementForm.paymentType,
      screenshot: settlementForm.screenshot,
      note: settlementForm.note
    });
    if (success) {
      setShowSettlementModal(false);
      setSettlementForm({ payerId: currentUser?._id || '', receiverId: '', amount: '', paymentType: 'UPI', screenshot: '', note: '' });
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

  useEffect(() => {
    if (showEditModal && activeGroup) {
      setEditForm({
        name: activeGroup.name,
        description: activeGroup.description || '',
        category: activeGroup.category || 'Other'
      });
    }
  }, [showEditModal, activeGroup]);

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    const success = await useGroupStore.getState().updateGroup(activeGroup._id, editForm);
    if (success) {
      setShowEditModal(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? All expenses and settlements will be permanently removed.')) {
      setIsDeleting(true);
      const success = await useGroupStore.getState().deleteGroup(activeGroup._id);
      if (success) {
        navigate('/dashboard');
      }
      setIsDeleting(false);
    }
  };

  if (loading && !activeGroup) return <div className="text-center py-20">Loading group details...</div>;
  if (!activeGroup) return <div className="text-center py-20">{error || 'Group not found'}</div>;

  const isAdmin = activeGroup?.members?.some(
    (member) => member.user?._id === currentUser?._id && member.role === 'admin'
  );

  const balanceLabel = currentMemberBalance < 0
    ? `You will pay ${formatCurrency(Math.abs(currentMemberBalance))}`
    : currentMemberBalance > 0
      ? `You will receive ${formatCurrency(currentMemberBalance)}`
      : 'You are settled up';

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

      <div className="space-y-6">
        {/* Horizontal Gradient Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-slate-900 dark:to-slate-800 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-white shadow-sm border-none">
          {/* Subtle background abstract shapes */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-blue-100 to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-6 min-w-0">
                {/* Compact icon container */}
                <div className="w-10 h-10 md:w-20 md:h-20 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-5 h-5 md:w-10 md:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-3xl font-extrabold md:font-black tracking-tight leading-tight truncate">{activeGroup.name}</h2>
                  <p className="text-blue-100/90 dark:text-slate-300 text-[10px] md:text-sm mt-0.5 md:mt-1.5 font-medium max-w-xl line-clamp-1 md:line-clamp-2">
                    {activeGroup.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Edit/Delete Top-Right 3-dot dropdown menu on Mobile, and inline on Desktop */}
              {isAdmin && (
                <div className="relative shrink-0 flex items-center gap-2">
                  {/* Desktop Actions */}
                  <div className="hidden md:flex gap-2">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm border text-slate-700"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button 
                      onClick={handleDeleteGroup}
                      disabled={isDeleting}
                      className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm border"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>

                  {/* Mobile Actions 3-dot Toggle Button */}
                  <div className="md:hidden relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroupMenu(!openGroupMenu);
                      }}
                      className="p-2 hover:bg-white/10 active:bg-white/20 rounded-xl text-white transition-colors"
                      title="Group Options"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                    </button>

                    {/* Compact Dropdown Menu */}
                    <AnimatePresence>
                      {openGroupMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenGroupMenu(false)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-36 z-50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-1.5 shadow-xl text-slate-800 dark:text-white"
                          >
                            <button
                              onClick={() => {
                                setOpenGroupMenu(false);
                                setShowEditModal(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Edit2 size={13} /> Edit Group
                            </button>
                            <button
                              onClick={() => {
                                setOpenGroupMenu(false);
                                handleDeleteGroup();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                            >
                              <Trash2 size={13} /> Delete Group
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Compact pill action buttons, horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar scroll-smooth pt-2 md:pt-4 border-t border-white/10 pb-0.5">
              <button 
                onClick={() => setShowExpenseModal(true)} 
                className="bg-white text-primary-600 hover:bg-slate-50 rounded-full px-4 py-2 text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 h-9"
              >
                <Plus size={14} className="stroke-[3]" /> Expense
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setShowAddMember(true)} 
                  className="bg-white/15 text-white border border-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 h-9"
                >
                  <UserPlus size={14} className="stroke-[3]" /> Member
                </button>
              )}
              <button 
                onClick={() => setShowSettlementModal(true)} 
                className="bg-white/15 text-white border border-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 h-9"
              >
                <QrCode size={14} className="stroke-[3]" /> Settle
              </button>
            </div>
          </div>
        </div>

        {/* Standalone White Card for Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          
          {/* Total Spent */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Spent</p>
              <p className="text-sm md:text-xl font-extrabold mt-1.5 text-slate-800 dark:text-white truncate">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>

          {/* Paid by you */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Paid by you</p>
              <p className="text-sm md:text-xl font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(currentMemberPaid)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>

          {/* Your Share */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Share</p>
              <p className="text-sm md:text-xl font-extrabold mt-1.5 text-slate-800 dark:text-white truncate">
                {formatCurrency(currentMemberShare)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Members</p>
              <p className="text-sm md:text-xl font-extrabold mt-1.5 text-slate-800 dark:text-white truncate">
                {activeGroup.members.length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-sm transition-all hover:shadow-md col-span-2 md:col-span-1">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Pending</p>
              <p className="text-sm md:text-xl font-extrabold mt-1.5 text-slate-800 dark:text-white truncate">
                {pendingRequests.length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>

        </div>

        {/* Clean Line Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-5 border-b border-slate-200 dark:border-slate-800 px-1 mt-4 shrink-0">
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
                "pb-2.5 text-xs font-bold transition-all relative whitespace-nowrap",
                tab === item.key
                  ? "text-primary-600 dark:text-blue-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {item.label}
              {tab === item.key && (
                <motion.div 
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"
                />
              )}
            </button>
          ))}
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

              <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                <div className="rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 md:p-5 border">
                  <p className="text-xs md:text-sm text-slate-500">Total expenses</p>
                  <p className="mt-2 md:mt-3 text-xl md:text-2xl font-bold">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 md:p-5 border">
                  <p className="text-xs md:text-sm text-slate-500">Outstanding to collect</p>
                  <p className="mt-2 md:mt-3 text-xl md:text-2xl font-bold">{formatCurrency(activeGroup.summary?.totalOwedToGroup || 0)}</p>
                </div>
                <div className="rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 md:p-5 border">
                  <p className="text-xs md:text-sm text-slate-500">Pending settlements</p>
                  <p className="mt-2 md:mt-3 text-xl md:text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <div className="rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 md:p-5 border">
                  <p className="text-xs md:text-sm text-slate-500">Outstanding to pay</p>
                  <p className="mt-2 md:mt-3 text-xl md:text-2xl font-bold">{formatCurrency(activeGroup.summary?.totalOwed || 0)}</p>
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
              <h2 className="text-xl font-bold mb-4">Per-user balances</h2>
              <p className="text-slate-500 text-sm">Each card uses only the expenses a member actually participated in.</p>
              <div className="mt-6 space-y-4">
                {memberSummaries.map((member) => {
                  const status = member.netBalance > 0 ? 'Receive' : member.netBalance < 0 ? 'Pay' : 'Settled';
                  const statusColor = member.netBalance > 0
                    ? 'text-emerald-600'
                    : member.netBalance < 0
                      ? 'text-rose-600'
                      : 'text-slate-600';

                  return (
                    <div key={member.id} className="rounded-[1.5rem] bg-white dark:bg-slate-900 p-5 border shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{member.name}</p>
                          <p className={`mt-2 text-lg font-semibold ${statusColor}`}>
                            {status === 'Settled' ? 'Settled up' : `${status} ${formatCurrency(Math.abs(member.netBalance))}`}
                          </p>
                        </div>
                        <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600">{status}</div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Total share</p>
                          <p className="mt-2 font-semibold">{formatCurrency(member.totalShare)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Total paid</p>
                          <p className="mt-2 font-semibold text-emerald-600">{formatCurrency(member.totalPaid)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border">
                          <p className="text-slate-500">Net balance</p>
                          <p className={`mt-2 font-semibold ${statusColor}`}>{formatCurrency(Math.abs(member.netBalance))}</p>
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
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Left Column: Expense History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base md:text-xl font-bold text-slate-800 dark:text-white">Expense History</h2>
                  <p className="text-slate-500 text-xs">Track every spend in the group.</p>
                </div>
                <button 
                  onClick={() => setShowExpenseModal(true)} 
                  className="rounded-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary-500/10 active:scale-95 transition-all h-8"
                >
                  <Plus size={12} className="stroke-[3]" /> Add Expense
                </button>
              </div>

              <div className="space-y-3">
                {sortedExpenses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                    No expenses recorded yet.
                  </div>
                ) : (
                  sortedExpenses.map((expense) => {
                    const isPaidByMe = expense.paidBy?.name === currentUser?.name || expense.paidBy?._id === currentUser?._id;
                    const paidByText = isPaidByMe ? 'Paid by You' : `Paid by ${expense.paidBy?.name || 'Member'}`;
                    
                    return (
                      <div key={expense._id} className="rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 p-3.5 md:p-5 border border-slate-100 dark:border-slate-850 transition-all hover:shadow-sm">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            {/* Date formatted as May 18, 2026 • 9:42 AM */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <span>
                                {new Date(expense.date || expense.createdAt).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: '2-digit', 
                                  year: 'numeric', 
                                  hour: 'numeric', 
                                  minute: '2-digit', 
                                  hour12: true 
                                }).replace(',', '')}
                              </span>
                              {expense.updatedAt && new Date(expense.updatedAt).getTime() - new Date(expense.createdAt).getTime() > 1000 && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border border-amber-100/50 dark:border-amber-900/30 text-[8px] font-black uppercase tracking-wider">
                                  <svg className="w-2 h-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                  </svg>
                                  Edited ({new Date(expense.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                                </span>
                              )}
                            </div>
                            <p className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white mt-1 truncate">
                              {expense.description}
                            </p>
                            <p className="text-[10px] font-bold text-primary-600 dark:text-blue-400 mt-1">
                              {paidByText}
                              {expense.addedBy && expense.addedBy?._id !== expense.paidBy?._id && (
                                <span className="ml-1 opacity-70 font-semibold">• Added by {expense.addedBy?.name === currentUser?.name ? 'You' : expense.addedBy?.name}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5 shrink-0">
                            <div className="text-right">
                              <p className="text-sm md:text-lg font-black text-slate-900 dark:text-white">
                                ₹{expense.amount.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 rounded-md">
                                  {expense.category || 'General'}
                                </span>
                              </div>
                              {expense.receipt && (
                                <button
                                  onClick={() => setViewReceiptUrl(expense.receipt)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 border border-blue-200 dark:border-blue-800/80 text-primary-600 dark:text-blue-400 rounded-lg text-[9px] font-black hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                                >
                                  <Image size={8} /> Proof
                                </button>
                              )}
                            </div>

                            {/* Dropdown 3 vertical dots menu */}
                            <div className="relative mt-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === expense._id ? null : expense._id);
                                }}
                                className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-650 transition-colors"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="12" cy="5" r="1.5" />
                                  <circle cx="12" cy="19" r="1.5" />
                                </svg>
                              </button>
                              
                              {openDropdownId === expense._id && (
                                <>
                                  <div className="fixed inset-0 z-20" onClick={() => setOpenDropdownId(null)} />
                                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border rounded-2xl shadow-xl py-1 z-30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                                    {canEditExpense(expense) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdownId(null);
                                          handleShowEditExpenseModal(expense);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-805 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200"
                                      >
                                        <Edit2 size={12} /> Edit Expense
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdownId(null);
                                        handleShowExpenseHistory(expense);
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-805 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200"
                                    >
                                      <History size={12} /> View History
                                    </button>
                                    {canEditExpense(expense) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdownId(null);
                                          handleDeleteExpenseClick(expense._id);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-bold border-t border-slate-100/55 dark:border-slate-800/60"
                                      >
                                        <Trash2 size={12} /> Delete Expense
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Compact Split Breakdown (Always Visible by Default) */}
                        {expense.splitDetails?.length > 0 && (
                          <div className="mt-3 border border-slate-100/50 dark:border-slate-800/50 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 dark:bg-slate-950/20 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                              <span className="text-primary-600 dark:text-blue-400 font-extrabold text-[9px] tracking-wider uppercase">Shares breakdown</span>
                            </div>
                            <div className="p-2 space-y-1.5">
                              {expense.splitDetails.map((split) => {
                                const member = activeGroup.members.find((item) => item.user._id === split.user || item.user._id === split.user?._id || item.user._id === split.user?.toString());
                                const memberName = member?.user.name || (split.user?.name || 'Member');
                                const initials = memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'M';
                                const isPayer = (expense.paidBy?._id || expense.paidBy) === (split.user?._id || split.user);
                                
                                return (
                                  <div key={split.user?._id || split.user} className={cn(
                                    "flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg transition-all border",
                                    isPayer 
                                      ? "bg-emerald-50/20 border-emerald-100/20 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-400" 
                                      : "bg-white dark:bg-slate-950 border-slate-100/70 dark:border-slate-800/40 text-slate-600 dark:text-slate-400"
                                  )}>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm shrink-0",
                                        isPayer 
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                      )}>
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-extrabold truncate">{memberName}</p>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-black text-slate-800 dark:text-slate-200">₹{split.amount.toFixed(2)}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Expense Insights */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border shadow-sm h-fit space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Expense Insights</h2>
                <p className="text-slate-500 text-xs md:text-sm mt-1">Real-time smart spending diagnostics & analytics dashboard.</p>
              </div>

              {/* 2-Column Responsive Card Grid inside Insights */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {/* 1. Monthly Spending Trend */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Spending Trend</p>
                  {insightsData.monthsData.length === 0 ? (
                    <p className="text-xs text-slate-450">No monthly data available</p>
                  ) : (
                    <div className="space-y-2">
                      {insightsData.monthsData.map(([month, val]) => {
                        const pct = Math.round((val / insightsData.maxMonthVal) * 100) || 1;
                        return (
                          <div key={month} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-extrabold text-slate-655 dark:text-slate-455">
                              <span>{month}</span>
                              <span className="font-black">₹{val.toFixed(0)}</span>
                            </div>
                            <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Highest Spender */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest Spender</p>
                    <p className="mt-2 font-extrabold text-slate-800 dark:text-white text-xs md:text-sm truncate">
                      {insightsData.topSpenderName}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black mt-0.5">
                      ₹{insightsData.topSpenderVal.toFixed(2)} total
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>

                {/* 3. Most Used Category */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Used Category</p>
                    <p className="mt-2 font-extrabold text-slate-800 dark:text-white text-xs md:text-sm truncate">
                      {insightsData.topCat}
                    </p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black mt-0.5">
                      {insightsData.topCatPct}% of group spend
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                  </div>
                </div>

                {/* 4. Your Contribution Percentage */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Share</p>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-655 dark:text-slate-455 mt-1.5 font-black">
                    <span>{insightsData.myPct}% Contributed</span>
                    <span>₹{insightsData.myPaidSum.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${insightsData.myPct}%` }} />
                  </div>
                </div>

                {/* 5. Pending Settlement Summary */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Settlements</p>
                    <p className="mt-2 font-extrabold text-slate-800 dark:text-white text-xs md:text-sm">
                      {insightsData.pendingCount} requests
                    </p>
                    <p className={cn("text-[10px] font-black mt-0.5", insightsData.pendingCount > 0 ? "text-rose-500" : "text-slate-450")}>
                      {insightsData.pendingCount > 0 ? "Requires review" : "Up to date"}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>

                {/* 6. Average Expense per Member */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average / Member</p>
                    <p className="mt-2 font-extrabold text-slate-800 dark:text-white text-xs md:text-sm">
                      ₹{insightsData.avgAmt.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-450 font-semibold mt-0.5">
                      Per participant share
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>

                {/* 7. Total Transactions Count */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4 sm:col-span-2">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction Activity</p>
                    <p className="mt-2 font-extrabold text-slate-800 dark:text-white text-xs md:text-sm">
                      {insightsData.totalTransactions} transactions recorded
                    </p>
                    <p className="text-[10px] text-slate-455 font-semibold mt-0.5">
                      Total historical group ledger events
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950/40 text-purple-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 8. Smart Insights List */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart AI Insights</p>
                <div className="space-y-2">
                  {insightsData.smartInsightsList.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-350">
                      <span className="text-primary-500 shrink-0 mt-0.5">💡</span>
                      <span>{insight}</span>
                    </div>
                  ))}
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
                {memberSummaries.map((member) => {
                  const status = member.netBalance > 0 ? 'Will receive' : member.netBalance < 0 ? 'Will pay' : 'Settled';
                  return (
                    <div key={member.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} className="w-12 h-12 rounded-full" />
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role === 'admin' ? 'Admin' : 'Member'}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">Share: {formatCurrency(member.totalShare)}</p>
                        <p className="text-emerald-600">Paid: {formatCurrency(member.totalPaid)}</p>
                        <p className={member.netBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {status}: {formatCurrency(Math.abs(member.netBalance))}
                        </p>
                        {isAdmin && member.id !== currentUser._id && (
                          <button onClick={() => setRemovingMember(member)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
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
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base md:text-xl font-bold">Settlements</h2>
                  <p className="text-slate-500 text-xs">Manage pending payments and history.</p>
                </div>
                <button 
                  onClick={() => setShowSettlementModal(true)} 
                  className="rounded-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-md shadow-primary-500/10 active:scale-95 transition-all"
                >
                  New request
                </button>
              </div>
              <div className="space-y-3">
                {sortedSettlements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center text-slate-400">
                    <HandCoins size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                    No settlement requests yet.
                  </div>
                ) : (
                  sortedSettlements.map((settlement) => (
                    <div key={settlement._id} className="rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 p-3.5 md:p-5 border border-slate-100 dark:border-slate-850">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400">
                            {new Date(settlement.createdAt).toLocaleString('en-US', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric', 
                              hour: 'numeric', 
                              minute: 'numeric', 
                              hour12: true 
                            }).replace(',', '')}
                          </p>
                          <p className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">
                            {settlement.status === 'pending' ? 'Pending Payment' : settlement.status === 'completed' ? 'Accepted' : 'Declined'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{settlement.note || 'No description'}</p>
                          <p className="text-[10px] font-bold text-primary-600 dark:text-blue-400 mt-1.5 leading-relaxed">
                            {settlement.payerId?.name === currentUser?.name ? 'You' : settlement.payerId?.name} paid {settlement.receiverId?.name === currentUser?.name ? 'You' : settlement.receiverId?.name}
                            {settlement.addedBy && settlement.addedBy?._id !== (settlement.payerId?._id || settlement.payerId) && (
                              <span className="ml-1 opacity-70 font-semibold">• Added by {settlement.addedBy?.name === currentUser?.name ? 'You' : settlement.addedBy?.name}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-slate-900 dark:text-white">₹{settlement.amount.toFixed(2)}</p>
                          <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1.5 inline-block">{settlement.paymentType}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] font-black">{renderSettlementStatus(settlement.status)}</span>
                        <button
                          onClick={() => setSelectedSettlement(settlement)}
                          className="rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-650 dark:text-slate-300 transition-colors"
                        >
                          View Receipt
                        </button>
                      </div>

                      {settlement.status === 'pending' && (
                        <div className="mt-3 text-[10px] font-bold text-slate-500 italic bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                          {settlement.payerId?._id?.toString() === currentUser?._id?.toString() || settlement.payerId?.toString() === currentUser?._id?.toString()
                            ? `Request sent to ${settlement.receiverId?.name || 'selected member'}`
                            : `Request received from ${settlement.payerId?.name || 'payer'}`}
                        </div>
                      )}

                      {settlement.status === 'pending' &&
                        (settlement.receiverId?._id?.toString() === currentUser?._id?.toString() || settlement.receiverId?.toString() === currentUser?._id?.toString()) && (
                        <div className="mt-3 flex gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleRespond(settlement._id, 'accept')} 
                            className="flex-1 sm:flex-none rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 h-9"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespond(settlement._id, 'reject')} 
                            className="flex-1 sm:flex-none rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 h-9"
                          >
                            Decline
                          </button>
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
                  <p className="text-sm text-slate-500">Your net position</p>
                  <p className="mt-2 text-2xl font-bold">{balanceLabel}</p>
                  <p className="mt-2 text-xs text-slate-500">Based on participant shares, total paid, and completed settlements.</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border">
                  <p className="text-sm text-slate-500">Settlement table</p>
                  <div className="mt-4 space-y-3">
                    {memberSummaries.map((member) => {
                      const action = member.netBalance > 0 ? 'Receive' : member.netBalance < 0 ? 'Pay' : 'Settled';
                      return (
                        <div key={member.id} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border">
                          <p className="font-semibold">{member.name}</p>
                          <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-600">
                            <div>
                              <p className="text-slate-500">Action</p>
                              <p className={`font-semibold ${member.netBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{action}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Amount</p>
                              <p className={`font-semibold ${member.netBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(member.netBalance))}</p>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Paid By</label>
                  <select
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    required
                  >
                    <option value="" disabled>Select who paid</option>
                    {activeGroup.members.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name} {member.user._id === currentUser?._id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={expenseForm.paymentMethod}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {expenseForm.receipt ? (
                      <>
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 border">
                          <img src={expenseForm.receipt} alt="Receipt preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-semibold text-primary-600">Proof attached</p>
                        <p className="text-xs text-slate-500 mt-1">Click to change</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                          <UploadCloud size={24} className="text-slate-400 group-hover:text-primary-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload payment proof</p>
                        <p className="text-xs text-slate-500 mt-1">Optional (Image max 5MB)</p>
                      </>
                    )}
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
                  <label className="block text-sm font-medium mb-2">Who is paying?</label>
                  <select
                    value={settlementForm.payerId}
                    onChange={(e) => setSettlementForm({ ...settlementForm, payerId: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="">Choose payer</option>
                    {activeGroup.members.map((member) => (
                      <option key={member.user?._id} value={member.user?._id}>
                        {member.user?.name} {member.user?._id === currentUser?._id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium mb-2">Select the member you will give money to</label>
                  <select
                    value={settlementForm.receiverId}
                    onChange={(e) => setSettlementForm({ ...settlementForm, receiverId: e.target.value })}
                    className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 outline-none"
                  >
                    <option value="">Choose member</option>
                    {activeGroup.members
                      .filter((member) => member.user?._id !== settlementForm.payerId)
                      .map((member) => (
                        <option key={member.user?._id} value={member.user?._id}>{member.user?.name}</option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Choose the user who should receive this settlement request.</p>
                  
                  {settlementForm.receiverId && (() => {
                    const receiverMember = activeGroup.members.find(m => m.user?._id === settlementForm.receiverId);
                    const receiverUser = receiverMember?.user;
                    if (receiverUser?.upiId) {
                      return (
                        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 flex flex-col items-center gap-3">
                          <QRCodeSVG 
                            value={`upi://pay?pa=${receiverUser.upiId}&pn=${encodeURIComponent(receiverUser.name)}&cu=INR&am=${settlementForm.amount || ''}`} 
                            size={160}
                            includeMargin={true}
                            className="rounded-lg shadow-md bg-white p-2"
                          />
                          <div className="text-center">
                            <p className="text-sm font-bold text-primary-900 dark:text-primary-100">Scan to Pay {receiverUser.name}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400">{receiverUser.upiId}</p>
                            {settlementForm.amount && (
                              <p className="text-lg font-black text-primary-700 dark:text-primary-300 mt-1">₹{settlementForm.amount}</p>
                            )}
                          </div>
                          <a 
                            href={`upi://pay?pa=${receiverUser.upiId}&pn=${encodeURIComponent(receiverUser.name)}&cu=INR&am=${settlementForm.amount || ''}`}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
                          >
                            <QrCode size={18} /> Pay via UPI App
                          </a>
                          <p className="text-[10px] text-slate-500 text-center">Clicking this will open your payment apps (Mobile Only)</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
        {showAddMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMember(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold">Add Group Member</h3>
                <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Invite by Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1 p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <button 
                      onClick={() => {
                        addMember(id, memberEmail);
                        setMemberEmail('');
                        setShowAddMember(false);
                      }}
                      className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold"
                    >
                      Invite
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {memberEmail.length >= 2 ? 'Search Results' : 'Select from Friends'}
                  </label>
                  {friendsLoading ? (
                    <div className="text-center py-4 text-slate-500 text-sm flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                      Searching...
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed">
                      <p className="text-slate-500 text-sm px-4">
                        {memberEmail.length >= 2 
                          ? `No users found matching "${memberEmail}"` 
                          : "No friends found yet. Try searching by name or email above!"}
                      </p>
                    </div>
                  ) : availableFriends.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed">
                      <p className="text-slate-500 text-sm px-4">
                        All your friends are already members of this group!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {availableFriends.map((friend) => (
                        <button
                          key={friend._id}
                          onClick={() => {
                            addMember(id, friend.email);
                            setShowAddMember(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-2xl border hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-500 transition-all text-left group"
                        >
                          <img src={friend.avatar} className="w-10 h-10 rounded-full border shadow-sm" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{friend.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{friend.email}</p>
                          </div>
                          <Plus size={16} className="text-slate-300 group-hover:text-primary-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t">
                <button onClick={() => setShowAddMember(false)} className="w-full py-3 bg-white dark:bg-slate-800 border rounded-xl font-bold">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewReceiptUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewReceiptUrl(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewReceiptUrl(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <img src={viewReceiptUrl} alt="Expense Proof" className="w-full max-h-[80vh] object-contain rounded-2xl bg-black/50" />
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
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                    <p className="text-sm text-slate-500">Added by</p>
                    <p className="mt-3 font-semibold">{selectedSettlement.addedBy?.name || 'Unknown'}</p>
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

      <AnimatePresence>
        {removingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRemovingMember(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus size={32} className="rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-2">Remove Member?</h3>
              <p className="text-slate-500 text-sm mb-8">
                Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-slate-100">{removingMember.name}</span> from the group?
                Their expenses and settlements will remain, but they won't be able to participate in new ones.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRemovingMember(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const success = await removeMember(activeGroup._id, removingMember.id);
                    if (success) {
                      setRemovingMember(null);
                    }
                  }}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Group</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all resize-none h-32"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none"
                  >
                    <option value="Trip">Trip</option>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl shadow-primary-500/40 z-50 transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Group Chat
        </span>
      </button>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {showEditExpenseModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-hidden mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Expense</h2>
                <button onClick={() => setShowEditExpenseModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditExpense} className="space-y-4 overflow-y-auto pr-1 max-h-[calc(100vh-14rem)]">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    Description <Info size={14} className="text-slate-300" />
                  </label>
                  <input
                    type="text"
                    value={editExpenseForm.description}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    placeholder="e.g. Pizza Night"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paid By</label>
                  <select
                    value={editExpenseForm.paidBy}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, paidBy: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    required
                  >
                    <option value="" disabled>Select who paid</option>
                    {activeGroup.members.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name} {member.user._id === currentUser?._id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editExpenseForm.amount}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Split type</label>
                    <select
                      value={editExpenseForm.splitType}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, splitType: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    >
                      <option value="equal">Equal</option>
                      <option value="unequal">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={editExpenseForm.paymentMethod}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, paymentMethod: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expense Date</label>
                    <input
                      type="date"
                      value={editExpenseForm.date}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, date: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input
                      type="text"
                      value={editExpenseForm.category}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border focus:border-primary-500"
                      placeholder="Category (e.g. Food, Travel)"
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditReceiptUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {editExpenseForm.receipt ? (
                      <>
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 border">
                          <img src={editExpenseForm.receipt} alt="Receipt preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-semibold text-primary-600">Proof attached</p>
                        <p className="text-xs text-slate-500 mt-1">Click to change</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                          <UploadCloud size={24} className="text-slate-400 group-hover:text-primary-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload payment proof</p>
                        <p className="text-xs text-slate-500 mt-1">Optional (Image max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                  <p className="text-sm font-semibold mb-3">Participants</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeGroup.members.map((member) => {
                      const checked = editSelectedParticipants.includes(member.user._id);
                      return (
                        <label key={member.user._id} className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:border-primary-500 font-medium text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleEditParticipant(member.user._id)}
                            className="h-4 w-4 accent-primary-600"
                          />
                          <span className="text-sm font-medium">{member.user.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {editExpenseForm.splitType === 'unequal' && (
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border">
                    <p className="text-sm font-semibold mb-3">Custom share amounts</p>
                    <div className="space-y-3">
                      {activeGroup.members
                        .filter((member) => editSelectedParticipants.includes(member.user._id))
                        .map((member) => (
                          <div key={member.user._id} className="flex items-center gap-3">
                            <img src={member.user.avatar} className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{member.user.name}</p>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editCustomShares[member.user._id] ?? ''}
                                onChange={(e) => updateEditCustomShare(member.user._id, e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-900 rounded-2xl border focus:border-primary-500 outline-none"
                                placeholder="Share amount"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {editExpenseError && (
                  <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600 p-4 text-sm text-rose-700 dark:text-rose-200 font-bold">
                    {editExpenseError}
                  </div>
                )}

                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-5 border">
                  <p className="text-sm font-semibold mb-3">Preview</p>
                  <div className="grid grid-cols-1 gap-3">
                    {editPreviewShares.map((item) => (
                      <div key={item.userId} className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-3 border text-slate-700 dark:text-slate-300">
                        <span className="text-sm">{item.name}</span>
                        <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditExpenseModal(false)}
                    className="w-full px-4 py-4 rounded-2xl border font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEditExpense}
                    className="w-full px-4 py-4 rounded-2xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingEditExpense ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Edit History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 max-h-[calc(100vh-4rem)] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="text-amber-500" size={22} /> Edit History
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Changes made to "{selectedExpenseForHistory?.description || 'Expense'}"
                  </p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-2">
                {loadingHistory ? (
                  <div className="text-center py-12 text-slate-500">Loading edit history...</div>
                ) : expenseEditHistoryList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200">
                    <History size={32} className="mx-auto mb-3 opacity-60 text-slate-400" />
                    No edits have been made to this expense yet.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-8">
                    {expenseEditHistoryList.map((log, index) => (
                      <div key={log._id || index} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900 shadow-sm" />
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <img src={log.editedBy?.avatar} className="w-8 h-8 rounded-full shadow-sm" alt="Editor Avatar" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {log.editedBy?.name} {log.editedBy?._id === currentUser?._id ? '(You)' : ''}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(log.editedAt || log.createdAt).toLocaleString('en-US', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border space-y-3">
                            <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Changed Fields</p>
                            <div className="space-y-2">
                              {log.changes.map((change, cIdx) => (
                                <div key={cIdx} className="text-xs grid grid-cols-1 md:grid-cols-[1fr_auto_1.5fr] gap-2 border-b last:border-0 border-slate-100 dark:border-slate-800 pb-2 last:pb-0">
                                  <div className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                    {change.field === 'paidBy' ? 'Who Paid' : change.field === 'splitDetails' ? 'Split Shares' : change.field === 'receipt' ? 'Receipt Proof' : change.field}
                                  </div>
                                  <div className="hidden md:block text-slate-400">→</div>
                                  <div className="space-y-1">
                                    <div className="text-rose-600 dark:text-rose-400 line-through bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded inline-block text-[11px] truncate max-w-full">
                                      {change.oldValue || 'None'}
                                    </div>
                                    <br className="md:hidden" />
                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded inline-block text-[11px] truncate max-w-full">
                                      {change.newValue || 'None'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 shrink-0 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl font-bold transition-all text-sm"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatDrawer
        groupId={activeGroup._id}
        groupName={activeGroup.name}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
};

export default GroupDetails;
