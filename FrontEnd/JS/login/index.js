let serverUrl = 'http://localhost:3003'
let siteUrl = 'http://localhost:3000'

let createAccountPageButton = document.getElementById("createAccountPageButton")
let loginPageButton = document.getElementById("loginPageButton")

let loginContent = (document.getElementsByClassName("login"))[0]
let registerContent = (document.getElementsByClassName("register"))[0]

let loginButton = document.getElementById("loginButton")
let registerButton = document.getElementById("registerButton")

let loginAlert = (document.getElementsByClassName("alert login"))[0].getElementsByTagName('label')[0]
let registerAlert = (document.getElementsByClassName("alert register"))[0].getElementsByTagName('label')[0]



createAccountPageButton.addEventListener(`click`, (event) => {
    loginContent.style.display = 'none'
    registerContent.style.display = 'block'
    registerAlert.style.display = 'none'
})

loginPageButton.addEventListener(`click`, (event) => {
    loginContent.style.display = 'block'
    registerContent.style.display = 'none'
    loginAlert.style.display = 'none'
})

let newAlert = (element, text) => {
    element.style.display = 'block'
    element.innerText = text
}

loginButton.addEventListener('click', async(event) => {
    let loginEmailInput = document.getElementById("loginEmailInput")
    let loginPasswordInput = document.getElementById("loginPasswordInput")

    if (!loginEmailInput.value || !(loginEmailInput.value.includes('@') && loginEmailInput.value.includes('.'))) return newAlert(loginAlert, 'Você deve adicionar um email válido!')
    if (!loginPasswordInput.value) return newAlert(loginAlert, 'Você deve adicionar uma senha!')
    if (loginPasswordInput.value.length < 8 || loginPasswordInput.value.length > 32) return newAlert(loginAlert, 'A senha deve conter entre 8 a 32 digitos!')

    const response = await fetch(serverUrl+'/login-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: loginEmailInput.value,
            pass: loginPasswordInput.value
        })
    }).then((res) => res.json());

    if (response.error) return newAlert(loginAlert, response.error.code || response.error)

    if (!response.data || !response.data.email) return newAlert(loginAlert, 'Email ou senhas incorretos!')
    else {
        const params = new URLSearchParams({
            token: response.token
        }).toString();
        
        window.location.href = siteUrl+'/HTML/dashboard?'+params
    }
})

registerButton.addEventListener('click', async (event) => {
    let registerEmailInput = document.getElementById("registerEmailInput")
    let registerPasswordInput = document.getElementById("registerPasswordInput")
    let registerRepeatPasswordInput = document.getElementById("registerRepeatPasswordInput")

    if (!registerEmailInput.value || !(registerEmailInput.value.includes('@') && registerEmailInput.value.includes('.'))) return newAlert(registerAlert, 'Você deve adicionar um email válido!')
    if (!registerPasswordInput.value) return newAlert(registerAlert, 'Você deve adicionar uma senha!')
    if (registerPasswordInput.value.length < 8 || registerPasswordInput.value.length > 32) return newAlert(registerAlert, 'A senha deve conter entre 8 a 32 digitos!')
    if (registerPasswordInput.value != registerRepeatPasswordInput.value) return newAlert(registerAlert, 'As senhas não conferem!')

    const response = await fetch(serverUrl+'/register-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: registerEmailInput.value,
            pass: registerPasswordInput.value
        })
    }).then((res) => res.json());

    if (response.error) return newAlert(registerAlert, response.error.code || response.error)
    
    const params = new URLSearchParams({
        token: response.token
    }).toString();
    
    window.location.href = siteUrl+'/HTML/dashboard?'+params
})