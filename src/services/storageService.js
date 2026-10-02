// storageService.js
// Central abstraction over localStorage. Designed so a backend (REST/GraphQL)
// could later be swapped in behind the same function signatures with minimal
// changes to calling code — every function here is the single source of
// truth for reading/writing persisted app state.

const KEYS = {
  ATTEMPTS: "netprep_attempts_v1", // { [questionId]: { correct, attempts, lastAnsweredIndex, lastAttemptAt } }
  BOOKMARKS: "netprep_bookmarks_v1", // string[] of questionIds
  MOCK_HISTORY: "netprep_mock_history_v1", // MockResult[]
  MOCK_SEEN_POOL: "netprep_mock_seen_pool_v1", // string[] questionIds already used in mocks (resets when exhausted)
  SETTINGS: "netprep_settings_v1", // { theme, keyboardShortcuts }
  STREAK: "netprep_streak_v1", // { lastActiveDate, currentStreak, longestStreak, activeDates: string[] }
  PRACTICE_SESSION: "netprep_practice_session_v1", // in-progress practice/mock session (resume support)
  CUSTOM_MOCKS: "netprep_custom_mocks_v1", // CustomMockTest[] — user-uploaded JSON mock tests
  NOTES: "netprep_notes_v1", // { id, name, createdAt, notes: [...] }
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`storageService: failed to read ${key}`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`storageService: failed to write ${key}`, e);
    return false;
  }
}

// ---------- Attempts (per-question history) ----------

export function getAttempts() {
  return safeGet(KEYS.ATTEMPTS, {});
}

export function recordAttempt(questionId, { selectedIndex, correctIndex, timeSpentSeconds, topic }) {
  const attempts = getAttempts();
  const isCorrect = selectedIndex === correctIndex;
  const prev = attempts[questionId] || {
    attempts: 0,
    correctCount: 0,
    incorrectCount: 0,
    topic,
    firstAttemptAt: new Date().toISOString(),
  };
  attempts[questionId] = {
    ...prev,
    topic,
    attempts: prev.attempts + 1,
    correctCount: prev.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
    lastSelectedIndex: selectedIndex,
    lastCorrect: isCorrect,
    lastTimeSpentSeconds: timeSpentSeconds,
    lastAttemptAt: new Date().toISOString(),
  };
  safeSet(KEYS.ATTEMPTS, attempts);
  bumpStreak();
  return attempts[questionId];
}

export function resetAttempts() {
  safeSet(KEYS.ATTEMPTS, {});
}

// ---------- Bookmarks ----------

export function getBookmarks() {
  return safeGet(KEYS.BOOKMARKS, []);
}

export function toggleBookmark(questionId) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(questionId);
  let updated;
  if (idx === -1) {
    updated = [...bookmarks, questionId];
  } else {
    updated = bookmarks.filter((id) => id !== questionId);
  }
  safeSet(KEYS.BOOKMARKS, updated);
  return updated;
}

export function isBookmarked(questionId) {
  return getBookmarks().includes(questionId);
}

// ---------- Mock test history & no-repeat pool ----------

export function getMockHistory() {
  return safeGet(KEYS.MOCK_HISTORY, []);
}

export function saveMockResult(result) {
  const history = getMockHistory();
  const updated = [...history, { ...result, id: `MOCK-${Date.now()}`, completedAt: new Date().toISOString() }];
  safeSet(KEYS.MOCK_HISTORY, updated);
  bumpStreak();
  return updated;
}

export function getMockSeenPool() {
  return safeGet(KEYS.MOCK_SEEN_POOL, []);
}

export function addToMockSeenPool(questionIds) {
  const pool = new Set(getMockSeenPool());
  questionIds.forEach((id) => pool.add(id));
  safeSet(KEYS.MOCK_SEEN_POOL, Array.from(pool));
}

export function resetMockSeenPool() {
  safeSet(KEYS.MOCK_SEEN_POOL, []);
}

// ---------- Settings ----------

const DEFAULT_SETTINGS = {
  theme: "dark",
  keyboardShortcuts: true,
  showTimerByDefault: true,
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...safeGet(KEYS.SETTINGS, {}) };
}

export function updateSettings(partial) {
  const updated = { ...getSettings(), ...partial };
  safeSet(KEYS.SETTINGS, updated);
  return updated;
}

// ---------- Study Streak ----------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getStreak() {
  return safeGet(KEYS.STREAK, { lastActiveDate: null, currentStreak: 0, longestStreak: 0, activeDates: [] });
}

function bumpStreak() {
  const streak = getStreak();
  const today = todayStr();
  if (streak.lastActiveDate === today) return streak; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const currentStreak = streak.lastActiveDate === yesterday ? streak.currentStreak + 1 : 1;
  const activeDates = Array.from(new Set([...(streak.activeDates || []), today]));

  const updated = {
    lastActiveDate: today,
    currentStreak,
    longestStreak: Math.max(streak.longestStreak || 0, currentStreak),
    activeDates,
  };
  safeSet(KEYS.STREAK, updated);
  return updated;
}

// ---------- Resumable Practice/Mock Session ----------

export function saveActiveSession(session) {
  safeSet(KEYS.PRACTICE_SESSION, session);
}

export function getActiveSession() {
  return safeGet(KEYS.PRACTICE_SESSION, null);
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(KEYS.PRACTICE_SESSION);
  } catch (e) {
    console.error("storageService: failed to clear active session", e);
  }
}

// ---------- Notes / study files ----------

export function getNoteFolders() {
  return safeGet(KEYS.NOTES, []);
}

export function createNoteFolder(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("Folder name is required.");

  const folders = getNoteFolders();
  const exists = folders.some((folder) => folder.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) throw new Error("A folder with that name already exists.");

  const folder = {
    id: `folder-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    notes: [],
  };

  const updated = [...folders, folder];
  safeSet(KEYS.NOTES, updated);
  return folder;
}

export function deleteNoteFolder(id) {
  const updated = getNoteFolders().filter((folder) => folder.id !== id);
  safeSet(KEYS.NOTES, updated);
  return updated;
}

export function addNoteToFolder(folderId, note) {
  const folders = getNoteFolders();
  const updated = folders.map((folder) => {
    if (folder.id !== folderId) return folder;
    return {
      ...folder,
      notes: [
        {
          id: `note-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          ...note,
          createdAt: new Date().toISOString(),
        },
        ...folder.notes,
      ],
    };
  });

  if (!updated.some((folder) => folder.id === folderId)) {
    throw new Error("The selected folder no longer exists.");
  }

  safeSet(KEYS.NOTES, updated);
  return updated;
}

export function deleteNote(folderId, noteId) {
  const updated = getNoteFolders().map((folder) => {
    if (folder.id !== folderId) return folder;
    return {
      ...folder,
      notes: folder.notes.filter((note) => note.id !== noteId),
    };
  });

  safeSet(KEYS.NOTES, updated);
  return updated;
}

// ---------- Custom Mock Tests (user-uploaded JSON) ----------

export function getCustomMocks() {
  return safeGet(KEYS.CUSTOM_MOCKS, []);
}

export function getCustomMockById(id) {
  return getCustomMocks().find((m) => m.id === id) || null;
}

export function addCustomMock(mockTest) {
  const mocks = getCustomMocks();
  const updated = [...mocks, mockTest];
  const ok = safeSet(KEYS.CUSTOM_MOCKS, updated);
  if (!ok) {
    throw new Error(
      "Could not save this mock test to Local Storage. It may be too large, or your browser storage is full."
    );
  }
  return updated;
}

export function deleteCustomMock(id) {
  const mocks = getCustomMocks();
  const updated = mocks.filter((m) => m.id !== id);
  safeSet(KEYS.CUSTOM_MOCKS, updated);
  return updated;
}

// ---------- Full Reset ----------

export function resetAllProgress() {
  // Deliberately excludes KEYS.CUSTOM_MOCKS: uploaded question sets are the
  // user's own content, not derived progress, and are removed individually
  // via deleteCustomMock() instead of a blanket reset.
  Object.entries(KEYS).forEach(([name, key]) => {
    if (name === "CUSTOM_MOCKS") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`storageService: failed to remove ${key}`, e);
    }
  });
}

export default {
  getAttempts,
  recordAttempt,
  resetAttempts,
  getBookmarks,
  toggleBookmark,
  isBookmarked,
  getMockHistory,
  saveMockResult,
  getMockSeenPool,
  addToMockSeenPool,
  resetMockSeenPool,
  getSettings,
  updateSettings,
  getStreak,
  saveActiveSession,
  getActiveSession,
  clearActiveSession,
  getCustomMocks,
  getCustomMockById,
  addCustomMock,
  deleteCustomMock,
  getNoteFolders,
  createNoteFolder,
  deleteNoteFolder,
  addNoteToFolder,
  deleteNote,
  resetAllProgress,
};
