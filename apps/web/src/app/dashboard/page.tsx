'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/auth';
import { goalsApi, tokensApi, recommendationsApi, roadmapsApi } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    goals: 0,
    roadmaps: 0,
    recommendations: 0,
    tokenBalance: 0,
  });
  const [recentGoals, setRecentGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, roadmapsRes, recosRes, tokensRes] = await Promise.all([
          goalsApi.list(),
          roadmapsApi.list(),
          recommendationsApi.list({ limit: 5 }),
          tokensApi.getBalance(),
        ]);

        setStats({
          goals: goalsRes.data.length,
          roadmaps: roadmapsRes.data.length,
          recommendations: recosRes.data.recommendations?.length || 0,
          tokenBalance: Number(tokensRes.data.availableBalance) + Number(tokensRes.data.lockedBalance),
        });

        setRecentGoals(goalsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's an overview of your progress and opportunities.
          </p>
        </div>

        {user?.isMinor && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-amber-800 font-medium">Minor Account</span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              Some features require guardian approval. Your earned tokens are locked until you turn 18.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Goals</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : stats.goals}
            </div>
            <Link href="/goals" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              View all goals
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Roadmaps</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : stats.roadmaps}
            </div>
            <Link href="/roadmaps" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              View roadmaps
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Recommendations</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : stats.recommendations}
            </div>
            <Link href="/recommendations" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              Explore recommendations
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Token Balance</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : stats.tokenBalance.toFixed(2)} VSN
            </div>
            <Link href="/tokens" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              View token details
            </Link>
          </div>
        </div>

        {/* Recent Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Goals</h2>
            <Link href="/goals/new" className="text-primary-600 hover:underline">
              + Add Goal
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : recentGoals.length > 0 ? (
            <div className="space-y-4">
              {recentGoals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {goal.description?.substring(0, 100) || 'No description'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      goal.status === 'active' ? 'bg-primary-100 text-primary-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No goals yet. Start by creating your first goal!</p>
              <Link href="/goals/new" className="text-primary-600 mt-2 inline-block hover:underline">
                Create a goal
              </Link>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
          <p className="opacity-90 mb-4">
            Get personalized help with your goals, discover new interests, and receive tailored recommendations.
          </p>
          <div className="flex gap-4">
            <Link
              href="/recommendations"
              className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Get Recommendations
            </Link>
            <Link
              href="/goals/new"
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition"
            >
              Create Roadmap
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
