import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../lib/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    goals: 0,
    tokenBalance: 0,
    recommendations: 0,
  });

  const fetchData = async () => {
    try {
      const [goalsRes, tokensRes] = await Promise.all([
        api.get('/goals'),
        api.get('/tokens/balance'),
      ]);

      setStats({
        goals: goalsRes.data.length,
        tokenBalance: Number(tokensRes.data.availableBalance) + Number(tokensRes.data.lockedBalance),
        recommendations: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName}!</Text>
        <Text style={styles.subtitle}>Here's your progress overview</Text>
      </View>

      {user?.isMinor && (
        <View style={styles.minorBanner}>
          <Text style={styles.minorBannerText}>
            Minor Account - Some features require guardian approval
          </Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.goals}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.tokenBalance.toFixed(0)}</Text>
          <Text style={styles.statLabel}>VSN Tokens</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/goals')}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionText}>Set Goal</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/recommendations')}>
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionText}>Discover</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/tokens')}>
            <Text style={styles.actionIcon}>🪙</Text>
            <Text style={styles.actionText}>Tokens</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.aiSection}>
        <Text style={styles.aiTitle}>AI Assistant</Text>
        <Text style={styles.aiDescription}>
          Get personalized recommendations and roadmaps based on your interests
        </Text>
        <Pressable style={styles.aiButton} onPress={() => router.push('/(tabs)/recommendations')}>
          <Text style={styles.aiButtonText}>Get Started</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  minorBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  minorBannerText: {
    color: '#92400e',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  aiSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  aiDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
  },
});
