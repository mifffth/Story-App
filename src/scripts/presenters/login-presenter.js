import { loginUser } from '../models/auth-model.js';
import { updateAuthUI } from '../utils/auth-ui.js';

export class LoginPresenter {
  constructor(view, container) {
    this.view = view;
    this.container = container;
  }

  async onLoginSubmit(email, password) {
    const overlay = this._showOverlay("Tunggu sebentar...");
    try {
      const token = await loginUser(email, password);
      localStorage.setItem('token', token);
      updateAuthUI();
      alert('Login berhasil!');
      window.location.hash = '#/stories';
    } catch (err) {
      alert(err.message);
    } finally {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => overlay.remove()
      });
    }
  }

  onRegisterClicked() {
    window.location.hash = '#/register';
  }

  _showOverlay(text) {
    const overlay = document.createElement('div');
    overlay.className = 'login-overlay';
    overlay.textContent = text;
    document.body.appendChild(overlay);
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    return overlay;
  }
}
