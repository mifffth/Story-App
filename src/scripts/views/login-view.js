export function loadLoginView(container, presenter) {
  container.innerHTML = `
  <div style="display: flex; height: 100vh; font-family: 'Poppins', sans-serif;">   
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px;">
        <h2 style="font-weight: 700; font-size: 24px; margin-bottom: 24px;">MASUK</h2>
        <p style="color: #676767; margin-bottom: 24px;">Silahkan masuk dengan akun anda</p>
        <form id="login-form" class="login-form" style="width: 100%; max-width: 320px;">
          <div style="margin-bottom: 16px;">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email@email.com" 
              aria-label="Masukkan alamat email anda" 
              autocomplete="email"
              style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
              required />
          </div>
          <div style="margin-bottom: 16px;">
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password" 
              aria-label="Masukkan password/sandi anda" 
              autocomplete="current-password"
              style="width: 100%; padding: 12px 16px; background:  #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
              required />
          </div>
          <div style="text-align: center;">
            <button 
              type="submit" 
              style="padding: 12px 24px; background:#2563eb; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              Masuk
            </button>
          </div>
        </form>
 
        <div style="margin-top: 32px; width: 100%; max-width: 320px;">
          <hr style="margin: 24px 0;">
          <p style="text-align: center; font-weight: 600;">Belum punya akun?</p>
          <div style="margin-top: 16px;">
            <button 
              id="register-btn" aria-label="Daftar akun baru"
              style="width:100%; padding: 12px 24px; background:#2563eb; display: flex; align-items: center; justify-content: center; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  gsap.from('.login-form', {
    y: 50,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  });

  const form = container.querySelector('#login-form');
  const registerBtn = container.querySelector('#register-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    presenter.onLoginSubmit(email, password);
  });

  registerBtn.addEventListener('click', () => {
    presenter.onRegisterClicked();
  });
}
