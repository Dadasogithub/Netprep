import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Award,
  X,
} from "lucide-react";
import { Button, ProgressBar, DifficultyPill, TopicPill } from "./ui";
import QuestionCard from "./QuestionCard";
import TimerBadge, { formatTime } from "./Timer";
import { recordAttempt, saveMockResult } from "../services/storageService";

/**
 * Generic timed-mock engine. Renders the active question-answering phase and
 * the marks-aware results/review phase. Used for:
 *  - the built-in Full-Length (50Q) and IT Professional Knowledge (25Q) mocks
 *  - any user-uploaded custom mock test
 * The caller supplies the question set + scoring config; this component
 * owns the timer, palette, submission, and review UI so all three mock
 * flavors behave identically.
 */
export default function MockRunner({
  title,
  questions,
  durationMinutes,
  marksPerQuestion = 1,
  totalMarks,
  negativeMarking = 0,
  sourceId = "standard",
  onExit,
  onRestart,
}) {
  const [phase, setPhase] = useState("active"); // active | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [result, setResult] = useState(null);
  const [reviewExpanded, setReviewExpanded] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("all");

  const computedTotalMarks = totalMarks ?? questions.length * marksPerQuestion;

  const submitMock = useCallback(
    (finalAnswers) => {
      const answersToUse = finalAnswers || answers;
      let correctCount = 0;
      let incorrectCount = 0;
      const topicStats = {};

      questions.forEach((q) => {
        const selected = answersToUse[q.id];
        const isCorrect = selected === q.correctAnswer;
        if (selected !== undefined) {
          recordAttempt(q.id, {
            selectedIndex: selected,
            correctIndex: q.correctAnswer,
            timeSpentSeconds: null,
            topic: q.topic,
          });
          if (isCorrect) correctCount += 1;
          else incorrectCount += 1;
        }
        if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
        topicStats[q.topic].total += 1;
        if (isCorrect) topicStats[q.topic].correct += 1;
      });

      const unansweredCount = questions.length - correctCount - incorrectCount;
      const marksObtained =
        Math.round((correctCount * marksPerQuestion - incorrectCount * negativeMarking) * 100) / 100;

      const mockResult = {
        sourceId,
        title,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount,
        unansweredCount,
        durationMinutes,
        timeTakenSeconds: durationMinutes * 60 - secondsLeft,
        topicStats,
        questionIds: questions.map((q) => q.id),
        totalMarks: computedTotalMarks,
        marksPerQuestion,
        negativeMarking,
        marksObtained,
      };
      saveMockResult(mockResult);
      setResult(mockResult);
      setPhase("result");
    },
    [answers, questions, durationMinutes, secondsLeft, marksPerQuestion, negativeMarking, computedTotalMarks, sourceId, title]
  );

  useEffect(() => {
    if (phase !== "active") return;
    if (secondsLeft <= 0) {
      submitMock(answers);
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const currentQuestion = questions[current];

  const selectOption = (idx) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const questionStatus = (q, idx) => {
    const answered = answers[q.id] !== undefined;
    const isFlagged = flagged.has(q.id);
    if (idx === current) return "current";
    if (isFlagged) return "flagged";
    if (answered) return "answered";
    return "unanswered";
  };

  const statusStyles = {
    current: "bg-signal-500 text-navy-950 ring-2 ring-signal-300",
    flagged: "bg-amber-500 text-navy-950",
    answered: "bg-mint-500/80 text-navy-950",
    unanswered: "bg-mist-200 dark:bg-navy-700 text-navy-500 dark:text-mist-200/60",
  };

  const filteredReview = useMemo(() => {
    if (!result) return [];
    return questions.filter((q) => {
      const selected = answers[q.id];
      if (reviewFilter === "correct") return selected === q.correctAnswer;
      if (reviewFilter === "incorrect") return selected !== undefined && selected !== q.correctAnswer;
      if (reviewFilter === "unanswered") return selected === undefined;
      return true;
    });
  }, [reviewFilter, result, questions, answers]);

  if (!currentQuestion && phase === "active") return null;

  // ---------------- ACTIVE ----------------
  if (phase === "active") {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="font-display font-bold truncate">{title}</p>
            <p className="text-xs text-navy-400 dark:text-mist-200/40">
              {answeredCount}/{questions.length} answered &middot; {computedTotalMarks} marks total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TimerBadge secondsLeft={secondsLeft} />
            {onExit && (
              <button
                onClick={onExit}
                aria-label="Exit mock test"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-mist-100 dark:hover:bg-navy-700 text-navy-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <div className="surface rounded-xl p-3">
          <div className="grid grid-cols-10 sm:grid-cols-[repeat(25,minmax(0,1fr))] gap-1.5">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrent(idx)}
                className={`aspect-square rounded-md text-[10px] font-mono-ui font-semibold flex items-center justify-center transition-colors ${statusStyles[questionStatus(q, idx)]}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-navy-400 dark:text-mist-200/50">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-mint-500/80" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Flagged</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-mist-200 dark:bg-navy-700" /> Unanswered</span>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 md:p-7">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-ui text-navy-400 dark:text-mist-200/40">
                Q{current + 1} / {questions.length}
              </span>
              <TopicPill topic={currentQuestion.topic} />
              <DifficultyPill difficulty={currentQuestion.difficulty} />
              <span className="text-[11px] text-navy-400 dark:text-mist-200/40 font-mono-ui">
                +{marksPerQuestion} mark{marksPerQuestion !== 1 ? "s" : ""}
                {negativeMarking > 0 ? ` / -${negativeMarking}` : ""}
              </span>
            </div>
            <button
              onClick={toggleFlag}
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                flagged.has(currentQuestion.id) ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "hover:bg-mist-100 dark:hover:bg-navy-700 text-navy-400"
              }`}
            >
              <Flag size={13} fill={flagged.has(currentQuestion.id) ? "currentColor" : "none"} /> Flag for review
            </button>
          </div>

          <p className="text-base md:text-lg font-medium leading-relaxed mb-5">{currentQuestion.question}</p>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                  answers[currentQuestion.id] === idx
                    ? "border-signal-500 bg-signal-500/10"
                    : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                }`}
              >
                <span className="text-sm md:text-[15px]">
                  <span className="font-mono-ui font-semibold mr-2 text-navy-400 dark:text-mist-200/40">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ChevronLeft size={16} /> Previous
          </Button>
          <div className="flex gap-2">
            {current < questions.length - 1 && (
              <Button variant="secondary" onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
                Next <ChevronRight size={16} />
              </Button>
            )}
            <Button variant="danger" onClick={() => submitMock(answers)}>
              <Send size={15} /> Submit Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- RESULT ----------------
  if (phase === "result" && result) {
    return (
      <div className="space-y-6">
        <div className="surface rounded-2xl p-6 md:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-500 to-signal-500 flex items-center justify-center mx-auto mb-3">
            <Award size={24} className="text-navy-950" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">{title} &mdash; Complete</h1>
          <p className="text-sm text-navy-500 dark:text-mist-200/60 mb-1">
            {result.correctCount} / {result.totalQuestions} correct
          </p>
          <p className="text-3xl font-display font-bold text-signal-500 mb-6">
            {result.marksObtained} <span className="text-base font-normal text-navy-400 dark:text-mist-200/50">/ {result.totalMarks} marks</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <ResultStat icon={CheckCircle2} label="Correct" value={result.correctCount} color="text-mint-500" />
            <ResultStat icon={XCircle} label="Incorrect" value={result.incorrectCount} color="text-rose-500" />
            <ResultStat icon={MinusCircle} label="Unanswered" value={result.unansweredCount} color="text-navy-400" />
            <ResultStat icon={Award} label="Time Taken" value={formatTime(result.timeTakenSeconds)} color="text-signal-500" />
          </div>
        </div>

        <div className="surface rounded-2xl p-5 md:p-6">
          <h2 className="font-display font-semibold mb-4">Topic-wise Performance</h2>
          <div className="space-y-3">
            {Object.entries(result.topicStats).map(([topic, stat]) => (
              <div key={topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{topic}</span>
                  <span className="text-navy-400 dark:text-mist-200/40">
                    {stat.correct}/{stat.total}
                  </span>
                </div>
                <ProgressBar
                  value={stat.correct}
                  max={stat.total}
                  colorClass={stat.correct / stat.total >= 0.7 ? "bg-mint-500" : stat.correct / stat.total >= 0.4 ? "bg-amber-500" : "bg-rose-500"}
                  height="h-1.5"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-display font-semibold">Review Answers</h2>
            <div className="flex gap-1.5">
              {["all", "correct", "incorrect", "unanswered"].map((f) => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                    reviewFilter === f
                      ? "bg-signal-500 text-navy-950 border-signal-500 font-semibold"
                      : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredReview.map((q) => (
            <div key={q.id}>
              <button
                onClick={() => setReviewExpanded(reviewExpanded === q.id ? null : q.id)}
                className="w-full surface rounded-xl p-4 flex items-center justify-between gap-3 text-left hover:border-signal-400 transition-colors"
              >
                <span className="text-sm truncate flex-1">{q.question}</span>
                {answers[q.id] === q.correctAnswer ? (
                  <CheckCircle2 size={16} className="text-mint-500 shrink-0" />
                ) : answers[q.id] === undefined ? (
                  <MinusCircle size={16} className="text-navy-400 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-rose-500 shrink-0" />
                )}
              </button>
              {reviewExpanded === q.id && (
                <div className="mt-2">
                  <QuestionCard question={q} mode="mock" revealed selectedIndex={answers[q.id]} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRestart && (
            <Button onClick={onRestart} className="flex-1">
              <RotateCcw size={16} /> Take Another Attempt
            </Button>
          )}
          {onExit && (
            <Button variant="secondary" onClick={onExit} className="flex-1">
              Back to List
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function ResultStat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-3 bg-mist-50 dark:bg-navy-800 flex items-center gap-2.5">
      <Icon size={18} className={color} />
      <div>
        <p className="font-display font-bold text-lg leading-none">{value}</p>
        <p className="text-[11px] text-navy-400 dark:text-mist-200/50 mt-1">{label}</p>
      </div>
    </div>
  );
}
