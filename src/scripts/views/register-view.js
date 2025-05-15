export function loadRegisterView(container, presenter) {
  container.innerHTML = `
    <div id="register-container" style="display: flex; height: 100vh; font-family: 'Poppins', sans-serif;">
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px;">
        <h2 style="font-weight: 700; font-size: 24px; margin-bottom: 24px;">DAFTAR</h2>
        <p style="color: #676767; margin-bottom: 24px;">Silahkan daftar untuk membuat akun baru</p>
        <form id="register-form" style="width: 100%; max-width: 320px;">
          <div style="margin-bottom: 16px;">
            <input 
              label for = "name"
              type="text" 
              id="name" 
              name="name" 
              placeholder="Nama"
              style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
              required 
            />
          </div>
          <div style="margin-bottom: 16px;">
            <input 
              label for = "email"
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email@email.com"
              style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
              required 
            />
          </div>
          <div style="margin-bottom: 16px;">
            <input 
              label for = "password"
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password (minimal 8 karakter)"
              minlength="8"
              style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
              required 
            />
          </div>
          <div style="text-align: center;">
            <button 
              type="submit" 
              style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              Daftar
            </button>
          </div>
        </form>
      </div>

      <!-- Right Side - Illustration -->
      <div
        id="side-photo" 
        style="flex: 1; background-image: url('public/map.jpg'); background-size: cover; background-position: center; color: white; display: flex; justify-content: center; align-items: center; border-radius: 12px;">
      </div>
    </div>

    <style>
      @media (max-width: 768px) {
        #register-container {
          flex-direction: column;
        }
        #side-photo {
          margin-top: 1.5rem;
          height: 300px;
          min-width: 100% !important;
        }
      }
    </style>
  `;

  const form = container.querySelector('#register-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    presenter.onRegisterSubmit(name, email, password);
  });
}
