import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../lib/api';

interface UserProfile {
  bio?: string;
  interests?: string[];
  location?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data.profile);
      setEditForm({
        displayName: res.data.displayName || '',
        bio: res.data.profile?.bio || '',
        location: res.data.profile?.location || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', {
        displayName: editForm.displayName,
        profile: {
          bio: editForm.bio,
          location: editForm.location,
        },
      });
      await fetchUser();
      await fetchProfile();
      setShowEditModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badges}>
          {user?.isMinor && (
            <View style={styles.minorBadge}>
              <Text style={styles.minorBadgeText}>Minor Account</Text>
            </View>
          )}
          {user?.emailVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bio Section */}
      {profile?.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{profile.bio}</Text>
          {profile.location && (
            <Text style={styles.locationText}>📍 {profile.location}</Text>
          )}
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.menuItem} onPress={() => setShowEditModal(true)}>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Connected Apps</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Notification Settings</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Help Center</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Terms of Service</Text>
          <Text style={styles.menuArrow}>→</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.versionText}>Vision App v1.0.0</Text>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={editForm.displayName}
              onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
              placeholder="Your name"
            />

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.bio}
              onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              placeholder="City, Country"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 16 },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  minorBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  minorBadgeText: { color: '#92400e', fontSize: 12, fontWeight: '500' },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: { color: '#10b981', fontSize: 12, fontWeight: '500' },
  bioSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  bioText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  locationText: { fontSize: 14, color: '#6b7280', marginTop: 12 },
  section: { backgroundColor: '#fff', marginTop: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuText: { fontSize: 16, color: '#374151' },
  menuArrow: { fontSize: 16, color: '#9ca3af' },
  logoutButton: {
    margin: 24,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: '600' },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6' },
  cancelButtonText: { color: '#374151', fontWeight: '600' },
  saveButton: { backgroundColor: '#3b82f6' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
