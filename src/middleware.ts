import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pokemon-arena-super-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'pokemon-arena-session';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/play',
  '/profile',
  '/settings',
  '/battle',
];

// Rotas que só podem ser acessadas sem autenticação
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;
  
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Token inválido
      isAuthenticated = false;
    }
  }
  
  // Verificar se é rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // Verificar se é rota de auth
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // Redirecionar usuários não autenticados de rotas protegidas
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirecionar usuários autenticados de rotas de auth
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)',
  ],
};
