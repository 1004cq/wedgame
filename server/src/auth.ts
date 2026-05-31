import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wedgame-secret-key-change-in-production';

// In-memory user store (for prototype - replace with DB later)
interface User {
  username: string;
  passwordHash: string;
}

const users = new Map<string, User>();

export async function register(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  if (users.has(username)) {
    return { success: false, message: 'Username already exists' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.set(username, { username, passwordHash });

  return { success: true };
}

export async function login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  const user = users.get(username);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { success: false, message: 'Invalid password' };
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, token, user: { username } };
}

export function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return { valid: true, username: decoded.username };
  } catch (err) {
    return { valid: false };
  }
}
