import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function createUser(email: string, password: string, name: string) {
  const users = await readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return null;

  const passwordHash = await bcrypt.hash(password, 12);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return { id: user.id, email: user.email, name: user.name };
}

export async function validateUser(email: string, password: string) {
  const users = await readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name };
}
