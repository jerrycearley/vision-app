'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { tokensApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface TokenBalance {
  availableBalance: string;
  lockedBalance: string;
  lifetimeEarned: string;
  lifetimeSpent: string;
}

interface TokenLedgerEntry {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export default function TokensPage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [history, setHistory] = useState<TokenLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    recipientId: '',
    amount: '',
    notes: '',
  });
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        tokensApi.getBalance(),
        tokensApi.getHistory(20, 0),
      ]);
      setBalance(balanceRes.data);
      setHistory(historyRes.data.entries || historyRes.data || []);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (user?.isMinor) {
      alert('Minors cannot transfer tokens. Your tokens are locked until you turn 18.');
      return;
    }

    setTransferring(true);
    try {
      await tokensApi.transfer(
        transferForm.recipientId,
        parseFloat(transferForm.amount),
        transferForm.notes
      );
      await fetchData();
      setShowTransferModal(false);
      setTransferForm({ recipientId: '', amount: '', notes: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to transfer tokens');
    } finally {
      setTransferring(false);
    }
  }

  const typeColors: Record<string, string> = {
    earned: 'text-green-600 bg-green-100',
    spent: 'text-red-600 bg-red-100',
    transferred_in: 'text-blue-600 bg-blue-100',
    transferred_out: 'text-orange-600 bg-orange-100',
    bonus: 'text-purple-600 bg-purple-100',
    locked: 'text-gray-600 bg-gray-100',
    unlocked: 'text-teal-600 bg-teal-100',
  };

  const typeIcons: Record<string, string> = {
    earned: '+',
    spent: '-',
    transferred_in: '←',
    transferred_out: '→',
    bonus: '★',
    locked: '🔒',
    unlocked: '🔓',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vision Tokens</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Earn tokens by completing milestones and achieving your goals.
          </p>
        </div>

        {/* Minor Lock Notice */}
        {user?.isMinor && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-amber-800">Token Lock Active</h3>
                <p className="text-amber-700 text-sm">
                  Your tokens are locked until you turn 18. You can still earn tokens, but transfers
                  and spending are disabled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-sm p-6 text-white">
            <p className="text-primary-100 text-sm">Available Balance</p>
            <p className="text-3xl font-bold mt-2">
              {parseFloat(balance?.availableBalance || '0').toFixed(2)} VSN
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Locked Balance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {parseFloat(balance?.lockedBalance || '0').toFixed(2)} VSN
            </p>
            {user?.isMinor && <p className="text-xs text-gray-500 mt-1">Locked until age 18</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Lifetime Earned</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              +{parseFloat(balance?.lifetimeEarned || '0').toFixed(2)} VSN
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Lifetime Spent</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              -{parseFloat(balance?.lifetimeSpent || '0').toFixed(2)} VSN
            </p>
          </div>
        </div>

        {/* Actions */}
        {!user?.isMinor && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Transfer Tokens
            </button>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h2>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet. Start completing milestones to earn tokens!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[entry.type] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {typeIcons[entry.type] || '•'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {entry.description || entry.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        entry.type === 'earned' ||
                        entry.type === 'transferred_in' ||
                        entry.type === 'bonus' ||
                        entry.type === 'unlocked'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'earned' ||
                      entry.type === 'transferred_in' ||
                      entry.type === 'bonus' ||
                      entry.type === 'unlocked'
                        ? '+'
                        : '-'}
                      {Math.abs(parseFloat(entry.amount)).toFixed(2)} VSN
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: {parseFloat(entry.balanceAfter).toFixed(2)} VSN
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Transfer Tokens
              </h3>

              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient User ID
                  </label>
                  <input
                    type="text"
                    required
                    value={transferForm.recipientId}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, recipientId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter recipient's user ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (VSN)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    max={parseFloat(balance?.availableBalance || '0')}
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {parseFloat(balance?.availableBalance || '0').toFixed(2)} VSN
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={transferForm.notes}
                    onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Add a note"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {transferring ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
