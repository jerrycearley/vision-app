'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { roadmapsApi } from '@/lib/api';

interface Resource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  status: string;
  tokenReward: number;
  estimatedDuration?: string;
  resources: Resource[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  status: string;
  milestones: Milestone[];
  goal: { id: string; title: string };
  createdAt: string;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, [params.id]);

  async function fetchRoadmap() {
    try {
      const res = await roadmapsApi.get(params.id as string);
      setRoadmap(res.data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteMilestone(milestoneId: string) {
    setCompleting(milestoneId);
    try {
      await roadmapsApi.completeMilestone(params.id as string, milestoneId);
      await fetchRoadmap();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete milestone');
    } finally {
      setCompleting(null);
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

  if (!roadmap) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roadmap not found</h2>
          <button
            onClick={() => router.push('/roadmaps')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Back to Roadmaps
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const sortedMilestones = [...(roadmap.milestones || [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const completedCount = sortedMilestones.filter((m) => m.status === 'completed').length;
  const progress = sortedMilestones.length
    ? Math.round((completedCount / sortedMilestones.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push('/roadmaps')}
              className="text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center"
            >
              ← Back to Roadmaps
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{roadmap.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{roadmap.description}</p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Milestones</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {completedCount} / {sortedMilestones.length}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-full h-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Milestones</h2>
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const isCompleted = milestone.status === 'completed';
              const isPending = milestone.status === 'pending';
              const canComplete =
                isPending && (index === 0 || sortedMilestones[index - 1]?.status === 'completed');

              return (
                <div key={milestone.id} className="relative">
                  {/* Timeline Line */}
                  {index < sortedMilestones.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-full ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}

                  <div className="flex gap-4">
                    {/* Status Circle */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : canComplete
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {milestone.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {milestone.description}
                            </p>
                            {milestone.estimatedDuration && (
                              <p className="text-xs text-gray-500 mt-2">
                                Est. duration: {milestone.estimatedDuration}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {milestone.tokenReward > 0 && (
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mb-2">
                                +{milestone.tokenReward} VSN
                              </span>
                            )}
                            {canComplete && (
                              <button
                                onClick={() => handleCompleteMilestone(milestone.id)}
                                disabled={completing === milestone.id}
                                className="block mt-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                              >
                                {completing === milestone.id ? 'Completing...' : 'Mark Complete'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Resources */}
                        {milestone.resources?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Resources</p>
                            <div className="space-y-2">
                              {milestone.resources.map((resource) => (
                                <a
                                  key={resource.id}
                                  href={resource.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                                >
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                                    {resource.type}
                                  </span>
                                  {resource.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
