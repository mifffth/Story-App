const baseUrl = 'https://story-api.dicoding.dev/v1';

export async function submitStory(formData, token) {
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

export async function getCameraStream() {
    return await navigator.mediaDevices.getUserMedia({ video: true });
}

export function stopStream(stream, videoElement) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (videoElement) {
        videoElement.srcObject = null;
    }
}

export function captureImageFromVideo(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function canvasToFile(canvas, callback) {
    canvas.toBlob(blob => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        callback(file);
    }, 'image/jpeg', 0.95);
}

