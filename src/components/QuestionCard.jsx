import { useState, useEffect } from "react";
import { Bookmark, Check, X, Lightbulb, Clock, GraduationCap } from "lucide-react";
import { DifficultyPill, TopicPill } from "./ui";
import { toggleBookmark, isBookmarked } from "../services/storageService";

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer, // (selectedIndex) => void
  mode = "practice", // "practice" | "mock"
  revealed: revealedProp, // for mock mode, parent controls reveal (review screen)
  selectedIndex: selectedProp,
}) {
  const [selected, setSelected] = useState(selectedProp ?? null);
  const [revealed, setRevealed] = useState(mode === "mock" ? !!revealedProp : false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setSelected(selectedProp ?? null);
    setRevealed(mode === "mock" ? !!revealedProp : false);
    setBookmarked(isBookmarked(question.id));
  }, [question.id, selectedProp, revealedProp, mode]);

  const handleSelect = (idx) => {
    if (revealed && mode === "practice") return;
    setSelected(idx);
    if (mode === "practice") {
      setRevealed(true);
    }
    onAnswer?.(idx);
  };

  const handleBookmark = () => {
    toggleBookmark(question.id);
    setBookmarked((b) => !b);
  };

  const isCorrectSelected = selected === question.correctAnswer;

  return (
    <div className="surface rounded-2xl p-5 md:p-7 animate-fade-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {questionNumber && (
            <span className="text-xs font-mono-ui text-navy-400 dark:text-mist-200/40">
              Q{questionNumber}{totalQuestions ? ` / ${totalQuestions}` : ""}
            </span>
          )}
          <TopicPill topic={question.topic} />
          <DifficultyPill difficulty={question.difficulty} />
          {question.estimatedTime && (
            <span className="text-[11px] flex items-center gap-1 text-navy-400 dark:text-mist-200/40">
              <Clock size={12} /> ~{question.estimatedTime}s
            </span>
          )}
        </div>
        <button
          onClick={handleBookmark}
          aria-label="Bookmark question"
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            bookmarked ? "text-amber-500 bg-amber-500/10" : "text-navy-400 hover:bg-mist-100 dark:hover:bg-navy-700"
          }`}
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="text-base md:text-lg font-medium leading-relaxed mb-5">{question.question}</p>

      <div className="space-y-2.5">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrectOption = idx === question.correctAnswer;
          let stateClass = "border-mist-200 dark:border-navy-600 hover:border-signal-400 dark:hover:border-signal-500";
          if (revealed) {
            if (isCorrectOption) {
              stateClass = "border-mint-500 bg-mint-500/10";
            } else if (isSelected && !isCorrectOption) {
              stateClass = "border-rose-500 bg-rose-500/10";
            } else {
              stateClass = "border-mist-200 dark:border-navy-600 opacity-60";
            }
          } else if (isSelected) {
            stateClass = "border-signal-500 bg-signal-500/10";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed && mode === "practice"}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex items-center justify-between gap-3 ${stateClass}`}
            >
              <span className="text-sm md:text-[15px]">
                <span className="font-mono-ui font-semibold mr-2 text-navy-400 dark:text-mist-200/40">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </span>
              {revealed && isCorrectOption && <Check size={17} className="text-mint-500 shrink-0" />}
              {revealed && isSelected && !isCorrectOption && <X size={17} className="text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-5 space-y-3 animate-fade-up">
          <div
            className={`rounded-xl p-4 border ${
              isCorrectSelected
                ? "border-mint-500/30 bg-mint-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <p className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
              <GraduationCap size={16} />
              Explanation
            </p>
            <p className="text-sm text-navy-700 dark:text-mist-200/80 leading-relaxed">{question.explanation}</p>
          </div>

          {question.incorrectExplanations && Object.keys(question.incorrectExplanations).length > 0 && (
            <div className="rounded-xl p-4 border border-mist-200 dark:border-navy-600">
              <p className="text-sm font-semibold mb-2">Why the other options are incorrect</p>
              <ul className="space-y-1.5">
                {Object.entries(question.incorrectExplanations).map(([idx, text]) => (
                  <li key={idx} className="text-sm text-navy-600 dark:text-mist-200/70 leading-relaxed">
                    <span className="font-mono-ui font-semibold mr-1.5">{String.fromCharCode(65 + Number(idx))}.</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(question.memoryTrick || question.examTip) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {question.memoryTrick && (
                <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Lightbulb size={13} /> Memory Trick
                  </p>
                  <p className="text-xs text-navy-600 dark:text-mist-200/70 leading-relaxed">{question.memoryTrick}</p>
                </div>
              )}
              {question.examTip && (
                <div className="rounded-xl p-3.5 bg-signal-500/10 border border-signal-500/20">
                  <p className="text-xs font-semibold mb-1 text-signal-600 dark:text-signal-400">Exam Tip</p>
                  <p className="text-xs text-navy-600 dark:text-mist-200/70 leading-relaxed">{question.examTip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
