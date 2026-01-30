import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../../stores/auth';
import api from '../../lib/api';

interface TokenBalance {
  availableBalance: string;
  lockedBalance: string;
  lifetimeEarned: string;
  lifetimeSpent: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
}

export default function TokensScreen() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        api.get('/tokens/balance'),
        api.get('/tokens/history', { params: { limit: 20 } }),
      ]);
      setBalance(balanceRes.data);
      setHistory(historyRes.data.entries || historyRes.data || []);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const typeIcons: Record<string, string> = {
    earned: '+',
    spent: '-',
    transferred_in: '←',
    transferred_out: '→',
    bonus: '★',
    locked: '🔒',
    unlocked: '🔓',
  };

  const typeColors: Record<string, { bg: string; text: string }> = {
    earned: { bg: '#d1fae5', text: '#10b981' },
    spent: { bg: '#fee2e2', text: '#ef4444' },
    transferred_in: { bg: '#dbeafe', text: '#3b82f6' },
    transferred_out: { bg: '#ffedd5', text: '#f97316' },
    bonus: { bg: '#f3e8ff', text: '#a855f7' },
    locked: { bg: '#f3f4f6', text: '#6b7280' },
    unlocked: { bg: '#cffafe', text: '#0891b2' },
  };

  const isPositive = (type: string) =>
    ['earned', 'transferred_in', 'bonus', 'unlocked'].includes(type);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tokens...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Vision Tokens</Text>
        <Text style={styles.subtitle}>Earn tokens by completing milestones</Text>
      </View>

      {/* Minor Lock Notice */}
      {user?.isMinor && (
        <View style={styles.minorBanner}>
          <Text style={styles.minorIcon}>🔒</Text>
          <View style={styles.minorContent}>
            <Text style={styles.minorTitle}>Tokens Locked</Text>
            <Text style={styles.minorText}>
              Your tokens are locked until you turn 18
            </Text>
          </View>
        </View>
      )}

      {/* Balance Cards */}
      <View style={styles.balanceCard}>
        <View style={styles.mainBalance}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            {parseFloat(balance?.availableBalance || '0').toFixed(2)}
          </Text>
          <Text style={styles.balanceUnit}>VSN</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Locked</Text>
          <Text style={styles.statValue}>
            {parseFloat(balance?.lockedBalance || '0').toFixed(2)} VSN
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Lifetime Earned</Text>
          <Text style={[styles.statValue, styles.earnedValue]}>
            +{parseFloat(balance?.lifetimeEarned || '0').toFixed(2)} VSN
          </Text>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Transaction History</Text>

        {history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyText}>
              No transactions yet. Complete milestones to earn tokens!
            </Text>
          </View>
        ) : (
          history.map((entry) => {
            const colors = typeColors[entry.type] || typeColors.earned;
            return (
              <View key={entry.id} style={styles.historyItem}>
                <View style={[styles.historyIcon, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.historyIconText, { color: colors.text }]}>
                    {typeIcons[entry.type] || '•'}
                  </Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyDescription}>
                    {entry.description || entry.type.replace('_', ' ')}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.historyAmount}>
                  <Text
                    style={[
                      styles.historyAmountText,
                      isPositive(entry.type) ? styles.positiveAmount : styles.negativeAmount,
                    ]}
                  >
                    {isPositive(entry.type) ? '+' : '-'}
                    {Math.abs(parseFloat(entry.amount)).toFixed(2)} VSN
                  </Text>
                  <Text style={styles.historyBalance}>
                    Bal: {parseFloat(entry.balanceAfter).toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  header: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  minorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  minorIcon: { fontSize: 28, marginRight: 12 },
  minorContent: { flex: 1 },
  minorTitle: { fontSize: 16, fontWeight: '600', color: '#92400e' },
  minorText: { fontSize: 14, color: '#b45309', marginTop: 2 },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  mainBalance: { alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceValue: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  balanceUnit: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  earnedValue: { color: '#10b981' },
  historySection: { padding: 16 },
  historyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  emptyHistory: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: { fontSize: 16, fontWeight: 'bold' },
  historyContent: { flex: 1 },
  historyDescription: { fontSize: 14, fontWeight: '500', color: '#111827' },
  historyDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  historyAmount: { alignItems: 'flex-end' },
  historyAmountText: { fontSize: 14, fontWeight: '600' },
  positiveAmount: { color: '#10b981' },
  negativeAmount: { color: '#ef4444' },
  historyBalance: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
