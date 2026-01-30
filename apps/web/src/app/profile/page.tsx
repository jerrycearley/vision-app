'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface UserProfile {
  bio?: string;
  interests?: string[];
  skills?: string[];
  location?: string;
  timezone?: string;
  socialLinks?: Record<string, string>;
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
  };
}

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    interests: '',
    skills: '',
    location: '',
    timezone: '',
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await usersApi.getProfile();
      const data = res.data;
      setProfile(data.profile);
      setForm({
        displayName: data.displayName || '',
        bio: data.profile?.bio || '',
        interests: (data.profile?.interests || []).join(', '),
        skills: (data.profile?.skills || []).join(', '),
        location: data.profile?.location || '',
        timezone: data.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        emailNotifications: data.profile?.preferences?.emailNotifications ?? true,
        pushNotifications: data.profile?.preferences?.pushNotifications ?? true,
        publicProfile: data.profile?.preferences?.publicProfile ?? false,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await usersApi.updateProfile({
        displayName: form.displayName,
        profile: {
          bio: form.bio,
          interests: form.interests.split(',').map((i) => i.trim()).filter(Boolean),
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          location: form.location,
          timezone: form.timezone,
          preferences: {
            emailNotifications: form.emailNotifications,
            pushNotifications: form.pushNotifications,
            publicProfile: form.publicProfile,
          },
        },
      });
      await fetchUser();
      await fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.displayName}
              </p>
              <p className="text-gray-500">{user?.email}</p>
              {user?.isMinor && (
                <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  Minor Account
                </span>
              )}
              {user?.emailVerified && (
                <span className="inline-block mt-2 ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interests & Skills
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                  placeholder="e.g., Technology, Music, Photography"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="e.g., JavaScript, Design, Writing"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.emailNotifications}
                  onChange={(e) => setForm({ ...form, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Receive email notifications
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.pushNotifications}
                  onChange={(e) => setForm({ ...form, pushNotifications: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Receive push notifications
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.publicProfile}
                  onChange={(e) => setForm({ ...form, publicProfile: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Make my profile public
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
