import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getTopicAccuracyBreakdown, getDifficultyBreakdown, getDashboardStats } from "../services/questionService";
import { getMockHistory, getAttempts } from "../services/storageService";
import { EmptyState } from "../components/ui";
import { BarChart3 } from "lucide-react";

const CHART_COLORS = ["#38bdf8", "#e8a33d", "#34d399", "#f43f5e", "#a78bfa", "#fb923c"];

export default function Analytics() {
  const [topicData, setTopicData] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [mistakePatterns, setMistakePatterns] = useState([]);

  useEffect(() => {
    setTopicData(getTopicAccuracyBreakdown().filter((t) => t.attempted > 0));
    setDifficultyData(getDifficultyBreakdown());
    setMockHistory(getMockHistory());
    setStats(getDashboardStats());

    const attempts = getAttempts();
    const mistakes = Object.entries(attempts)
      .filter(([, a]) => a.incorrectCount > 0)
      .map(([id, a]) => ({ id, topic: a.topic, incorrectCount: a.incorrectCount }))
      .sort((a, b) => b.incorrectCount - a.incorrectCount)
      .slice(0, 8);
    setMistakePatterns(mistakes);
  }, []);

  if (!stats) return null;

  const hasAnyData = stats.attempted > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics yet"
        description="Answer some practice questions or complete a mock test to unlock detailed performance analytics."
      />
    );
  }

  const mockTrend = mockHistory.map((m, i) => ({
    attempt: `#${i + 1}`,
    score: Math.round((m.correctCount / m.totalQuestions) * 100),
  }));

  const difficultyPieData = difficultyData
    .filter((d) => d.attempted > 0)
    .map((d) => ({ name: d.difficulty, value: d.attempted }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-navy-500 dark:text-mist-200/60">
          Deep-dive into your topic accuracy, difficulty distribution, and recurring mistake patterns.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <div className="surface rounded-2xl p-5 md:p-6">
          <h2 className="font-display font-semibold mb-4">Topic-wise Accuracy</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-navy-600)" opacity={0.2} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="topic" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-navy-800)", border: "none", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, "Accuracy"]}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {topicData.map((t, i) => (
                    <Cell key={i} fill={t.accuracy >= 70 ? "#34d399" : t.accuracy >= 40 ? "#e8a33d" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 md:p-6">
          <h2 className="font-display font-semibold mb-4">Questions Attempted by Difficulty</h2>
          <div className="h-72 flex items-center justify-center">
            {difficultyPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={difficultyPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {difficultyPieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--color-navy-800)", border: "none", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-navy-400">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {mockTrend.length > 0 && (
        <div className="surface rounded-2xl p-5 md:p-6">
          <h2 className="font-display font-semibold mb-4">Mock Test Score Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-navy-600)" opacity={0.2} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-navy-800)", border: "none", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, "Score"]}
                />
                <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: "#38bdf8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="surface rounded-2xl p-5 md:p-6">
        <h2 className="font-display font-semibold mb-4">Frequently Missed Concepts</h2>
        {mistakePatterns.length === 0 ? (
          <p className="text-xs text-navy-400 dark:text-mist-200/40">No recurring mistakes detected — great work!</p>
        ) : (
          <div className="space-y-2.5">
            {mistakePatterns.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-navy-600 dark:text-mist-200/70">
                  {m.topic} <span className="text-navy-400 dark:text-mist-200/40 font-mono-ui text-xs">({m.id})</span>
                </span>
                <span className="text-rose-500 font-semibold text-xs">missed {m.incorrectCount}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
