import { registerUser } from '../models/auth-model.js';
import { updateAuthUI } from '../utils/auth-ui.js';

export class RegisterPresenter {
    constructor(view, container) {
        this.view = view;
        this.container = container;
    }

    async onRegisterSubmit(name, email, password) {
        try {
            const result = await registerUser(name, email, password);
    
            if (!result.error) {
                localStorage.setItem('token', result.token);
                updateAuthUI();
                alert('Pendaftaran berhasil!');
                window.location.hash = '#/login';
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Gagal mendaftar: ' + error.message);
        }
    }       
}