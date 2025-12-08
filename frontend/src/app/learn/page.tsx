'use client';

import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';

const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      title
      description
      difficulty
      estimatedMinutes
      progress
      completed
    }
    me {
      progress {
        coursesCompleted
        experiencePoints
        level
      }
    }
  }
`;

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <LearnContent />
    </ProtectedRoute>
  );
}

function LearnContent() {
  const { data, loading, error } = useQuery(GET_COURSES);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Master financial literacy through interactive courses
          </p>
        </div>

        {/* User Progress Stats */}
        {data?.me?.progress && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.me.progress.coursesCompleted}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Level {data.me.progress.level}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.me.progress.experiencePoints}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading courses...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            Unable to load courses. Please try refreshing the page.
          </div>
        )}

        {/* Courses Grid */}
        {data?.courses && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Courses</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.courses.length} courses available
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.courses.map((course: any) => (
                <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <BookOpen className="w-8 h-8 text-blue-500" />
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.estimatedMinutes} minutes</span>
                    </div>

                    {/* Progress Bar */}
                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-semibold">{Math.round(course.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {course.completed && (
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-semibold mt-2">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Link href={`/learn/${course.id}`} className="w-full">
                      <Button className="w-full">
                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {data.courses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No courses available yet
                </h3>
                <p className="text-gray-500">Check back soon for new learning content!</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
