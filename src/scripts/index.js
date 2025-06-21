
import * as css from '../styles/styles.css'; 

import { LoginView } from './views/login-view.js'; 
import { RegisterView } from './views/register-view.js'; 
import { StoryListView } from './views/story-list-view.js'; 
import { StoryAddView } from './views/story-add-view.js'; 
import { NotFoundView } from './views/not-found-view.js'; 
import { BookmarkListView } from './views/bookmark-list-view.js'; 

import { LoginPresenter } from './presenters/login-presenter.js'; 
import { RegisterPresenter } from './presenters/register-presenter.js'; 
import { StoryListPresenter } from './presenters/story-list-presenter.js'; 
import { StoryAddPresenter } from './presenters/story-add-presenter.js'; 
import { NotFoundPresenter } from './presenters/not-found-presenter.js'; 
import { BookmarkListPresenter } from './presenters/bookmark-list-presenter.js'; 
import { updateAuthUI } from './utils/auth-ui.js'; 

import { subscribe, unsubscribe, isSubscribed } from './utils/notification-helper.js'; 
import { bookmarkDb } from './data/bookmark-db.js'; 

const main = document.querySelector('main'); 
const navbar = document.getElementById('main-nav'); 
const menuToggle = document.getElementById('menu-toggle'); 

function renderView() { 
    let hash = window.location.hash || '#/'; 

    const token = localStorage.getItem('token'); 
    const loggedIn = !!token; 

    const publicRoutes = ['#/login', '#/register', '#/add']; 

    if (!loggedIn && !publicRoutes.includes(hash)) { 
        alert('Anda harus masuk untuk melihat cerita!'); 
        window.location.hash = '#/login'; 
        return; 
    }


    document.startViewTransition(() => { 
        let view = null; 
        let presenter = null; 

        if (hash === '' || hash === '#/') { 
            hash = '#/stories'; 
        }

        switch (hash) { 
            case '#/login':
                view = new LoginView(main); 
                presenter = new LoginPresenter(); 
                break;
            case '#/stories':
                view = new StoryListView(main, bookmarkDb);  
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
            case '#/bookmark': 
                view = new BookmarkListView(main); 
                presenter = new BookmarkListPresenter(); 
                break;
            default:
                view = new NotFoundView(main); 
                presenter = new NotFoundPresenter(); 
        }
        if (view && presenter) { 
            view.setPresenter(presenter); 
            presenter.setView(view); 
            presenter.onPageLoad(); 
        }

        setTimeout(() => { 
            gsap.fromTo(main, { 
                opacity: 0
            }, {
                opacity: 1, 
                duration: 0.5 
            });
        });
    });
}
window.addEventListener('hashchange', renderView); 
window.addEventListener('load', renderView); 

window.addEventListener('DOMContentLoaded', () => { 
    updateAuthUI(); 

    const subscribeButton = document.getElementById('subscribe-button'); 
    const unsubscribeButton = document.getElementById('unsubscribe-button'); 

    function toggleSubscriptionButtons(subscribed) { 
        if (subscribed) { 
            subscribeButton.style.display = 'none'; 
            unsubscribeButton.style.display = 'inline-block'; 
        } else {
            subscribeButton.style.display = 'inline-block'; 
            unsubscribeButton.style.display = 'none'; 
        }
    }

    isSubscribed().then(subscribed => { 
        toggleSubscriptionButtons(subscribed); 
    });

    subscribeButton.addEventListener('click', () => { 
        const token = localStorage.getItem('token'); 
        if (!token) { 
            alert('Anda harus masuk untuk berlangganan notifikasi!'); 
            window.location.hash = '#/login'; 
            return; 
        }
        subscribe(toggleSubscriptionButtons); 
    });
    unsubscribeButton.addEventListener('click', () => { 
        const token = localStorage.getItem('token'); 
        if (!token) { 
            alert('Anda harus masuk untuk berhenti berlangganan notifikasi!'); 
            window.location.hash = '#/login'; 
            return; 
        }
        unsubscribe(toggleSubscriptionButtons); 
    });

    document.getElementById('nav-logout')?.addEventListener('click', async () => { 
        const confirmLogout = window.confirm('Anda yakin ingin keluar? Langganan notifikasi akan dihentikan.'); 
        if (confirmLogout) { 
            await unsubscribe(toggleSubscriptionButtons); 
            
            localStorage.removeItem('token'); 
            updateAuthUI(); 

            main.innerHTML = ''; 
            subscribeButton.style.display = 'none'; 
            unsubscribeButton.style.display = 'none'; 

            const msg = document.createElement('div'); 
            msg.textContent = 'Anda telah logout.'; 
            msg.className = 'logout-message'; 
            main.appendChild(msg); 

            gsap.fromTo(msg, { 
                y: -30, 
                opacity: 0
            }, {
                y: 0, 
                opacity: 1, 
                duration: 0.6, 
                ease: 'power2.out' 
            });

            setTimeout(() => { 
                window.location.hash = '#/login'; 
            }, 1200);
        }
    });

    document.querySelectorAll('nav a, nav button').forEach(link => { 
        link.addEventListener('mouseenter', () => { 
            if (window.innerWidth > 768) { 
                gsap.to(link, { 
                    scale: 1.1, 
                    duration: 0.2, 
                    ease: 'power2.out' 
                });
            }
        });
        link.addEventListener('mouseleave', () => { 
            if (window.innerWidth > 768) { 
                gsap.to(link, { 
                    scale: 1, 
                    duration: 0.2, 
                    ease: 'power2.out' 
                });
            }
        });
    });

    document.addEventListener('click', (e) => { 
        const isClickInsideNav = navbar.contains(e.target); 
        const isClickOnToggle = menuToggle.contains(e.target); 
        if (!isClickInsideNav && !isClickOnToggle) { 
            navbar.classList.remove('show'); 
        }
    });
});

if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => { 
        navigator.serviceWorker.register('/sw.bundle.js') 
            .then(registration => { 
                console.log('SW registered:', registration); 
            })
            .catch(error => { 
                console.error('SW registration failed:', error); 
            });
    });
}