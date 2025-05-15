const baseUrl = 'https://story-api.dicoding.dev/v1';

export async function loginUser(email, password) {
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Login gagal');
  return result.loginResult.token;
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message || 'Register gagal');

  // Simulasi response seperti login
  return {
    token: result?.registerResult?.token || '', // supaya bisa disimpan kalau perlu
    message: result.message || 'Pendaftaran berhasil',
    error: false
  };
}
