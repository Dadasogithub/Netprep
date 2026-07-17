import { useState } from "react";
import { Timer as TimerIcon, RotateCcw, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import MockRunner from "../components/MockRunner";
import { selectMockTestQuestions } from "../services/questionService";

// Built-in mock presets. Each preset defines how many questions are drawn
// from the master bank, how marks are allocated, and the duration choices
// offered on the setup screen. Adding a new preset here is enough to expose
// it throughout the app — MockRunner handles the rest generically.
const PRESETS = [
  {
    id: "full-length",
    title: "Full-Length Mock Test",
    description: "50 questions drawn from the entire bank. No repeats until every question has been used once.",
    questionCount: 50,
    marksPerQuestion: 1,
    durations: [30, 40, 50],
    defaultDuration: 40,
  },
  {
    id: "itpk-25",
    title: "IT Professional Knowledge Mock",
    description: "A focused 25-question, 50-mark mock — 2 marks per question, matching a typical sectional test.",
    questionCount: 25,
    marksPerQuestion: 2,
    durations: [15, 20, 30],
    defaultDuration: 20,
  },
];

export default function MockTest() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [durationMinutes, setDurationMinutes] = useState(PRESETS[0].defaultDuration);
  const [session, setSession] = useState(null); // { questions } when active

  const choosePreset = (preset) => {
    setSelectedPreset(preset);
    setDurationMinutes(preset.defaultDuration);
  };

  const startMock = () => {
    const qs = selectMockTestQuestions(selectedPreset.questionCount);
    setSession({ questions: qs });
  };

  if (session) {
    return (
      <MockRunner
        key={session.questions.map((q) => q.id).join(",")}
        title={selectedPreset.title}
        questions={session.questions}
        durationMinutes={durationMinutes}
        marksPerQuestion={selectedPreset.marksPerQuestion}
        totalMarks={selectedPreset.questionCount * selectedPreset.marksPerQuestion}
        sourceId={selectedPreset.id}
        onExit={() => setSession(null)}
        onRestart={startMock}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-signal-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
          <TimerIcon size={24} className="text-navy-950" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Mock Test</h1>
        <p className="text-sm text-navy-500 dark:text-mist-200/60">
          Choose a mock format below, or run one of your own uploaded tests.
        </p>
      </div>

      <div className="surface rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-sm font-semibold mb-2.5">Choose a mock format</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => choosePreset(preset)}
                className={`text-left rounded-xl p-4 border transition-colors ${
                  selectedPreset.id === preset.id
                    ? "border-signal-500 ring-1 ring-signal-500 bg-signal-500/5"
                    : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                }`}
              >
                <p className="font-display font-semibold text-sm mb-1">{preset.title}</p>
                <p className="text-[11px] text-navy-500 dark:text-mist-200/60 mb-2">{preset.description}</p>
                <p className="text-xs font-mono-ui text-signal-600 dark:text-signal-400">
                  {preset.questionCount} Q &middot; {preset.questionCount * preset.marksPerQuestion} marks
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2.5">Choose your time limit</p>
          <div className="grid grid-cols-3 gap-2">
            {selectedPreset.durations.map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`rounded-xl px-3 py-3 text-center border transition-colors ${
                  durationMinutes === mins
                    ? "border-signal-500 ring-1 ring-signal-500 bg-signal-500/5"
                    : "border-mist-200 dark:border-navy-600 hover:border-signal-400"
                }`}
              >
                <p className="font-display font-bold text-lg">{mins}</p>
                <p className="text-[11px] text-navy-400 dark:text-mist-200/50">min</p>
              </button>
            ))}
          </div>
        </div>

        <ul className="text-xs text-navy-500 dark:text-mist-200/60 space-y-1.5 border-t border-mist-200 dark:border-navy-700 pt-4">
          <li>&bull; Answers are not revealed until you submit — just like the real exam.</li>
          <li>&bull; Use the question palette to jump between questions and flag ones for review.</li>
          <li>&bull; The test auto-submits when the timer reaches zero.</li>
          <li>&bull; Full performance analysis with topic-wise breakdown after submission.</li>
        </ul>

        <Button onClick={startMock} className="w-full">
          <RotateCcw size={16} /> Start {selectedPreset.title}
        </Button>
      </div>

      <Link to="/custom-mocks" className="block">
        <div className="surface rounded-2xl p-5 flex items-center gap-4 hover:border-signal-400 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <UploadCloud size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">Have your own question set?</p>
            <p className="text-xs text-navy-500 dark:text-mist-200/60">
              Upload a JSON file to create a custom named mock test — manage and delete them anytime.
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
