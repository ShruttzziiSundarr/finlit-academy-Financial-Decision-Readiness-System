import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Brain,
  Trophy,
  Wallet,
  Users,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Master Your <span className="text-blue-600 dark:text-blue-400">Financial Future</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Learn financial literacy through interactive simulations, AI-powered coaching,
              and gamified challenges. Join 100,000+ learners building wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>100k+ active learners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Learn by Doing, Not Just Reading
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12">
            Practice real-world financial decisions in a risk-free environment
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wallet className="w-8 h-8" />}
              title="Budget Simulator"
              description="Practice budgeting with real market data and see how your decisions impact your financial health"
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Stock Market Game"
              description="Build a virtual portfolio with $100k and learn investing without risking real money"
              color="bg-green-500"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Financial Coach"
              description="Get personalized advice and answers to your financial questions 24/7"
              color="bg-purple-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Progress Tracking"
              description="Visualize your learning journey with detailed analytics and insights"
              color="bg-orange-500"
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Challenges & Rewards"
              description="Compete in weekly challenges and earn badges as you master new skills"
              color="bg-yellow-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Adaptive Learning"
              description="AI-powered personalized paths that adapt to your pace and goals"
              color="bg-pink-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="100k+" label="Active Learners" />
            <StatCard number="95%" label="Completion Rate" />
            <StatCard number="$2M+" label="Virtual Portfolios" />
            <StatCard number="4.9/5" label="User Rating" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of learners who are building financial confidence every day
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-6">
              Explore the Dashboard
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className={`${color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  );
}
