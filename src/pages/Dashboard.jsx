import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Flame,
  BookOpen,
  Timer as TimerIcon,
  ArrowRight,
} from "lucide-react";
import { StatCard, ProgressBar, Button } from "../components/ui";
import NetworkMesh from "../components/NetworkMesh";
import {
  getDashboardStats,
  getTopicAccuracyBreakdown,
} from "../services/questionService";
import { getStreak, getMockHistory } from "../services/storageService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topicBreakdown, setTopicBreakdown] = useState([]);
  const [streak, setStreak] = useState(null);
  const [mockHistory, setMockHistory] = useState([]);

  useEffect(() => {
    setStats(getDashboardStats());
    setTopicBreakdown(getTopicAccuracyBreakdown());
    setStreak(getStreak());
    setMockHistory(getMockHistory());
  }, []);

  if (!stats) return null;

  const recentMocks = [...mockHistory].reverse().slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="surface rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-signal-600 dark:text-signal-400 uppercase tracking-wider mb-2">
            IBPS SO IT Officer &middot; Professional Knowledge
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-2">
            {stats.completionPercentage === 0
              ? "Let's map your network of knowledge."
              : `${stats.completionPercentage}% through the question bank — keep the packets flowing.`}
          </h1>
          <p className="text-sm text-navy-500 dark:text-mist-200/60 mb-5 max-w-lg">
            {stats.total} original Computer Networking MCQs, fully explained, covering every topic from OSI
            fundamentals to banking-specific network security scenarios.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/practice">
              <Button>
                <BookOpen size={16} /> Start Practicing
              </Button>
            </Link>
            <Link to="/mock">
              <Button variant="secondary">
                <TimerIcon size={16} /> Take a Mock Test
              </Button>
            </Link>
          </div>
        </div>
        <NetworkMesh className="w-56 md:w-72 shrink-0 opacity-90" />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Target} label="Attempted" value={stats.attempted} sublabel={`of ${stats.total} total`} accent="text-signal-500" />
        <StatCard icon={CheckCircle2} label="Accuracy" value={`${stats.accuracy}%`} accent="text-mint-500" />
        <StatCard icon={Circle} label="Remaining" value={stats.remaining} accent="text-amber-500" />
        <StatCard icon={Flame} label="Study Streak" value={`${streak?.currentStreak || 0} days`} sublabel={`Longest: ${streak?.longestStreak || 0}`} accent="text-rose-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Overall progress + topic mastery */}
        <div className="lg:col-span-2 surface rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Topic Mastery</h2>
            <Link to="/analytics" className="text-xs text-signal-600 dark:text-signal-400 flex items-center gap-1 hover:underline">
              Full analytics <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5 text-navy-500 dark:text-mist-200/60">
              <span>Overall completion</span>
              <span>{stats.completionPercentage}%</span>
            </div>
            <ProgressBar value={stats.attempted} max={stats.total} />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {topicBreakdown.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-navy-700 dark:text-mist-200/80 font-medium">{t.topic}</span>
                  <span className="text-navy-400 dark:text-mist-200/40">
                    {t.attempted}/{t.totalQuestions} {t.accuracy !== null ? `· ${t.accuracy}%` : ""}
                  </span>
                </div>
                <ProgressBar
                  value={t.attempted}
                  max={t.totalQuestions}
                  colorClass={t.accuracy !== null && t.accuracy < 60 ? "bg-rose-500" : t.accuracy !== null && t.accuracy >= 80 ? "bg-mint-500" : "bg-signal-500"}
                  height="h-1.5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: strong/weak + recent mocks */}
        <div className="space-y-4 md:space-y-6">
          <div className="surface rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-mint-500" /> Strong Topics
            </h2>
            {stats.strongTopics.length === 0 ? (
              <p className="text-xs text-navy-400 dark:text-mist-200/40">Answer more questions to reveal your strengths.</p>
            ) : (
              <ul className="space-y-2">
                {stats.strongTopics.slice(0, 5).map((t) => (
                  <li key={t.topic} className="flex justify-between text-sm">
                    <span className="truncate">{t.topic}</span>
                    <span className="text-mint-600 dark:text-mint-500 font-semibold shrink-0 ml-2">
                      {Math.round(t.accuracy * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-1.5">
              <Target size={16} className="text-rose-500" /> Weak Topics
            </h2>
            {stats.weakTopics.length === 0 ? (
              <p className="text-xs text-navy-400 dark:text-mist-200/40">No weak spots detected yet — keep going.</p>
            ) : (
              <>
                <ul className="space-y-2 mb-3">
                  {stats.weakTopics.slice(0, 5).map((t) => (
                    <li key={t.topic} className="flex justify-between text-sm">
                      <span className="truncate">{t.topic}</span>
                      <span className="text-rose-500 font-semibold shrink-0 ml-2">{Math.round(t.accuracy * 100)}%</span>
                    </li>
                  ))}
                </ul>
                <Link to="/practice?mode=weak">
                  <Button variant="secondary" className="w-full text-xs py-2">
                    Practice weak topics
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-3">Recent Mock Scores</h2>
            {recentMocks.length === 0 ? (
              <p className="text-xs text-navy-400 dark:text-mist-200/40">No mock tests taken yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentMocks.map((m) => (
                  <li key={m.id} className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-navy-500 dark:text-mist-200/60 truncate">
                      {m.title || "Mock Test"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {m.marksObtained !== undefined ? `${m.marksObtained}/${m.totalMarks}` : `${m.correctCount}/${m.totalQuestions}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
