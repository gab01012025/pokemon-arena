// Password validation utilities

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: PasswordValidationResult['strength'] = 'weak';

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /pokemon/i,
    /admin/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns and is too weak');
      break;
    }
  }

  // Calculate strength
  if (errors.length === 0) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const length = password.length;

    let strengthScore = 0;
    if (hasUpperCase) strengthScore++;
    if (hasLowerCase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChars) strengthScore++;
    if (length >= 12) strengthScore++;
    if (length >= 16) strengthScore++;

    if (strengthScore >= 6) {
      strength = 'very-strong';
    } else if (strengthScore >= 5) {
      strength = 'strong';
    } else if (strengthScore >= 4) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Check if password is in common password list
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    '123456', 'password', '12345678', 'qwerty', '123456789',
    '12345', '1234', '111111', '1234567', 'dragon',
    '123123', 'baseball', 'iloveyou', 'trustno1', '1234567890',
    'sunshine', 'master', '123321', '666666', 'photoshop',
    '1qaz2wsx', 'qwertyuiop', 'ashley', 'mustang', 'pokemon',
  ];

  return commonPasswords.includes(password.toLowerCase());
}

// Generate password strength message
export function getPasswordStrengthMessage(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'Weak password. Consider adding more characters and variety.';
    case 'medium':
      return 'Medium strength. Your password is acceptable but could be stronger.';
    case 'strong':
      return 'Strong password! Your account is well protected.';
    case 'very-strong':
      return 'Very strong password! Excellent security.';
  }
}

// Check password against username/email
export function passwordContainsUserInfo(password: string, username: string, email: string): boolean {
  const lowerPassword = password.toLowerCase();
  const lowerUsername = username.toLowerCase();
  const emailLocal = email.split('@')[0].toLowerCase();

  return (
    lowerPassword.includes(lowerUsername) ||
    lowerPassword.includes(emailLocal) ||
    lowerUsername.includes(lowerPassword)
  );
}
