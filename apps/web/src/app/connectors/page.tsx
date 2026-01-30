'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { connectorsApi } from '@/lib/api';

interface ConnectorConfig {
  type: string;
  name: string;
  description: string;
  icon: string;
  scopes: { id: string; name: string; description: string }[];
  available: boolean;
}

interface ConnectedConnector {
  id: string;
  connectorType: string;
  status: string;
  scopes: string[];
  lastSyncAt?: string;
  signalCount?: number;
}

export default function ConnectorsPage() {
  const [available, setAvailable] = useState<ConnectorConfig[]>([]);
  const [connected, setConnected] = useState<ConnectedConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Record<string, string[]>>({});
  const [showScopeModal, setShowScopeModal] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fileName: '',
    fileType: 'csv',
    dataCategory: 'general',
    content: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [availableRes, connectedRes] = await Promise.all([
        connectorsApi.getAvailable(),
        connectorsApi.getConnected(),
      ]);
      setAvailable(availableRes.data);
      setConnected(connectedRes.data);
    } catch (error) {
      console.error('Error fetching connectors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(connectorType: string) {
    const scopes = selectedScopes[connectorType] || [];
    if (scopes.length === 0) {
      alert('Please select at least one data scope');
      return;
    }

    setConnecting(connectorType);
    try {
      const res = await connectorsApi.initiateOAuth(connectorType, scopes);
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else if (res.data.connector) {
        await fetchData();
        setShowScopeModal(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to connect');
    } finally {
      setConnecting(null);
    }
  }

  async function handleFileUpload() {
    if (!uploadForm.content) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await connectorsApi.upload({
        fileName: uploadForm.fileName,
        fileType: uploadForm.fileType,
        dataCategory: uploadForm.dataCategory,
        content: uploadForm.content,
      });
      await fetchData();
      setUploadModal(false);
      setUploadForm({ fileName: '', fileType: 'csv', dataCategory: 'general', content: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const base64 = btoa(content);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      setUploadForm({
        ...uploadForm,
        fileName: file.name,
        fileType: ext === 'csv' ? 'csv' : ext === 'json' ? 'json' : 'text',
        content: base64,
      });
    };
    reader.readAsText(file);
  }

  const connectorIcons: Record<string, string> = {
    google: '🔵',
    spotify: '🟢',
    github: '⚫',
    twitter: '🐦',
    linkedin: '💼',
    upload: '📤',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Connectors</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your accounts to get personalized recommendations based on your interests.
          </p>
        </div>

        {/* Connected Connectors */}
        {connected.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connected Accounts
            </h2>
            <div className="space-y-4">
              {connected.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{connectorIcons[conn.connectorType] || '🔗'}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {conn.connectorType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conn.signalCount || 0} interest signals collected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        conn.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {conn.status}
                    </span>
                    {conn.lastSyncAt && (
                      <span className="text-xs text-gray-500">
                        Last sync: {new Date(conn.lastSyncAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Connectors */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((connector) => {
              const isConnected = connected.some(
                (c) => c.connectorType === connector.type && c.status === 'active'
              );

              return (
                <div
                  key={connector.type}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${
                    !connector.available ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{connectorIcons[connector.type] || '🔗'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {connector.name}
                      </h3>
                      {!connector.available && (
                        <span className="text-xs text-orange-600">Coming Soon</span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {connector.description}
                  </p>

                  {isConnected ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg"
                    >
                      ✓ Connected
                    </button>
                  ) : connector.type === 'upload' ? (
                    <button
                      onClick={() => setUploadModal(true)}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Upload Data
                    </button>
                  ) : connector.available ? (
                    <button
                      onClick={() => setShowScopeModal(connector.type)}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Connect
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scope Selection Modal */}
        {showScopeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select Data to Share
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Choose what data you want to share from your{' '}
                {available.find((a) => a.type === showScopeModal)?.name} account.
              </p>

              <div className="space-y-3 mb-6">
                {available
                  .find((a) => a.type === showScopeModal)
                  ?.scopes.map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={(selectedScopes[showScopeModal] || []).includes(scope.id)}
                        onChange={(e) => {
                          const current = selectedScopes[showScopeModal] || [];
                          setSelectedScopes({
                            ...selectedScopes,
                            [showScopeModal]: e.target.checked
                              ? [...current, scope.id]
                              : current.filter((s) => s !== scope.id),
                          });
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{scope.name}</p>
                        <p className="text-sm text-gray-500">{scope.description}</p>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScopeModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConnect(showScopeModal)}
                  disabled={connecting === showScopeModal}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {connecting === showScopeModal ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Interest Data
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Category
                  </label>
                  <select
                    value={uploadForm.dataCategory}
                    onChange={(e) => setUploadForm({ ...uploadForm, dataCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="music">Music Preferences</option>
                    <option value="video">Video Watch History</option>
                    <option value="reading">Reading History</option>
                    <option value="shopping">Shopping Interests</option>
                    <option value="social">Social Media Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File (CSV, JSON, or TXT)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  {uploadForm.fileName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {uploadForm.fileName} ({uploadForm.fileType})
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  Supported formats: CSV with &quot;interest&quot; column, JSON array, or plain text (one
                  interest per line).
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || !uploadForm.content}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
