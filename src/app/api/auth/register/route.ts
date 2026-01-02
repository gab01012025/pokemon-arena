import { NextRequest, NextResponse } from 'next/server';
import { registerTrainer } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = registerSchema.parse(body);
    
    // Registrar treinador
    const trainer = await registerTrainer(
      validatedData.username,
      validatedData.email,
      validatedData.password
    );
    
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        user: trainer,
      },
      { status: 201 }
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
      // Erros conhecidos (username/email já existe)
      if (error.message.includes('already')) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 409 }
        );
      }
    }
    
    console.error('Register error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
