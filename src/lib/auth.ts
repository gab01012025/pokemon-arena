import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Chave secreta para JWT - Em produção, use variável de ambiente
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pokemon-arena-super-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'pokemon-arena-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

// ==================== PASSWORD UTILS ====================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ==================== JWT UTILS ====================

interface JWTPayload {
  trainerId: string;
  username: string;
  email: string;
  exp?: number;
}

export async function createToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ==================== SESSION MANAGEMENT ====================

export async function createSession(trainerId: string, username: string, email: string) {
  const token = await createToken({ trainerId, username, email });
  const expires = new Date(Date.now() + SESSION_DURATION);
  
  // Salvar sessão no banco
  await prisma.session.create({
    data: {
      sessionToken: token,
      trainerId,
      expires,
    },
  });
  
  // Definir cookie seguro
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });
  
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  // Verificar JWT
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  // Verificar se sessão existe e não expirou
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { trainer: true },
  });
  
  if (!session || session.expires < new Date()) {
    // Sessão expirada, limpar
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return {
    user: {
      id: session.trainer.id,
      username: session.trainer.username,
      email: session.trainer.email,
      avatar: session.trainer.avatar,
      level: session.trainer.level,
      wins: session.trainer.wins,
      losses: session.trainer.losses,
      streak: session.trainer.streak,
      ladderPoints: session.trainer.ladderPoints,
    },
    expires: session.expires,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (token) {
    // Deletar sessão do banco
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    });
  }
  
  // Limpar cookie
  cookieStore.delete(COOKIE_NAME);
}

// ==================== AUTH FUNCTIONS ====================

export async function registerTrainer(
  username: string,
  email: string,
  password: string
) {
  // Verificar se usuário já existe
  const existingUser = await prisma.trainer.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  
  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error('Username already taken');
    }
    throw new Error('Email already registered');
  }
  
  // Hash da senha
  const hashedPassword = await hashPassword(password);
  
  // Criar treinador
  const trainer = await prisma.trainer.create({
    data: {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });
  
  // Criar sessão
  await createSession(trainer.id, trainer.username, trainer.email);
  
  return {
    id: trainer.id,
    username: trainer.username,
    email: trainer.email,
  };
}

export async function loginTrainer(usernameOrEmail: string, password: string) {
  // Buscar treinador por username ou email
  const trainer = await prisma.trainer.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail.toLowerCase() },
      ],
    },
  });
  
  if (!trainer) {
    throw new Error('Invalid credentials');
  }
  
  // Verificar senha
  const isValid = await verifyPassword(password, trainer.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // Limpar sessões antigas deste usuário (opcional - limita a 1 sessão)
  // await prisma.session.deleteMany({ where: { trainerId: trainer.id } });
  
  // Criar nova sessão
  await createSession(trainer.id, trainer.username, trainer.email);
  
  return {
    id: trainer.id,
    username: trainer.username,
    email: trainer.email,
  };
}
