export function logar() {
  var user = document.getElementById('email').value;
  var pass = document.getElementById('senha').value;

  if (user !== "admin" || pass !== "admin") return alert('Usuario ou senha incorretos.');
  
  alert('Login realizado!');
  window.location.href = "./dashboard.html";
}