export interface AuthValidationResult {
  valid: boolean;
  message?: string;
  field?: 'username' | 'password';
}

export function validateAuthForm(username: string, password: string): AuthValidationResult {
  if (username.trim().length < 3) {
    return {
      valid: false,
      field: 'username',
      message: 'Имя пользователя должно быть не короче 3 символов',
    };
  }

  if (password.trim().length < 6) {
    return {
      valid: false,
      field: 'password',
      message: 'Пароль должен быть не короче 6 символов',
    };
  }

  return { valid: true };
}
