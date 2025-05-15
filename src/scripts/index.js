import { loadStoryListView } from './views/story-list-view.js';
import { loadAddStoryView } from './views/add-story-view.js';
import { loadLoginView } from './views/login-view.js';
import { loadRegisterView } from './views/register-view.js';

import { LoginPresenter } from './presenters/login-presenter.js';
import { RegisterPresenter } from './presenters/register-presenter.js';
import { StoryListPresenter } from './presenters/story-list-presenter.js';
import { AddStoryPresenter } from './presenters/add-story-presenter.js';
import { updateAuthUI } from './utils/auth-ui.js';

const main = document.querySelector('main');

function renderView() {
    document.querySelectorAll('link[id$="-style"]').forEach(link => link.remove());

    const hash = window.location.hash || '#/stories';

    document.startViewTransition(() => {
        switch (hash) {
            case '#/stories':
                const storyListPresenter = new StoryListPresenter(loadStoryListView, main);
                loadStoryListView(main, storyListPresenter);
                break;
            case '#/add': {
                const view = loadAddStoryView;
                const addStoryPresenter = new AddStoryPresenter(view, main);
                addStoryPresenter.init();
                break;
            }
            case '#/login':
                const loginPresenter = new LoginPresenter(loadLoginView, main);
                loadLoginView(main, loginPresenter);
                break;
            case '#/register':
                const registerPresenter = new RegisterPresenter(loadRegisterView, main);
                loadRegisterView(main, registerPresenter);
                break;
            default:
                main.innerHTML = `<p>Halaman tidak ditemukan</p>`;
        }

        setTimeout(() => {
            gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.5 });

            updateAuthUI();
        });
    });
}

window.addEventListener('hashchange', renderView);
window.addEventListener('load', renderView);
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    document.getElementById('nav-logout').addEventListener('click', () => {
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

    document.querySelectorAll('nav a, nav button').forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, { scale: 1, duration: 0.2, ease: 'power2.out' });
        });
    });
});
