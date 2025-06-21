import { subscribePushNotification, unsubscribePushNotification } from '../models/auth-model.js';
import { convertBase64ToUint8Array } from './index.js';
import { VAPID_PUBLIC_KEY } from '../API/api.js';

async function getServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service worker tidak didukung di browser ini.');
        return null;
    }
    try {
        return await navigator.serviceWorker.ready;
    } catch (error) {
        console.error('Gagal menyiapkan service worker:', error);
        return null;
    }
}

function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };
}

export async function isSubscribed() {
    const registration = await getServiceWorkerRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
}

export async function subscribe(onSuccess) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Browser tidak mendukung service worker atau notifikasi push');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Izin notifikasi ditolak.');
            return;
        }

        const registration = await getServiceWorkerRegistration();
        if (!registration) {
            console.error('Service worker belum siap');
            return;
        }

        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            alert('Kamu sudah berlangganan notifikasi.');
            return;
        }

        const options = generateSubscribeOptions();
        subscription = await registration.pushManager.subscribe(options);

        const {
            endpoint,
            keys
        } = subscription.toJSON();
        const response = await subscribePushNotification({
            endpoint,
            keys
        });

        if (!response.ok) {
            alert('Gagal berlangganan ke server.');
            await subscription.unsubscribe(); 
            return;
        }

        alert('Berhasil berlangganan notifikasi!');

        if (onSuccess) {
            onSuccess(true);
        }

    } catch (error) {
        console.error('Terjadi kesalahan saat berlangganan:', error);
        alert('Gagal berlangganan notifikasi.');
        if (onSuccess) {
            onSuccess(false);
        }
    }
}

export async function unsubscribe(onSuccess) {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        alert('Service worker tidak tersedia untuk berhenti langganan.');
        return;
    }

    try {
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            alert('Kamu belum berlangganan.');
            if (onSuccess) onSuccess(false);
            return;
        }

        const { endpoint } = subscription;
        const response = await unsubscribePushNotification({
            endpoint
        });

        if (!response.ok) {
            alert('Gagal berhenti langganan dari server. Coba lagi.');
            return;
        }

        await subscription.unsubscribe();

        alert('Berhasil berhenti berlangganan notifikasi.');
        if (onSuccess) {
            onSuccess(false);
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat berhenti langganan:', error);
        alert('Gagal berhenti langganan.');
    }
}
