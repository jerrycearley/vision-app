'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { recommendationsApi, connectorsApi } from '@/lib/api';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  relevanceScore: number;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

const categories = [
  'all',
  'education',
  'career',
  'health',
  'finance',
  'creativity',
  'relationships',
  'personal_growth',
  'technology',
  'entertainment',
];

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

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState('all');
  const [interests, setInterests] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [category]);

  async function fetchData() {
    setLoading(true);
    try {
      const [recosRes, interestsRes] = await Promise.all([
        recommendationsApi.list({ category: category === 'all' ? undefined : category, limit: 20 }),
        connectorsApi.getAggregatedInterests(),
      ]);
      setRecommendations(recosRes.data.recommendations || recosRes.data || []);
      setInterests(interestsRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await recommendationsApi.generate(category === 'all' ? undefined : category, 5);
      await fetchData();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleFavorite(id: string) {
    try {
      await recommendationsApi.favorite(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorited: true } : r))
      );
    } catch (error) {
      console.error('Error favoriting recommendation:', error);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered recommendations based on your interests and goals.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate New'}
          </button>
        </div>

        {/* Interest Tags */}
        {interests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-2">Your top interests:</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {interest.category}: {interest.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No recommendations yet
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Connect your accounts or add interests to get personalized recommendations.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Recommendations'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((reco) => (
              <div
                key={reco.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{typeIcons[reco.type] || '📌'}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      {reco.category}
                    </span>
                    {reco.relevanceScore >= 0.8 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        High Match
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{reco.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                  {reco.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500">{reco.type}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFavorite(reco.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      ❤️
                    </button>
                    {reco.actionUrl && (
                      <a
                        href={reco.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-lg hover:bg-primary-200"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
