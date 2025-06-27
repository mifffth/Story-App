import { baseUrl } from '../API/api.js';
const TOKEN_KEY = 'token';

const ENDPOINTS = {
  // Auth
  REGISTER: `${baseUrl}/register`,
  LOGIN: `${baseUrl}/login`,

  // Notification
  SUBSCRIBE: `${baseUrl}/notifications/subscribe`,
  UNSUBSCRIBE: `${baseUrl}/notifications/subscribe`,
};

export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Login gagal');
  return result.loginResult.token;
}

export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
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

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = localStorage.getItem('token');
  // const accessToken = TOKEN_KEY();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });

  const responseJson = await fetchResponse.json();
  console.log(responseJson)

  if ( responseJson.error) {
    throw new Error('Bad response from server.');
  }
  console.log('success')
  return {
    ...responseJson,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  // const accessToken = accessToken();
  const accessToken = localStorage.getItem('token');
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}