// customMockService.js
// Handles everything related to user-uploaded JSON mock tests: parsing,
// validating, normalizing into the app's internal question schema, and
// CRUD against localStorage (via storageService). No backend, no database —
// an uploaded file becomes one self-contained record in localStorage that
// can be listed, run through the same MockRunner as built-in mocks, and
// deleted at any time.

import {
  getCustomMocks,
  getCustomMockById,
  addCustomMock,
  deleteCustomMock,
} from "./storageService";

const DIFFICULTIES = ["Easy", "Moderate", "Hard"];

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Validates and normalizes a raw parsed JSON object into the app's internal
 * mock-test + question schema. Never throws — always returns
 * { valid, errors, warnings, normalized }, so the UI can show every problem
 * at once instead of failing on the first one.
 */
export function validateAndNormalizeMock(raw, fileName = "uploaded file") {
  const errors = [];
  const warnings = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, errors: [`${fileName}: root of the JSON must be an object, not an array or primitive.`], warnings, normalized: null };
  }

  const title = isNonEmptyString(raw.title) ? raw.title.trim() : null;
  if (!title) {
    errors.push('Missing or empty "title" (e.g. "IT Professional Knowledge Mock").');
  }

  if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
    errors.push('Missing "questions" array, or it is empty.');
    return { valid: false, errors, warnings, normalized: null };
  }

  if (raw.questions.length > 300) {
    warnings.push(`This file has ${raw.questions.length} questions — that's a lot for one mock test. Consider splitting it up.`);
  }

  const normalizedQuestions = [];
  raw.questions.forEach((q, idx) => {
    const pos = `Question #${idx + 1}`;
    if (!q || typeof q !== "object") {
      errors.push(`${pos}: is not a valid object.`);
      return;
    }
    if (!isNonEmptyString(q.question)) {
      errors.push(`${pos}: missing "question" text.`);
      return;
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${pos}: needs an "options" array with at least 2 choices.`);
      return;
    }
    if (q.options.some((o) => !isNonEmptyString(String(o ?? "")))) {
      errors.push(`${pos}: one or more options are empty.`);
      return;
    }

    // correctAnswer can be given as a numeric index, or as "answer" matching option text
    let correctAnswer = null;
    if (typeof q.correctAnswer === "number" && Number.isInteger(q.correctAnswer)) {
      correctAnswer = q.correctAnswer;
    } else if (isNonEmptyString(q.answer)) {
      const matchIdx = q.options.findIndex(
        (o) => String(o).trim().toLowerCase() === q.answer.trim().toLowerCase()
      );
      correctAnswer = matchIdx;
    }

    if (correctAnswer === null || correctAnswer < 0 || correctAnswer >= q.options.length) {
      errors.push(
        `${pos}: "correctAnswer" must be a valid option index (0-${q.options.length - 1}), or "answer" must exactly match one of the options.`
      );
      return;
    }

    const difficulty = DIFFICULTIES.includes(q.difficulty) ? q.difficulty : "Moderate";

    normalizedQuestions.push({
      id: isNonEmptyString(q.id) ? q.id : `CUSTOM-${idx + 1}-${Math.random().toString(36).slice(2, 8)}`,
      topic: isNonEmptyString(q.topic) ? q.topic : title || "Custom",
      subtopic: isNonEmptyString(q.subtopic) ? q.subtopic : "General",
      difficulty,
      question: q.question.trim(),
      options: q.options.map((o) => String(o)),
      correctAnswer,
      explanation: isNonEmptyString(q.explanation) ? q.explanation : "No explanation was provided for this question.",
      incorrectExplanations:
        q.incorrectExplanations && typeof q.incorrectExplanations === "object" ? q.incorrectExplanations : {},
      estimatedTime: typeof q.estimatedTime === "number" ? q.estimatedTime : 45,
      memoryTrick: isNonEmptyString(q.memoryTrick) ? q.memoryTrick : null,
      examTip: isNonEmptyString(q.examTip) ? q.examTip : null,
    });
  });

  if (errors.length > 0) {
    return { valid: false, errors, warnings, normalized: null };
  }

  const questionCount = normalizedQuestions.length;
  const totalMarks =
    typeof raw.totalMarks === "number" && raw.totalMarks > 0 ? raw.totalMarks : questionCount * 2;
  const marksPerQuestion = Math.round((totalMarks / questionCount) * 100) / 100;
  const negativeMarking =
    typeof raw.negativeMarking === "number" && raw.negativeMarking >= 0 ? raw.negativeMarking : 0;
  const durationMinutes =
    typeof raw.durationMinutes === "number" && raw.durationMinutes > 0
      ? raw.durationMinutes
      : Math.max(10, Math.round(questionCount * 1.2));

  const normalized = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    description: isNonEmptyString(raw.description) ? raw.description.trim() : "",
    questionCount,
    totalMarks,
    marksPerQuestion,
    negativeMarking,
    durationMinutes,
    createdAt: new Date().toISOString(),
    questions: normalizedQuestions,
  };

  return { valid: true, errors: [], warnings, normalized };
}

export function parseJsonFile(fileText) {
  try {
    return { ok: true, data: JSON.parse(fileText) };
  } catch (e) {
    return { ok: false, error: `That file isn't valid JSON (${e.message}). Check for a trailing comma or a missing bracket.` };
  }
}

export function listCustomMocks() {
  return getCustomMocks();
}

export function getCustomMock(id) {
  return getCustomMockById(id);
}

export function saveCustomMock(normalized) {
  return addCustomMock(normalized);
}

export function removeCustomMock(id) {
  return deleteCustomMock(id);
}

/**
 * Generates a ready-to-use sample JSON template — deliberately shaped exactly
 * like the "IT Professional Knowledge Mock" (25 questions / 50 marks) so the
 * downloaded file both documents the schema AND works if uploaded as-is.
 */
export function buildSampleTemplate(sampleQuestions) {
  return {
    title: "IT Professional Knowledge Mock",
    description: "Sample 25-question / 50-mark mock generated from the built-in question bank as a format reference.",
    totalMarks: 50,
    durationMinutes: 20,
    negativeMarking: 0,
    questions: sampleQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      incorrectExplanations: q.incorrectExplanations,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      estimatedTime: q.estimatedTime,
      memoryTrick: q.memoryTrick,
      examTip: q.examTip,
    })),
  };
}

export default {
  validateAndNormalizeMock,
  parseJsonFile,
  listCustomMocks,
  getCustomMock,
  saveCustomMock,
  removeCustomMock,
  buildSampleTemplate,
};
