import { API_BASE } from '../api/constants';

export async function registerUser(username: string, password: string) {
  console.log({ username, password });

  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Ошибка регистрации');

  localStorage.setItem('username', data.user.username);

  return data;
}


export async function loginUser(username: string, password: string) {
  console.log({ username, password });

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Ошибка входа');

  localStorage.setItem('token', data.token);
  localStorage.setItem('username', username);

  return data;
}




