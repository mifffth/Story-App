import * as css from '../styles/styles.css';

// import { AuthenticationView } from './views/authentication-view.js';
// import { DefaultView } from './views/default-view.js';
import { LoginView } from './views/login-view.js';
import { RegisterView } from './views/register-view.js';
import { StoryListView } from './views/story-list-view.js';
import { StoryAddView } from './views/story-add-view.js';
import { NotFoundView } from './views/not-found-view.js';


// import { AuthenticationPresenter } from './presenters/authentication-presenter.js';
// import { DefaultPresenter } from './presenters/default-presenter.js';
import { LoginPresenter } from './presenters/login-presenter.js';
import { RegisterPresenter } from './presenters/register-presenter.js';
import { StoryListPresenter } from './presenters/story-list-presenter.js';
import { StoryAddPresenter } from './presenters/story-add-presenter.js';
import { NotFoundPresenter } from './presenters/not-found-presenter.js';
import { updateAuthUI } from './utils/auth-ui.js';
const main = document.querySelector('main');

// const authView = new AuthenticationView();
// // const authPresenter = new AuthenticationPresenter();
// authView.setPresenter(authPresenter);
// authPresenter.setView(authView);
// authPresenter.onPageLoad();

function renderView() {
    const hash = window.location.hash || null;

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