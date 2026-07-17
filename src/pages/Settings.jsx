import { useEffect, useState } from "react";
import { Sun, Moon, Keyboard, Trash2, Download, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui";
import { useTheme } from "../context/ThemeContext";
import { getSettings, updateSettings, resetAllProgress, getAttempts, getMockHistory, getBookmarks } from "../services/storageService";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(getSettings());
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const toggleShortcuts = () => {
    const updated = updateSettings({ keyboardShortcuts: !settings.keyboardShortcuts });
    setSettings(updated);
  };

  const handleExport = () => {
    const data = {
      attempts: getAttempts(),
      mockHistory: getMockHistory(),
      bookmarks: getBookmarks(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `netprep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetAllProgress();
    setConfirmingReset(false);
    window.location.reload();
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-navy-500 dark:text-mist-200/60">Manage appearance, preferences, and your local data.</p>
      </div>

      <div className="surface rounded-2xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Appearance</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-2 transition-colors ${
              theme === "light" ? "border-signal-500 ring-1 ring-signal-500" : "border-mist-200 dark:border-navy-600"
            }`}
          >
            <Sun size={18} />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-2 transition-colors ${
              theme === "dark" ? "border-signal-500 ring-1 ring-signal-500" : "border-mist-200 dark:border-navy-600"
            }`}
          >
            <Moon size={18} />
            <span className="text-xs font-medium">Dark</span>
          </button>
        </div>
      </div>

      <div className="surface rounded-2xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Preferences</h2>
        <button onClick={toggleShortcuts} className="w-full flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Keyboard size={16} /> Keyboard shortcuts in practice (1-4, ←→)
          </span>
          <span
            className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
              settings.keyboardShortcuts ? "bg-signal-500 justify-end" : "bg-mist-200 dark:bg-navy-600 justify-start"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white block" />
          </span>
        </button>
      </div>

      <div className="surface rounded-2xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Your Data</h2>
        <p className="text-xs text-navy-500 dark:text-mist-200/60">
          All progress is stored locally in your browser's Local Storage — nothing leaves your device. You can export a
          backup or reset everything below. Note: resetting progress does <span className="font-semibold">not</span>{" "}
          delete your uploaded Custom Mock Tests — remove those individually from the Custom Mocks page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={handleExport} className="flex-1">
            <Download size={15} /> Export Progress (JSON)
          </Button>
          <Button variant={confirmingReset ? "danger" : "secondary"} onClick={handleReset} className="flex-1">
            <Trash2 size={15} /> {confirmingReset ? "Confirm Reset" : "Reset All Progress"}
          </Button>
        </div>
        {confirmingReset && (
          <p className="text-xs text-rose-500 flex items-center gap-1.5">
            <AlertTriangle size={13} /> This will permanently erase all attempts, bookmarks, and mock history. Click
            "Confirm Reset" again to proceed, or navigate away to cancel.
          </p>
        )}
      </div>
    </div>
  );
}
