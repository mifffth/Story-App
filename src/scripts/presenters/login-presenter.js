import { loginUser } from '../models/auth-model.js';
import { updateAuthUI } from '../utils/auth-ui.js';

export class LoginPresenter {
  constructor() {
      this.view = null;
  }

  setView(view) {
      this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async onLoginSubmit(email, password) {
    this.view.showLoadingOverlay("Tunggu sebentar...");
    try {
      const token = await loginUser(email, password);
      this.view.saveToken(token); 
      updateAuthUI();
      this.view.showAlert('Login berhasil!');
      this.view.navigateTo('#/stories');
    } catch (err) {
      this.view.showAlert(err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
  

  // async onLoginSubmit(email, password) {
  //   const overlay = this._showOverlay("Tunggu sebentar...");
  //   try {
  //     const token = await loginUser(email, password);
  //     localStorage.setItem('token', token);
  //     updateAuthUI();
  //     alert('Login berhasil!');
  //     window.location.hash = '#/stories';
  //   } catch (err) {
  //     alert(err.message);
  //   } finally {
  //     gsap.to(overlay, {
  //       opacity: 0,
  //       duration: 0.3,
  //       onComplete: () => overlay.remove()
  //     });
  //   }
  // }

  // async onRegisterClicked() {
  //   window.location.hash = '#/register';
  // }

  // _showOverlay(text) {
  //   const overlay = document.createElement('div');
  //   overlay.className = 'login-overlay';
  //   overlay.textContent = text;
  //   document.body.appendChild(overlay);
  //   gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  //   return overlay;
  // }
}
