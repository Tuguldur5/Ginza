import { Db, MongoClient, ObjectId } from "mongodb";

export type QuestionType = "rating" | "text" | "textarea";
export type Room = { id: string; roomNumber: number; name: string; slug: string; isActive: boolean; createdAt: string; updatedAt: string };
export type Question = { id: string; type: QuestionType; text: string; required: boolean; order: number; isActive: boolean; createdAt: string; updatedAt: string };
export type FeedbackAnswer = { questionId: string; answer: string };
export type Feedback = { id: string; roomId: string; roomNumber: number; rating: number; answers: FeedbackAnswer[]; comment: string; createdAt: string };

type RoomDocument = Omit<Room, "id">;
type QuestionDocument = Omit<Question, "id">;
type FeedbackDocument = Omit<Feedback, "id">;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "ginza_feedback";
const globalForMongo = globalThis as typeof globalThis & { mongoClient?: MongoClient; mongoPromise?: Promise<MongoClient>; indexPromise?: Promise<void> };

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongo.mongoPromise) {
    globalForMongo.mongoClient ??= new MongoClient(uri);
    globalForMongo.mongoPromise = globalForMongo.mongoClient.connect();
  }
  const db = (await globalForMongo.mongoPromise).db(dbName);
  if (!globalForMongo.indexPromise) globalForMongo.indexPromise = Promise.all([
    db.collection("rooms").createIndex({ roomNumber: 1 }, { unique: true }),
    db.collection("rooms").createIndex({ slug: 1 }, { unique: true }),
    db.collection("questions").createIndex({ isActive: 1, order: 1 }),
    db.collection("feedbacks").createIndex({ roomId: 1, createdAt: -1 }),
    db.collection("feedbacks").createIndex({ createdAt: -1 }),
    db.collection("feedbacks").createIndex({ rating: 1 }),
  ]).then(() => undefined).catch(() => undefined);
  return db;
}

export function objectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function serialize<T extends { _id: ObjectId }>(document: T) {
  const { _id, ...rest } = document;
  return { id: _id.toString(), ...rest };
}

export type { FeedbackDocument, QuestionDocument, RoomDocument };