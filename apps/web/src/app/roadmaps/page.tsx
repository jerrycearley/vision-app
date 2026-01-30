'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { roadmapsApi } from '@/lib/api';
import Link from 'next/link';

interface Milestone {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  status: string;
  tokenReward: number;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  status: string;
  totalMilestones: number;
  completedMilestones: number;
  milestones: Milestone[];
  goal: { id: string; title: string };
  createdAt: string;
}

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  async function fetchRoadmaps() {
    try {
      const res = await roadmapsApi.list();
      setRoadmaps(res.data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roadmaps</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-generated roadmaps to help you achieve your goals step by step.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : roadmaps.length === 0 ? (
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No roadmaps yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Create a goal first, then generate a personalized roadmap.
            </p>
            <Link
              href="/goals/new"
              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create a Goal
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {roadmaps.map((roadmap) => {
              const progress = roadmap.totalMilestones
                ? Math.round((roadmap.completedMilestones / roadmap.totalMilestones) * 100)
                : 0;

              return (
                <Link
                  key={roadmap.id}
                  href={`/roadmaps/${roadmap.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {roadmap.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Goal: {roadmap.goal?.title || 'Unknown'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${statusColors[roadmap.status] || statusColors.draft}`}
                    >
                      {roadmap.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {roadmap.description || 'No description'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 rounded-full h-2 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {roadmap.completedMilestones} of {roadmap.totalMilestones} milestones completed
                    </span>
                    <span className="text-primary-600 font-medium">View Details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
