'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface FieldError {
  field: string;
  message: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setFieldErrors([]);
  };
  
  const getFieldError = (field: string) => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors([]);
    
    // Validação local
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setError(result.message);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && (
        <div className="form-error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username (3-20 characters)"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
        {getFieldError('username') && (
          <span className="field-error">{getFieldError('username')}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
          autoComplete="email"
        />
        {getFieldError('email') && (
          <span className="field-error">{getFieldError('email')}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {getFieldError('password') && (
          <span className="field-error">{getFieldError('password')}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
        />
        {getFieldError('confirmPassword') && (
          <span className="field-error">{getFieldError('confirmPassword')}</span>
        )}
      </div>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            required
          />
          I accept the{' '}
          <Link href="/terms" target="_blank">
            Terms and Conditions
          </Link>
        </label>
      </div>
      
      <button
        type="submit"
        className="btn-submit"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
      
      <p className="auth-switch">
        Already have an account?{' '}
        <Link href="/login">Login here</Link>
      </p>
    </form>
  );
}
