import { useEffect, useState } from "react";
import { Bookmark, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, EmptyState, ProgressBar } from "../components/ui";
import QuestionCard from "../components/QuestionCard";
import { getBookmarkedQuestions } from "../services/questionService";
import { recordAttempt } from "../services/storageService";

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Bookmarks() {
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);

  const refresh = () => setQuestions(getBookmarkedQuestions());

  useEffect(() => {
    refresh();
  }, []);

  const startSession = () => {
    setSession({ questions: shuffleArr(questions), index: 0 });
  };

  const handleAnswer = (selectedIndex) => {
    const q = session.questions[session.index];
    recordAttempt(q.id, { selectedIndex, correctIndex: q.correctAnswer, timeSpentSeconds: null, topic: q.topic });
  };

  if (session) {
    const q = session.questions[session.index];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => { setSession(null); refresh(); }} className="px-2">
            <ChevronLeft size={16} /> Exit
          </Button>
          <div className="flex-1 max-w-xs">
            <ProgressBar value={session.index + 1} max={session.questions.length} height="h-1.5" />
          </div>
          <span className="text-xs text-navy-400 font-mono-ui shrink-0">
            {session.index + 1}/{session.questions.length}
          </span>
        </div>
        <QuestionCard
          key={q.id}
          question={q}
          questionNumber={session.index + 1}
          totalQuestions={session.questions.length}
          onAnswer={handleAnswer}
          mode="practice"
        />
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={() => setSession((s) => ({ ...s, index: Math.max(0, s.index - 1) }))}
            disabled={session.index === 0}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          {session.index === session.questions.length - 1 ? (
            <Button variant="success" onClick={() => { setSession(null); refresh(); }}>
              Finish
            </Button>
          ) : (
            <Button onClick={() => setSession((s) => ({ ...s, index: s.index + 1 }))}>
              Next <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Bookmarked Questions</h1>
          <p className="text-sm text-navy-500 dark:text-mist-200/60">
            {questions.length} question{questions.length !== 1 ? "s" : ""} saved for focused revision.
          </p>
        </div>
        {questions.length > 0 && (
          <Button onClick={startSession}>
            <RotateCcw size={16} /> Practice Bookmarks
          </Button>
        )}
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Tap the bookmark icon on any question during practice to save it here for quick revision later."
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} mode="practice" />
          ))}
        </div>
      )}
    </div>
  );
}
