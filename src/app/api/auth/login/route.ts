import { NextRequest, NextResponse } from 'next/server';
import { loginTrainer } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = loginSchema.parse(body);
    
    // Login
    const trainer = await loginTrainer(
      validatedData.usernameOrEmail,
      validatedData.password
    );
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        user: trainer,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      // Credenciais inválidas
      if (error.message === 'Invalid credentials') {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid username/email or password',
          },
          { status: 401 }
        );
      }
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
