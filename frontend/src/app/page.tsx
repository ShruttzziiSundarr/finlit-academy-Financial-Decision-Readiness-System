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
  Sparkles,
  Gamepad2,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Gamepad2 className="w-12 h-12 text-purple-400 animate-pulse" />
              <span className="pixel-font text-purple-400 text-sm">FINLIT ACADEMY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight glow-purple-strong">
              LEVEL UP YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-pulse">
                FINANCIAL GAME
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light">
              LEARN FINANCIAL LITERACY THROUGH EPIC SIMULATIONS, AI BOSS BATTLES,
              AND LEGENDARY CHALLENGES. JOIN 100K+ PLAYERS BUILDING WEALTH.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 glow-purple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-2 border-purple-400">
                  <Zap className="w-5 h-5 mr-2" />
                  START GAME
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-purple-500 text-purple-300 hover:bg-purple-900/50">
                  <Users className="w-5 h-5 mr-2" />
                  PLAYER LOGIN
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-purple-300 mono-font text-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>FREE TO PLAY</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>100K+ PLAYERS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 glow-purple">
            GAME MODES
          </h2>
          <p className="text-xl text-purple-300 text-center mb-12 mono-font">
            CHOOSE YOUR QUEST AND START EARNING XP
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wallet className="w-8 h-8" />}
              title="BUDGET ARENA"
              description="Master budgeting in this epic simulation. Track expenses and dominate your financial goals."
              color="from-blue-600 to-cyan-600"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="STOCK BATTLEGROUND"
              description="Build your portfolio empire with $100K virtual cash. Trade stocks and climb the ranks."
              color="from-green-600 to-emerald-600"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI BOSS COACH"
              description="Challenge the AI financial advisor. Get legendary advice and unlock secret strategies."
              color="from-purple-600 to-pink-600"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="PROGRESS HUD"
              description="Track your journey with real-time stats. Level up and unlock new achievements."
              color="from-orange-600 to-red-600"
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="CHALLENGE MODE"
              description="Compete in epic weekly tournaments. Earn rewards and dominate the leaderboards."
              color="from-yellow-600 to-amber-600"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="ADAPTIVE QUEST"
              description="AI-powered missions that adapt to your skill level. Every player gets a unique journey."
              color="from-pink-600 to-rose-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="100K+" label="ACTIVE PLAYERS" />
            <StatCard number="95%" label="WIN RATE" />
            <StatCard number="$2M+" label="VIRTUAL WEALTH" />
            <StatCard number="4.9/5" label="EPIC RATING" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold glow-purple-strong">
            READY TO START YOUR QUEST?
          </h2>
          <p className="text-xl text-purple-300 mono-font">
            JOIN THOUSANDS OF PLAYERS BUILDING LEGENDARY FINANCIAL SKILLS
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-6 glow-purple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-2 border-purple-400">
              <Gamepad2 className="w-6 h-6 mr-2" />
              ENTER DASHBOARD
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
    <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-lg border-2 border-purple-500/30 hover:border-purple-400 glow-purple transition-all hover:scale-105 hover:glow-purple-strong">
      <div className={`bg-gradient-to-r ${color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4 glow-purple`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-purple-300">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border-2 border-purple-500/50 glow-purple">
      <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mono-font">{number}</div>
      <div className="text-purple-300 uppercase tracking-wider text-sm">{label}</div>
    </div>
  );
}
