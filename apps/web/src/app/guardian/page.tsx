'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { guardiansApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Guardian {
  id: string;
  guardian: {
    id: string;
    displayName: string;
    email: string;
  };
  relationship: string;
  status: string;
  createdAt: string;
}

interface ConsentRecord {
  id: string;
  feature: string;
  status: string;
  grantedAt?: string;
  expiresAt?: string;
  notes?: string;
}

export default function GuardianPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [minors, setMinors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: '', relationship: 'parent' });
  const [inviting, setInviting] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState<string | null>(null);
  const [consentForm, setConsentForm] = useState({
    feature: 'data_connectors',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      if (user?.isMinor) {
        const res = await guardiansApi.getMyGuardians();
        setGuardians(res.data);
      } else {
        const res = await guardiansApi.getMyMinors();
        setMinors(res.data);
      }
    } catch (error) {
      console.error('Error fetching guardians:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await guardiansApi.inviteGuardian(inviteForm.email, inviteForm.relationship);
      await fetchData();
      setInviteForm({ email: '', relationship: 'parent' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  async function handleGrantConsent(minorId: string) {
    try {
      await guardiansApi.grantConsent({
        minorId,
        feature: consentForm.feature,
        notes: consentForm.notes,
      });
      await fetchData();
      setShowConsentModal(null);
      setConsentForm({ feature: 'data_connectors', notes: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to grant consent');
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Minor's view - show their guardians
  if (user?.isMinor) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guardian Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your guardians and request permissions.
            </p>
          </div>

          {/* Account Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👤</span>
              <div>
                <h2 className="font-semibold text-amber-800">Minor Account</h2>
                <p className="text-amber-700 mt-1">
                  As a minor, some features require guardian approval. Your guardians can grant
                  permissions for different features.
                </p>
              </div>
            </div>
          </div>

          {/* Invite Guardian */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite a Guardian
            </h2>
            <form onSubmit={handleInvite} className="flex gap-4">
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="Guardian's email address"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <select
                value={inviteForm.relationship}
                onChange={(e) => setInviteForm({ ...inviteForm, relationship: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="parent">Parent</option>
                <option value="legal_guardian">Legal Guardian</option>
                <option value="teacher">Teacher</option>
                <option value="mentor">Mentor</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>

          {/* Current Guardians */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Guardians
            </h2>
            {guardians.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No guardians linked yet. Invite a parent or guardian to enable additional features.
              </p>
            ) : (
              <div className="space-y-4">
                {guardians.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {g.guardian.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {g.guardian.displayName}
                        </p>
                        <p className="text-sm text-gray-500">{g.guardian.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{g.relationship}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        g.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : g.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Protected Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Protected Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              These features require guardian approval:
            </p>
            <div className="space-y-3">
              {[
                { name: 'Data Connectors', desc: 'Connect third-party accounts (Google, etc.)' },
                { name: 'Token Transfers', desc: 'Transfer tokens to other users' },
                { name: 'Public Profile', desc: 'Make your profile visible to others' },
                { name: 'External Recommendations', desc: 'Access external resources and links' },
              ].map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{feature.name}</p>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Needs Approval
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Guardian's view - show their minors
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guardian Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage permissions for minors under your guardianship.
          </p>
        </div>

        {minors.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No minors linked
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              When a minor invites you as their guardian, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {minors.map((link) => (
              <div key={link.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xl font-bold">
                      {link.minor.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {link.minor.displayName}
                      </p>
                      <p className="text-gray-500">{link.minor.email}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        Your role: {link.relationship}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConsentModal(link.minor.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Grant Permission
                  </button>
                </div>

                {/* Consent Records */}
                {link.consentRecords?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Active Permissions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {link.consentRecords
                        .filter((c: ConsentRecord) => c.status === 'granted')
                        .map((consent: ConsentRecord) => (
                          <span
                            key={consent.id}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                          >
                            {consent.feature.replace('_', ' ')}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Consent Modal */}
        {showConsentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Grant Permission
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feature
                  </label>
                  <select
                    value={consentForm.feature}
                    onChange={(e) => setConsentForm({ ...consentForm, feature: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="data_connectors">Data Connectors</option>
                    <option value="token_transfers">Token Transfers</option>
                    <option value="public_profile">Public Profile</option>
                    <option value="external_recommendations">External Recommendations</option>
                    <option value="ai_chat">AI Chat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={consentForm.notes}
                    onChange={(e) => setConsentForm({ ...consentForm, notes: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  By granting this permission, you are allowing the minor to access this feature.
                  You can revoke this permission at any time.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConsentModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGrantConsent(showConsentModal)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Grant Permission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
