import { logar } from './modules/auth.js';

const btn = document.querySelector('btn-primary');

btn?.addEventListener('click', (e) => {
  e.preventDefault();
  logar();
});