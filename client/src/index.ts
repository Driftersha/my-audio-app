import { App } from './App';
import { AuthForm } from './components/AuthForm';
import './styles/style.css';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');

  if (!root) {
    return;
  }

  const token = localStorage.getItem('token');

  let view;

  if (token) {
    view = new App();
  } else {
    const successMessage = localStorage.getItem('registrationSuccess') === 'true'
      ? 'Пользователь успешно зарегистрирован'
      : undefined;

    if (successMessage) {
      localStorage.removeItem('registrationSuccess');
    }

    view = new AuthForm('login', successMessage);
  }

  root.replaceWith(view.el);
});
