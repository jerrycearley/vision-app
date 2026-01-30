'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { goalsApi, roadmapsApi } from '@/lib/api';
import Link from 'next/link';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: number;
  createdAt: string;
  targetDate?: string;
  roadmap?: { id: string };
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [generatingRoadmap, setGeneratingRoadmap] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  async function fetchGoals() {
    try {
      const status = filter === 'all' ? undefined : filter;
      const res = await goalsApi.list(status);
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRoadmap(goalId: string) {
    setGeneratingRoadmap(goalId);
    try {
      await roadmapsApi.generate(goalId);
      fetchGoals();
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setGeneratingRoadmap(null);
    }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalsApi.delete(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
    abandoned: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set and track your personal and professional goals.
            </p>
          </div>
          <Link
            href="/goals/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            + New Goal
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'active', 'in_progress', 'completed', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : goals.length === 0 ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No goals yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Start by creating your first goal to get personalized roadmaps.
            </p>
            <Link
              href="/goals/new"
              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Goal
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusColors[goal.status] || statusColors.draft}`}
                      >
                        {goal.status.replace('_', ' ')}
                      </span>
                      {goal.category && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {goal.description || 'No description provided.'}
                    </p>
                    {goal.targetDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {goal.roadmap ? (
                      <Link
                        href={`/roadmaps/${goal.roadmap.id}`}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        View Roadmap
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleGenerateRoadmap(goal.id)}
                        disabled={generatingRoadmap === goal.id}
                        className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 disabled:opacity-50"
                      >
                        {generatingRoadmap === goal.id ? 'Generating...' : 'Generate Roadmap'}
                      </button>
                    )}
                    <Link
                      href={`/goals/${goal.id}`}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
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
