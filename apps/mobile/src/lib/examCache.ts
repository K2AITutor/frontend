import * as SQLite from "expo-sqlite";

export async function saveExamAnswer(attemptId: string, questionId: string, answer: string) {
  const db = await SQLite.openDatabaseAsync("exam-cache.db");
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS exam_answers (attempt_id TEXT NOT NULL, question_id TEXT NOT NULL, answer TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (attempt_id, question_id));"
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO exam_answers (attempt_id, question_id, answer, updated_at) VALUES (?, ?, ?, ?);",
    attemptId,
    questionId,
    answer,
    new Date().toISOString()
  );
}

export async function loadExamAnswers(attemptId: string) {
  const db = await SQLite.openDatabaseAsync("exam-cache.db");
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS exam_answers (attempt_id TEXT NOT NULL, question_id TEXT NOT NULL, answer TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (attempt_id, question_id));"
  );
  const rows = await db.getAllAsync<{ question_id: string; answer: string }>(
    "SELECT question_id, answer FROM exam_answers WHERE attempt_id = ?;",
    attemptId
  );
  return Object.fromEntries(rows.map((row) => [row.question_id, row.answer]));
}
