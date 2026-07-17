import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Shuffle,
  ListFilter,
  Bookmark,
  XCircle,
  Target,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button, EmptyState, ProgressBar } from "../components/ui";
import QuestionCard from "../components/QuestionCard";
import {
  filterQuestions,
  getTopics,
  getSubtopics,
  getDifficulties,
  getBookmarkedQuestions,
  getIncorrectQuestions,
  getWeakTopicQuestions,
  getAllQuestions,
} from "../services/questionService";
import { recordAttempt } from "../services/storageService";

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MODES = [
  { id: "topic", label: "Topic-wise", icon: ListFilter },
  { id: "difficulty", label: "Difficulty-wise", icon: Target },
  { id: "random", label: "Random", icon: Shuffle },
  { id: "weak", label: "Weak Topics", icon: Target },
  { id: "bookmarked", label: "Bookmarked", icon: Bookmark },
  { id: "incorrect", label: "Incorrect Only", icon: XCircle },
];

export default function Practice() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "random";

  const [mode, setMode] = useState(initialMode);
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [session, setSession] = useState(null); // { questions, index }
  const [answers, setAnswers] = useState({}); // questionId -> selectedIndex
  const [startTime, setStartTime] = useState(null);

  const topics = useMemo(() => ["All", ...getTopics()], []);
  const difficulties = useMemo(() => ["All", ...getDifficulties()], []);

  const buildQuestionPool = () => {
    switch (mode) {
      case "topic":
        return filterQuestions({ topic, searchTerm });
      case "difficulty":
        return filterQuestions({ difficulty, searchTerm });
      case "weak":
        return getWeakTopicQuestions();
      case "bookmarked":
        return getBookmarkedQuestions();
      case "incorrect":
        return getIncorrectQuestions();
      case "random":
      default:
        return searchTerm ? filterQuestions({ searchTerm }) : getAllQuestions();
    }
  };

  const pool = buildQuestionPool();

  const startSession = () => {
    if (pool.length === 0) return;
    setSession({ questions: shuffleArr(pool), index: 0 });
    setAnswers({});
    setStartTime(Date.now());
  };

  const exitSession = () => setSession(null);

  const currentQuestion = session ? session.questions[session.index] : null;

  const handleAnswer = (selectedIndex) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedIndex }));
    recordAttempt(currentQuestion.id, {
      selectedIndex,
      correctIndex: currentQuestion.correctAnswer,
      timeSpentSeconds: startTime ? Math.round((Date.now() - startTime) / 1000) : null,
      topic: currentQuestion.topic,
    });
  };

  const goNext = () => {
    if (!session) return;
    if (session.index < session.questions.length - 1) {
      setSession((s) => ({ ...s, index: s.index + 1 }));
      setStartTime(Date.now());
    }
  };

  const goPrev = () => {
    if (!session) return;
    if (session.index > 0) {
      setSession((s) => ({ ...s, index: s.index - 1 }));
      setStartTime(Date.now());
    }
  };

  // Keyboard shortcuts within session
  useEffect(() => {
    if (!session) return;
    const handler = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < currentQuestion?.options.length) handleAnswer(idx);
      } else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentQuestion]);

  if (session) {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={exitSession} className="px-2">
            <ChevronLeft size={16} /> Exit session
          </Button>
          <div className="flex-1 max-w-xs">
            <ProgressBar value={session.index + 1} max={session.questions.length} height="h-1.5" />
          </div>
          <span className="text-xs text-navy-400 dark:text-mist-200/40 font-mono-ui shrink-0">
            {answeredCount}/{session.questions.length} answered
          </span>
        </div>

        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={session.index + 1}
          totalQuestions={session.questions.length}
          onAnswer={handleAnswer}
          mode="practice"
        />

        <div className="flex justify-between">
          <Button variant="secondary" onClick={goPrev} disabled={session.index === 0}>
            <ChevronLeft size={16} /> Previous
          </Button>
          {session.index === session.questions.length - 1 ? (
            <Button variant="success" onClick={exitSession}>
              Finish Session
            </Button>
          ) : (
            <Button onClick={goNext} disabled={answers[currentQuestion.id] === undefined}>
              Next <ChevronRight size={16} />
            </Button>
          )}
        </div>
        <p className="text-center text-[11px] text-navy-400 dark:text-mist-200/40">
          Tip: press 1-4 to answer, ← → to navigate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Practice Mode</h1>
        <p className="text-sm text-navy-500 dark:text-mist-200/60">
          Choose how you want to drill — every question includes full explanations, memory tricks, and exam tips.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`surface rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-colors ${
              mode === id ? "border-signal-500 ring-1 ring-signal-500" : "hover:border-signal-400"
            }`}
          >
            <Icon size={18} className={mode === id ? "text-signal-500" : "text-navy-400 dark:text-mist-200/50"} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="surface rounded-2xl p-5 space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, topics, or subtopics..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-mist-200 dark:border-navy-600 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-signal-500"
          />
        </div>

        {mode === "topic" && (
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  topic === t
                    ? "bg-signal-500 text-navy-950 border-signal-500 font-semibold"
                    : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {mode === "difficulty" && (
          <div className="flex flex-wrap gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  difficulty === d
                    ? "bg-signal-500 text-navy-950 border-signal-500 font-semibold"
                    : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-mist-200 dark:border-navy-700">
          <span className="text-sm text-navy-500 dark:text-mist-200/60">
            <span className="font-semibold text-navy-800 dark:text-mist-100">{pool.length}</span> question
            {pool.length !== 1 ? "s" : ""} match this selection
          </span>
          <Button onClick={startSession} disabled={pool.length === 0}>
            <RotateCcw size={15} /> Start Practice
          </Button>
        </div>
      </div>

      {pool.length === 0 && (
        <EmptyState
          icon={ListFilter}
          title="No questions match this filter"
          description="Try a different mode, topic, or clear your search term."
        />
      )}
    </div>
  );
}
