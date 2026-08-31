import fs from "fs";
import path from "path";

export type Question = { id: string; type: "rating" | "text" | "textarea"; text: string; required: boolean; active: boolean };
export type Feedback = { id: string; table: string; createdAt: string; answers: Record<string, string> };

const file = path.join(process.cwd(), "data", "db.json");
const initial = { questions: [] as Question[], feedback: [] as Feedback[] };

function read() {
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as typeof initial; }
  catch { return initial; }
}
function write(data: typeof initial) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}
export function getQuestions(activeOnly = false) {
  const d = read();
  return activeOnly ? d.questions.filter(q => q.active) : d.questions;
}
export function saveQuestion(q: Question) {
  const d = read(); const i = d.questions.findIndex(x => x.id === q.id);
  if (i >= 0) d.questions[i] = q; else d.questions.push(q); write(d); return q;
}
export function deleteQuestion(id: string) {
  const d = read(); d.questions = d.questions.filter(q => q.id !== id); write(d);
}
export function getFeedback() { return read().feedback.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function addFeedback(f: Feedback) {
  const d = read(); d.feedback.push(f); write(d); return f;
}