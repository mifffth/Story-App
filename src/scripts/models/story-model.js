import { baseUrl } from '../API/api.js';

export async function fetchStories() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan.');

  const response = await fetch(`${baseUrl}/stories?location=0`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal memuat cerita');
  }

  const data = await response.json();
  return data.listStory;
}

export async function submitStory(formData) {
  const token = localStorage.getItem('token');
  // if (!token) throw new Error('Token tidak ditemukan.');

  const url = `${baseUrl}/stories${token ? '' : '/guest'}`;

  const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
  });

  const data = await response.json();
  if (data.error) {
      throw new Error(data.message || 'Terjadi kesalahan');
  }

  return data;
}

export async function sendNewStoryNotification(storyDescription) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No token found, cannot send new story notification.');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/notifications`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Story berhasil dibuat',
        options: {
          body: `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Failed to send new story notification:', data.message || 'Unknown error');
    } else {
      console.log('New story notification sent:', data.message);
    }
  } catch (error) {
    console.error('Error sending new story notification:', error);
  }
}