import "../configUser.js"

let serverUrl = 'http://26.180.163.91:3003'
let siteUrl = 'http://26.180.163.91:3000'

let currentParams = new URLSearchParams(window.location.search);
let token = currentParams.get('token'); 
let taskId = currentParams.get('taskId'); 

let taskTitle = document.getElementById("taskTitle")
let taskDescription = document.getElementById("taskDescription")

let taskPriority = document.getElementById("taskPriority")
let taskCompleted = document.getElementById("taskCompleted")

let taskDate = document.getElementById("taskDate")
let setDate = (time) => taskDate.value = time.toISOString().split('T')[0]

let errorAlert = document.getElementById("errorAlert").getElementsByTagName('label')[0]

let saveTaskButton = document.getElementById("saveTaskButton")
let cancelButton = document.getElementById("cancelButton")


if (taskId) {
    const taskRes = await fetch(serverUrl+'/get-task-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: taskId,
            token
        })
    }).then((res) => res.json());

    let taskInfo = taskRes.data
    if (taskInfo && !taskInfo.error) {
        taskTitle.value = taskInfo.title
        taskDescription.value = taskInfo.description
        taskPriority.value = taskInfo.priority
        taskCompleted.checked = taskInfo.status == 'completed'
        console.log(taskInfo)

        setDate(new Date(taskInfo.due_date))
    } else {
        taskId = null
        setDate(new Date())
    }
} else setDate(new Date())

let newAlert = (text) => {
    errorAlert.innerText = text
    errorAlert.style.display = 'block'
}

cancelButton.onclick = () => window.location.href = siteUrl+'/HTML/dashboard?'+new URLSearchParams({ token }).toString();
saveTaskButton.onclick = async() => {
    if (!taskTitle.value) return newAlert('Você deve adicionar um título!')
    if (!taskDescription.value) return newAlert('Você deve adicionar uma descrição!')
    if (+new Date(taskDate.value) <= +new Date()) return newAlert('Você deve adicionar uma data futura!')

    const saveTaskRes = await fetch(serverUrl+'/save-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: taskId,
            title: taskTitle.value,
            description: taskDescription.value,
            priority: taskPriority.value,
            due_date: `${taskDate.value}`,
            status: taskCompleted.checked ? 'completed' : 'pending',
            token
        })
    }).then((res) => res.json());

    if (saveTaskRes.error) {
        console.error(saveTaskRes)
        newAlert(saveTaskRes.error)
    } else {
        window.location.href = siteUrl+'/HTML/dashboard?'+new URLSearchParams({ token }).toString();
    }
}