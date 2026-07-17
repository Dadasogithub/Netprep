import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileJson,
  Trash2,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button, EmptyState } from "../components/ui";
import MockRunner from "../components/MockRunner";
import {
  validateAndNormalizeMock,
  parseJsonFile,
  listCustomMocks,
  saveCustomMock,
  removeCustomMock,
  buildSampleTemplate,
} from "../services/customMockService";
import { getAllQuestions } from "../services/questionService";

export default function CustomMocks() {
  const [mocks, setMocks] = useState([]);
  const [uploadState, setUploadState] = useState(null); // { errors, warnings } | null
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeMock, setActiveMock] = useState(null); // the mock being taken right now
  const fileInputRef = useRef(null);

  const refresh = () => setMocks(listCustomMocks());

  useEffect(() => {
    refresh();
  }, []);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseJsonFile(reader.result);
      if (!parsed.ok) {
        setUploadState({ errors: [parsed.error], warnings: [] });
        return;
      }
      const { valid, errors, warnings, normalized } = validateAndNormalizeMock(parsed.data, file.name);
      if (!valid) {
        setUploadState({ errors, warnings });
        return;
      }
      try {
        saveCustomMock(normalized);
        setUploadState({ errors: [], warnings, success: `"${normalized.title}" added — ${normalized.questionCount} questions, ${normalized.totalMarks} marks.` });
        refresh();
      } catch (err) {
        setUploadState({ errors: [err.message], warnings: [] });
      }
    };
    reader.onerror = () => setUploadState({ errors: ["Could not read that file. Please try again."], warnings: [] });
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const sample = getAllQuestions().slice(0, 25);
    const template = buildSampleTemplate(sample);
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "it-professional-knowledge-mock-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    removeCustomMock(id);
    setConfirmDeleteId(null);
    refresh();
  };

  const startMock = (mock) => setActiveMock(mock);

  if (activeMock) {
    return (
      <MockRunner
        key={activeMock.id + Date.now()}
        title={activeMock.title}
        questions={activeMock.questions}
        durationMinutes={activeMock.durationMinutes}
        marksPerQuestion={activeMock.marksPerQuestion}
        totalMarks={activeMock.totalMarks}
        negativeMarking={activeMock.negativeMarking}
        sourceId={activeMock.id}
        onExit={() => setActiveMock(null)}
        onRestart={() => setActiveMock({ ...activeMock })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
          <FileJson size={22} className="text-signal-500" /> Custom Mock Tests
        </h1>
        <p className="text-sm text-navy-500 dark:text-mist-200/60">
          Upload your own JSON question sets to create additional mock tests. Everything is stored only in this
          browser's Local Storage — no server, no database — and you can delete any test at any time.
        </p>
      </div>

      {/* Upload box */}
      <div className="surface rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-signal-500/15 flex items-center justify-center shrink-0">
            <UploadCloud size={24} className="text-signal-500" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display font-semibold">Upload a mock test JSON file</p>
            <p className="text-xs text-navy-500 dark:text-mist-200/60 mt-0.5">
              Not sure of the format? Download the template below — it's a real, ready-to-upload example named
              "IT Professional Knowledge Mock" (25 questions, 50 marks).
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              <Download size={15} /> Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={15} /> Upload JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>
        </div>

        {uploadState && (
          <div className="mt-4 space-y-2">
            {uploadState.success && (
              <div className="rounded-xl p-3.5 bg-mint-500/10 border border-mint-500/25 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-mint-500 mt-0.5 shrink-0" />
                <p className="text-sm text-mint-700 dark:text-mint-400">{uploadState.success}</p>
              </div>
            )}
            {uploadState.errors?.length > 0 && (
              <div className="rounded-xl p-3.5 bg-rose-500/10 border border-rose-500/25">
                <p className="text-sm font-semibold text-rose-500 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle size={15} /> Couldn't add this file
                </p>
                <ul className="text-xs text-rose-500/90 space-y-1 list-disc list-inside">
                  {uploadState.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {uploadState.warnings?.length > 0 && (
              <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/25">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <Info size={15} /> Heads up
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-400/90 space-y-1 list-disc list-inside">
                  {uploadState.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schema reference */}
      <details className="surface rounded-2xl p-5 group">
        <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2">
          <Info size={15} className="text-signal-500" /> JSON format reference
        </summary>
        <pre className="mt-3 text-[11px] font-mono-ui bg-mist-50 dark:bg-navy-900 rounded-lg p-4 overflow-x-auto leading-relaxed">
{`{
  "title": "IT Professional Knowledge Mock",
  "totalMarks": 50,          // optional, default = questions.length * 2
  "durationMinutes": 20,     // optional, default auto-calculated
  "negativeMarking": 0,      // optional, marks deducted per wrong answer
  "questions": [
    {
      "question": "Which layer handles logical addressing?",
      "options": ["Data Link", "Network", "Transport", "Session"],
      "correctAnswer": 1,          // index into "options" (0-based)
      "explanation": "...",        // optional but recommended
      "incorrectExplanations": { "0": "...", "2": "...", "3": "..." },
      "topic": "OSI Model",        // optional
      "difficulty": "Moderate",    // optional: Easy | Moderate | Hard
      "estimatedTime": 30,         // optional, seconds
      "memoryTrick": "...",        // optional
      "examTip": "..."             // optional
    }
  ]
}`}
        </pre>
        <p className="text-xs text-navy-500 dark:text-mist-200/60 mt-2">
          Only <span className="font-mono-ui">title</span>, <span className="font-mono-ui">questions[].question</span>,{" "}
          <span className="font-mono-ui">options</span>, and <span className="font-mono-ui">correctAnswer</span> are
          required — everything else has a sensible default. You can also use{" "}
          <span className="font-mono-ui">"answer": "exact option text"</span> instead of a numeric{" "}
          <span className="font-mono-ui">correctAnswer</span>.
        </p>
      </details>

      {/* List of uploaded mocks */}
      <div>
        <h2 className="font-display font-semibold mb-3">Your Uploaded Mock Tests</h2>
        {mocks.length === 0 ? (
          <EmptyState
            icon={FileJson}
            title="No custom mock tests yet"
            description="Upload a JSON file above to create your first custom mock test."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {mocks.map((m) => (
              <div key={m.id} className="surface rounded-2xl p-5 flex flex-col gap-3">
                <div>
                  <p className="font-display font-semibold">{m.title}</p>
                  {m.description && <p className="text-xs text-navy-500 dark:text-mist-200/60 mt-0.5">{m.description}</p>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-mono-ui text-navy-500 dark:text-mist-200/60">
                  <span>{m.questionCount} questions</span>
                  <span>{m.totalMarks} marks</span>
                  <span>{m.durationMinutes} min</span>
                  {m.negativeMarking > 0 && <span>-{m.negativeMarking} negative</span>}
                </div>
                <p className="text-[11px] text-navy-400 dark:text-mist-200/40">
                  Uploaded {new Date(m.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-auto pt-1">
                  <Button onClick={() => startMock(m)} className="flex-1">
                    <Play size={14} /> Start
                  </Button>
                  <Button
                    variant={confirmDeleteId === m.id ? "danger" : "secondary"}
                    onClick={() => handleDelete(m.id)}
                    className="px-3"
                  >
                    <Trash2 size={14} />
                    {confirmDeleteId === m.id ? "Confirm" : ""}
                  </Button>
                </div>
                {confirmDeleteId === m.id && (
                  <p className="text-[11px] text-rose-500">Click delete again to permanently remove this test.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
