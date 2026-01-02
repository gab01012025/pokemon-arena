'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await login(formData.usernameOrEmail, formData.password);
      
      if (result.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(result.message);
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
        <label htmlFor="usernameOrEmail">Username or Email</label>
        <input
          type="text"
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={formData.usernameOrEmail}
          onChange={handleChange}
          placeholder="Enter your username or email"
          required
          autoComplete="username"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </div>
      
      <div className="form-group-inline">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="forgot-link">
          Forgot password?
        </Link>
      </div>
      
      <button
        type="submit"
        className="btn-submit"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      
      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <Link href="/register">Register here</Link>
      </p>
    </form>
  );
}
