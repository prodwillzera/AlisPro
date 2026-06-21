let serverUrl = 'http://26.180.163.91:3003'

let currentParams = new URLSearchParams(window.location.search);
let token = currentParams.get('token'); 

let userName = document.getElementById("userName")

const userInfo = await fetch(serverUrl+'/get-user-info', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token
    })
}).then((res) => res.json());

if (userInfo.data) {
    userName.innerText = userInfo.data.name
} else window.location.href = window.location.origin+'/HTML/login'