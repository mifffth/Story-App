export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function convertBase64ToUint8Array(base64String) {
  const base64 = base64String
    .padEnd(base64String.length + ((4 - (base64String.length % 4)) % 4), '=')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
 
  return new Uint8Array(rawData.split('').map((char) => char.charCodeAt(0)));
}

async function subscribeToWebPush() {
  const registration = await navigator.serviceWorker.register('/sw.bundlejs');
 
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'),
  });
 
  console.log(JSON.stringify(pushSubscription));
 
  return pushSubscription;
}

