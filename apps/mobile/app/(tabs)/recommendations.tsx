import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Linking,
} from 'react-native';
import api from '../../lib/api';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  relevanceScore: number;
  actionUrl?: string;
}

const typeIcons: Record<string, string> = {
  course: '📚',
  book: '📖',
  article: '📝',
  video: '🎬',
  event: '📅',
  job: '💼',
  mentor: '👥',
  tool: '🛠️',
  community: '🌐',
  activity: '🎯',
};

const categories = ['all', 'education', 'career', 'health', 'creativity', 'technology'];

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchRecommendations = async () => {
    try {
      const params = selectedCategory === 'all' ? {} : { category: selectedCategory };
      const res = await api.get('/recommendations', { params });
      setRecommendations(res.data.recommendations || res.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  }, [selectedCategory]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/recommendations/generate', {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        count: 5,
      });
      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recommendations</Text>
          <Text style={styles.subtitle}>Personalized for you</Text>
        </View>
        <Pressable
          style={[styles.generateButton, generating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          <Text style={styles.generateButtonText}>
            {generating ? 'Generating...' : 'Generate'}
          </Text>
        </Pressable>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {recommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyTitle}>No recommendations yet</Text>
            <Text style={styles.emptyText}>
              Tap &quot;Generate&quot; to get AI-powered recommendations based on your interests
            </Text>
          </View>
        ) : (
          recommendations.map((reco) => (
            <View key={reco.id} style={styles.recoCard}>
              <View style={styles.recoHeader}>
                <Text style={styles.recoIcon}>{typeIcons[reco.type] || '📌'}</Text>
                <View style={styles.recoMeta}>
                  <Text style={styles.recoType}>{reco.type}</Text>
                  {reco.relevanceScore >= 0.8 && (
                    <Text style={styles.highMatch}>High Match</Text>
                  )}
                </View>
              </View>
              <Text style={styles.recoTitle}>{reco.title}</Text>
              <Text style={styles.recoDescription} numberOfLines={3}>
                {reco.description}
              </Text>
              <View style={styles.recoFooter}>
                <Text style={styles.recoCategoryBadge}>{reco.category}</Text>
                {reco.actionUrl && (
                  <Pressable
                    style={styles.viewButton}
                    onPress={() => handleOpenUrl(reco.actionUrl!)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  generateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonDisabled: { opacity: 0.6 },
  generateButtonText: { color: '#fff', fontWeight: '600' },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryContainer: { flexDirection: 'row', padding: 12, paddingLeft: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryChipActive: { backgroundColor: '#3b82f6' },
  categoryChipText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  categoryChipTextActive: { color: '#fff' },
  scrollView: { flex: 1, padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 },
  recoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recoIcon: { fontSize: 32, marginRight: 12 },
  recoMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  recoType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'capitalize',
  },
  highMatch: {
    fontSize: 12,
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recoTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  recoDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  recoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  recoCategoryBadge: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  viewButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
});
