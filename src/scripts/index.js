import * as css from '../styles/styles.css';

import { LoginView } from './views/login-view.js';
import { RegisterView } from './views/register-view.js';
import { StoryListView } from './views/story-list-view.js';
import { StoryAddView } from './views/story-add-view.js';
import { NotFoundView } from './views/not-found-view.js';

import { LoginPresenter } from './presenters/login-presenter.js';
import { RegisterPresenter } from './presenters/register-presenter.js';
import { StoryListPresenter } from './presenters/story-list-presenter.js';
import { StoryAddPresenter } from './presenters/story-add-presenter.js';
import { NotFoundPresenter } from './presenters/not-found-presenter.js';
import { updateAuthUI } from './utils/auth-ui.js';

import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from './utils/notification-helper.js';

const main = document.querySelector('main');
const navbar = document.getElementById('main-nav');
const menuToggle = document.getElementById('menu-toggle');


function renderView() {
    let hash = window.location.hash || null;

    const token = localStorage.getItem('token');
    const loggedIn = !!token;
    if (!loggedIn && !['#/login', '#/logout', '#/add', '#/register'].includes(hash)) {
        alert('Anda harus masuk untuk melihat cerita!');
        window.location.hash = '#/login';
        return;
    }

    document.startViewTransition(() => {
        let view = null;
        let presenter = null;
        switch (hash) {
            case '':
            case '#/':
                view = new StoryListView(main);
                presenter = new StoryListPresenter();
                break;
            case '#/login':
                view = new LoginView(main);
                presenter = new LoginPresenter();
                break;
            case '#/stories':
                view = new StoryListView(main);
                presenter = new StoryListPresenter();
                break;
            case '#/add':
                view = new StoryAddView(main);
                presenter = new StoryAddPresenter();
                break;
            case '#/register':
                view = new RegisterView(main);
                presenter = new RegisterPresenter();
                break;
            default:
                view = new NotFoundView(main);
                presenter = new NotFoundPresenter();
        }
        view.setPresenter(presenter);
        presenter.setView(view);
        presenter.onPageLoad();

        setTimeout(() => {
            gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        });
    });
}


window.addEventListener('hashchange', renderView);
window.addEventListener('load', renderView);
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    const subscribeBtn = document.getElementById('subscribe-button');
    const unsubscribeBtn = document.getElementById('unsubscribe-button');
    const updateNotificationButtons = async () => {
        const isSubscribed = await isCurrentPushSubscriptionAvailable();
        if (subscribeBtn) subscribeBtn.style.display = isSubscribed ? 'none' : 'inline-block';
        if (unsubscribeBtn) unsubscribeBtn.style.display = isSubscribed ? 'inline-block' : 'none';
    };

    updateNotificationButtons();

    if (subscribeBtn) // subscribe-button
    {
        subscribeBtn.addEventListener('click', async () => {
            if (!isServiceWorkerAvailable()) {
                alert('Browser tidak mendukung Push Notification.');
                return;
            }

            await subscribe();
            await updateNotificationButtons();

            if (Notification.permission === 'granted') {
                localStorage.setItem('subscribe', 'true');
                alert('Berhasil berlangganan notifikasi.');
                updateNotificationButtons();
            }
        });
    }


    if (unsubscribeBtn) {
        unsubscribeBtn.addEventListener('click', async () => {

            await unsubscribe();
            await updateNotificationButtons();

            localStorage.setItem('subscribe', 'false');
            alert('Berhasil berhenti berlangganan notifikasi.');
            updateNotificationButtons();
        });
    }
    document.getElementById('nav-logout')?.addEventListener('click', () => {
        const confirmLogout = window.confirm('Anda yakin ingin keluar?');

        if (confirmLogout) {
            localStorage.removeItem('token');
            updateAuthUI();

            const msg = document.createElement('div');
            msg.textContent = 'Anda telah logout.';
            msg.className = 'logout-message';
            main.innerHTML = '';
            main.appendChild(msg);

            gsap.fromTo(
                msg,
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
            );

            setTimeout(() => {
                window.location.hash = '#/login';
            }, 1200);
        }
    });

    // Efek animasi menu
    document.querySelectorAll('nav a, nav button').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                gsap.to(link, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
            }
        });

        link.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                gsap.to(link, { scale: 1, duration: 0.2, ease: 'power2.out' });
            }
        });
    });

    // Klik di luar nav
    document.addEventListener('click', (e) => {
        const isClickInsideNav = navbar.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        if (!isClickInsideNav && !isClickOnToggle) {
            navbar.classList.remove('show');
        }
    });

    // Daftarkan Service Worker
    if (process.env.NODE_ENV === 'production') {

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.bundle.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
});

function isServiceWorkerAvailable() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}



