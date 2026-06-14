export function logar() {
  var user = document.getElementById('user').value;
  var pass = document.getElementById('password').value;
  var remember = document.getElementById('rememberPass').checked;

  if (user !== "admin" && pass !== "admin") return alert('Usuario ou senha incorretos.');

  remember
    ? (localStorage.setItem("user", user), localStorage.setItem("password", pass))
    : (localStorage.removeItem("user", user), localStorage.removeItem("password", pass))

  alert('Login realizado!');
  window.location.href = "./page0.html";
}