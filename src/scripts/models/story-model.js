const baseUrl = 'https://story-api.dicoding.dev/v1';

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
