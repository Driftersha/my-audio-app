import { el } from 'redom';
import { loginUser, registerUser } from '../api/auth';
import defaultAvatar from '../assets/img/avatar.png';
import { validateAuthForm } from '../utils/validateAuth';

export class AuthForm {
  el: HTMLElement;
  private isRegisterMode: boolean;
  private messageEl: HTMLElement;

  constructor(mode: 'login' | 'register' = 'login', successMessage?: string) {
    this.isRegisterMode = mode === 'register';

    const hiddenTitle = el('h1.visually-hidden', 'Аутентификация');
    const title = el('h2.auth-form__title', this.getTitle());

    const usernameInput = el('input.auth-form__input', {
      type: 'text',
      placeholder: 'Имя пользователя',
    }) as HTMLInputElement;

    const passwordInput = el('input.auth-form__input', {
      type: 'password',
      placeholder: 'Пароль',
    }) as HTMLInputElement;

    const usernameField = el('div.auth-form__field', usernameInput);
    const passwordField = el('div.auth-form__field', passwordInput);

    this.messageEl = el('p.auth-form__message') as HTMLElement;

    const submitBtn = el('button.auth-form__submit', this.getSubmitLabel());

    const toggleLink = el(
      'a.auth-form__toggle',
      {
        href: '#',
        onclick: (e: Event) => {
          e.preventDefault();
          const newMode = this.isRegisterMode ? 'login' : 'register';
          const newForm = new AuthForm(newMode);
          this.el.replaceWith(newForm.el);
        },
      },
      this.isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрируйтесь'
    );

    const form = el(
      'form.auth-form__form',
      {
        onsubmit: async (e: Event) => {
          e.preventDefault();

          this.clearMessages();
          usernameInput.classList.remove('auth-form__input--error');
          passwordInput.classList.remove('auth-form__input--error');

          const username = usernameInput.value.trim();
          const password = passwordInput.value.trim();

          const { valid, message, field } = validateAuthForm(username, password);
          if (!valid) {
            this.showMessage(message ?? 'Ошибка', 'error');
            if (field === 'username') usernameInput.classList.add('auth-form__input--error');
            if (field === 'password') passwordInput.classList.add('auth-form__input--error');
            return;
          }

          try {
            const data = this.isRegisterMode
              ? await registerUser(username, password)
              : await loginUser(username, password);

            if ('token' in data) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('username', username);
              localStorage.setItem('avatar', defaultAvatar);

              if (this.isRegisterMode) {
                localStorage.setItem('registrationSuccess', 'true');
                const newForm = new AuthForm('login', 'Пользователь успешно зарегистрирован');
                this.el.replaceWith(newForm.el);
              } else {
                location.href = '/';
              }
            } else {

              const isSuccess = data.message?.toLowerCase().includes('успешно');
              this.showMessage(data.message || 'Ошибка', isSuccess ? 'success' : 'error');
            }
          } catch (err: any) {
            this.showMessage(err.message || 'Ошибка запроса', 'error');
          }
        },
      },
      usernameField,
      passwordField,
      this.messageEl,
      submitBtn,
      toggleLink
    );

    const inner = el('div.auth-form__inner', title, form);
    const wrapper = el('div.auth-form__wrapper', inner);
    const container = el('div.container', wrapper);
    this.el = el('section.auth-section', hiddenTitle, container);

    if (successMessage) {
      this.showMessage(successMessage, 'success');
    }
  }

  private getTitle(): string {
    return this.isRegisterMode ? 'Регистрация' : 'Вход';
  }

  private getSubmitLabel(): string {
    return this.isRegisterMode ? 'Зарегистрироваться' : 'Войти';
  }

  private clearMessages() {
    this.messageEl.textContent = '';
    this.messageEl.classList.remove(
      'auth-form__message--visible',
      'auth-form__message--error',
      'auth-form__message--success'
    );
  }

  private showMessage(text: string, type: 'error' | 'success') {
    this.messageEl.textContent = text;
    this.messageEl.classList.remove('auth-form__message--error', 'auth-form__message--success');
    this.messageEl.classList.add(`auth-form__message--${type}`, 'auth-form__message--visible');
  }
}






