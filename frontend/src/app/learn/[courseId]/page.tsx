'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Award,
  Loader2,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      title
      description
      difficulty
      estimatedMinutes
      progress
      completed
      modules {
        id
        title
        content
        type
        order
        completed
      }
    }
  }
`;

const COMPLETE_MODULE = gql`
  mutation CompleteModule($moduleId: ID!) {
    completeModule(moduleId: $moduleId) {
      id
      completed
    }
  }
`;

export default function CoursePage() {
  return (
    <ProtectedRoute>
      <CourseContent />
    </ProtectedRoute>
  );
}

function CourseContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const { data, loading, error, refetch } = useQuery(GET_COURSE, {
    variables: { id: courseId },
  });

  const [completeModule, { loading: completing }] = useMutation(COMPLETE_MODULE, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await completeModule({ variables: { moduleId } });
    } catch (err) {
      console.error('Error completing module:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="w-5 h-5" />;
      case 'ARTICLE':
        return <BookOpen className="w-5 h-5" />;
      case 'QUIZ':
        return <Award className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/learn">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Center
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const course = data.course;
  const completedModules = course.modules?.filter((m: any) => m.completed).length || 0;
  const totalModules = course.modules?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/learn">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-10 h-10 text-blue-500" />
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                {course.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.estimatedMinutes} minutes</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{totalModules} modules</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  <span>{completedModules} completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalModules > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Course Progress</span>
                <span className="font-semibold">
                  {Math.round((completedModules / totalModules) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${(completedModules / totalModules) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>
                  {completedModules} of {totalModules} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module: any, index: number) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedModule?.id === module.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5">
                            {module.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getModuleIcon(module.type)}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {module.type}
                              </span>
                            </div>
                            <p className="font-medium text-sm">{module.title}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No modules available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getModuleIcon(selectedModule.type)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedModule.type}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedModule.content}
                    </p>
                  </div>

                  {!selectedModule.completed && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => handleCompleteModule(selectedModule.id)}
                        disabled={completing}
                        className="w-full"
                      >
                        {completing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Marking as complete...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {selectedModule.completed && (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold py-4">
                      <CheckCircle2 className="w-5 h-5" />
                      Module Completed!
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Select a module to start learning
                  </h3>
                  <p className="text-gray-500">
                    Choose a module from the list to view its content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
