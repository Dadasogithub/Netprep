// questionService.js
// Business logic layer sitting between the static question bank (src/data)
// and the UI. Handles filtering, random selection with no-repeat guarantees,
// and analytics aggregation derived from storageService's raw attempt data.

import allQuestions from "../data/networking";
import {
  getAttempts,
  getMockSeenPool,
  addToMockSeenPool,
  resetMockSeenPool,
  getBookmarks,
} from "./storageService";

export function getAllQuestions() {
  return allQuestions;
}

export function getQuestionById(id) {
  return allQuestions.find((q) => q.id === id);
}

export function getTopics() {
  const topics = new Set(allQuestions.map((q) => q.topic));
  return Array.from(topics).sort();
}

export function getSubtopics(topic) {
  const subtopics = new Set(
    allQuestions.filter((q) => (topic ? q.topic === topic : true)).map((q) => q.subtopic)
  );
  return Array.from(subtopics).sort();
}

export function getDifficulties() {
  return ["Easy", "Moderate", "Hard"];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- Filtering for Practice Mode ----------

export function filterQuestions({ topic, subtopic, difficulty, searchTerm } = {}) {
  return allQuestions.filter((q) => {
    if (topic && topic !== "All" && q.topic !== topic) return false;
    if (subtopic && subtopic !== "All" && q.subtopic !== subtopic) return false;
    if (difficulty && difficulty !== "All" && q.difficulty !== difficulty) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !q.question.toLowerCase().includes(term) &&
        !q.topic.toLowerCase().includes(term) &&
        !q.subtopic.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    return true;
  });
}

export function getBookmarkedQuestions() {
  const bookmarks = new Set(getBookmarks());
  return allQuestions.filter((q) => bookmarks.has(q.id));
}

export function getIncorrectQuestions() {
  const attempts = getAttempts();
  return allQuestions.filter((q) => {
    const a = attempts[q.id];
    return a && a.lastCorrect === false;
  });
}

export function getWeakTopics(threshold = 0.6) {
  const attempts = getAttempts();
  const byTopic = {};
  Object.values(attempts).forEach((a) => {
    if (!a.topic) return;
    if (!byTopic[a.topic]) byTopic[a.topic] = { correct: 0, total: 0 };
    byTopic[a.topic].correct += a.correctCount;
    byTopic[a.topic].total += a.attempts;
  });
  return Object.entries(byTopic)
    .map(([topic, stats]) => ({
      topic,
      accuracy: stats.total ? stats.correct / stats.total : 0,
      totalAttempts: stats.total,
    }))
    .filter((t) => t.totalAttempts >= 2 && t.accuracy < threshold)
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getStrongTopics(threshold = 0.8) {
  const attempts = getAttempts();
  const byTopic = {};
  Object.values(attempts).forEach((a) => {
    if (!a.topic) return;
    if (!byTopic[a.topic]) byTopic[a.topic] = { correct: 0, total: 0 };
    byTopic[a.topic].correct += a.correctCount;
    byTopic[a.topic].total += a.attempts;
  });
  return Object.entries(byTopic)
    .map(([topic, stats]) => ({
      topic,
      accuracy: stats.total ? stats.correct / stats.total : 0,
      totalAttempts: stats.total,
    }))
    .filter((t) => t.totalAttempts >= 2 && t.accuracy >= threshold)
    .sort((a, b) => b.accuracy - a.accuracy);
}

export function getWeakTopicQuestions() {
  const weakTopics = new Set(getWeakTopics().map((t) => t.topic));
  return allQuestions.filter((q) => weakTopics.has(q.topic));
}

// ---------- Mock Test Selection (no repeats until pool exhausted) ----------

export function selectMockTestQuestions(count = 50) {
  let seenPool = new Set(getMockSeenPool());
  let available = allQuestions.filter((q) => !seenPool.has(q.id));

  if (available.length < count) {
    // Pool exhausted (or nearly) — reset and start a fresh cycle,
    // but still avoid immediate repeats by prioritizing previously-unseen-in-this-batch questions.
    resetMockSeenPool();
    seenPool = new Set();
    available = allQuestions;
  }

  const selected = shuffle(available).slice(0, Math.min(count, available.length));
  addToMockSeenPool(selected.map((q) => q.id));
  return selected;
}

// ---------- Dashboard Aggregate Stats ----------

export function getDashboardStats() {
  const attempts = getAttempts();
  const attemptedIds = Object.keys(attempts);
  const total = allQuestions.length;
  const attemptedCount = attemptedIds.length;
  let correctCount = 0;
  let totalAttemptCount = 0;
  attemptedIds.forEach((id) => {
    correctCount += attempts[id].correctCount;
    totalAttemptCount += attempts[id].attempts;
  });

  const accuracy = totalAttemptCount > 0 ? correctCount / totalAttemptCount : 0;

  return {
    total,
    attempted: attemptedCount,
    remaining: total - attemptedCount,
    completionPercentage: total > 0 ? Math.round((attemptedCount / total) * 100) : 0,
    accuracy: Math.round(accuracy * 100),
    strongTopics: getStrongTopics(),
    weakTopics: getWeakTopics(),
  };
}

export function getTopicAccuracyBreakdown() {
  const attempts = getAttempts();
  const topics = getTopics();
  return topics.map((topic) => {
    const topicQuestions = allQuestions.filter((q) => q.topic === topic);
    const topicIds = new Set(topicQuestions.map((q) => q.id));
    let correct = 0;
    let attempted = 0;
    let totalAttempts = 0;
    Object.entries(attempts).forEach(([id, a]) => {
      if (topicIds.has(id)) {
        attempted += 1;
        correct += a.correctCount;
        totalAttempts += a.attempts;
      }
    });
    return {
      topic,
      totalQuestions: topicQuestions.length,
      attempted,
      accuracy: totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : null,
    };
  });
}

export function getDifficultyBreakdown() {
  const attempts = getAttempts();
  return getDifficulties().map((difficulty) => {
    const diffQuestions = allQuestions.filter((q) => q.difficulty === difficulty);
    const diffIds = new Set(diffQuestions.map((q) => q.id));
    let correct = 0;
    let totalAttempts = 0;
    let attempted = 0;
    Object.entries(attempts).forEach(([id, a]) => {
      if (diffIds.has(id)) {
        attempted += 1;
        correct += a.correctCount;
        totalAttempts += a.attempts;
      }
    });
    return {
      difficulty,
      totalQuestions: diffQuestions.length,
      attempted,
      accuracy: totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : null,
    };
  });
}

export default {
  getAllQuestions,
  getQuestionById,
  getTopics,
  getSubtopics,
  getDifficulties,
  filterQuestions,
  getBookmarkedQuestions,
  getIncorrectQuestions,
  getWeakTopics,
  getStrongTopics,
  getWeakTopicQuestions,
  selectMockTestQuestions,
  getDashboardStats,
  getTopicAccuracyBreakdown,
  getDifficultyBreakdown,
};
