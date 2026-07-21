import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, IndianRupee, QrCode } from 'lucide-react';
import api from '../../../utils/api';

const PAYMENT_TYPES = ['UPI', 'Cash'];

const SettlementWizard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('UPI');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState(''); // base64
  
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get('/groups');
        setGroups(data);
        if (data.length > 0) setSelectedGroup(data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch members when group changes
  useEffect(() => {
    if (!selectedGroup) return;
    const fetchMembers = async () => {
      setFetchingMembers(true);
      try {
        const { data } = await api.get(`/groups/${selectedGroup}/members`);
        setGroupMembers(data);
        
        if (data.length > 0) {
          setPayerId(data[0].user._id); // Assuming the current user is first, or we just pick the first
          if (data.length > 1) {
            setReceiverId(data[1].user._id);
          } else {
            setReceiverId(data[0].user._id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch group members');
      } finally {
        setFetchingMembers(false);
      }
    };
    fetchMembers();
  }, [selectedGroup]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedGroup) return setError("Please select a group");
    if (!payerId) return setError("Please select who is paying");
    if (!receiverId) return setError("Please select who is receiving");
    if (payerId === receiverId) return setError("Payer and receiver cannot be the same");
    
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return setError("Enter a valid amount");

    setLoading(true);
    try {
      await api.post(`/settlements`, {
        groupId: selectedGroup,
        payerId,
        receiverId,
        amount: parsedAmount,
        paymentType,
        note,
        screenshot
      });
      setSuccess(true);
      window.dispatchEvent(new Event('refreshBalances'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center space-y-2 shadow-sm text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        <h3 className="text-emerald-800 font-medium text-sm">Settlement Request Sent</h3>
        <p className="text-emerald-600 text-xs">The receiver will be notified to accept it.</p>
      </div>
    );
  }

  // Generate a mock QR placeholder if UPI is selected
  const showQR = paymentType === 'UPI' && receiverId;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
        <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
          <Send className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-sm text-gray-800">Settle Up</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Group & Amount */}
        <div className="flex gap-2">
          <div className="flex-[2]">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              disabled={fetchingGroups}
              className="w-full text-xs p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
            >
              {fetchingGroups ? <option>Loading...</option> : groups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Amount</label>
            <div className="relative">
              <IndianRupee className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                required min="1" step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs p-1.5 pl-5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Payer & Receiver */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Who is paying?</label>
            <select
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              disabled={fetchingMembers}
              className="w-full text-xs p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
            >
              {fetchingMembers ? <option>Loading...</option> : groupMembers.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Give Money To</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              disabled={fetchingMembers}
              className="w-full text-xs p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
            >
              {fetchingMembers ? <option>Loading...</option> : groupMembers.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Method & Note */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Method</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
            >
              {PAYMENT_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex-[2]">
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
              placeholder="e.g. July Rent"
            />
          </div>
        </div>

        {/* Upload Screenshot */}
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Upload Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-[10px] p-1 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-200 outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-emerald-50 file:text-emerald-700"
          />
        </div>

        {error && <p className="text-red-500 text-[10px] bg-red-50 p-1.5 rounded">{error}</p>}

        <button
          type="submit"
          disabled={loading || !amount || !selectedGroup || !payerId || !receiverId}
          className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md font-medium text-xs transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Request Settlement"}
        </button>
      </form>
    </div>
  );
};

export default SettlementWizard;
