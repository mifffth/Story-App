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
 
// export async function registerUser(name, email, password) {
//   const response = await fetch(`${baseUrl}/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ name, email, password }),
//   });
 
//   const result = await response.json();
 
//   if (!response.ok) throw new Error(result.message || 'Register gagal');
 
//   return {
//     token: result?.registerResult?.token || '',
//     message: result.message || 'Pendaftaran berhasil',
//     error: false
//   };
// }

export async function registerUser(name, email, password) {
  const response = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message || 'Register gagal');

  const token = result?.registerResult?.token || '';
  if (token) {
    localStorage.setItem('token', token);
  }

  return {
    token,
    message: result.message || 'Pendaftaran berhasil',
    error: false,
  };
}
