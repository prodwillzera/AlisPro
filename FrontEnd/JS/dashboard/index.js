let serverUrl = 'http://localhost:3003'
let siteUrl = 'http://localhost:3000'

let tasksList = document.getElementById("tasksList")
let searchTasks = document.getElementById("searchTasks")

let params = new URLSearchParams(window.location.search);
let token = params.get('token'); 

let priorityName = { high: 'Alta', medium: 'Média', low: 'Baixa' } 

const response = await fetch(serverUrl+'/get-tasks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token
    })
}).then((res) => res.json());

let drawTasks = (tasks) => {
    tasksList.innerHTML = ''

    for (let task of tasks) {
        console.log(task)

        let newtask = document.createElement('li')
        let taskInfo = document.createElement('div')
        let taskInfoName = document.createElement('p')
        let taskInfoPriority = document.createElement('p')
        let taskMeta = document.createElement('div')
        let taskActions = document.createElement('div')
        let deleteTaskButton = document.createElement('button')

        newtask.className = 'task-item'

        taskInfo.className = 'task-info'
        taskInfoName.className = 'info__name'
        taskInfoPriority.className = 'info__priority'

        taskMeta.className = 'task-meta'

        taskInfoName.innerText = task.title

        taskInfoPriority.innerHTML = `Prioridade: <span class="priority ${task.priority}">${priorityName[task.priority]}</span>`

        let taskMetaTime = new Date(task.due_date)
        taskMeta.innerText = `${taskMetaTime.getDate().toString().padStart(2, "0")}/${taskMetaTime.getMonth().toString().padStart(2, "0")}/${taskMetaTime.getFullYear()}`

        taskActions.className = 'task-actions'
        deleteTaskButton.className = 'action-btn'
        deleteTaskButton.innerText = 'X'

        taskInfo.append(taskInfoName)
        taskInfo.append(taskInfoPriority)
        taskActions.append(deleteTaskButton)
        newtask.append(taskInfo)
        newtask.append(taskMeta)
        newtask.append(taskActions)

        tasksList.append(newtask)
    }
}

if (response.error) window.location.href = siteUrl+'/HTML/login'
else {
    let allTasks = response.data
    let oldSearchText = ''

    let loop = () => {
        if (oldSearchText != searchTasks.value) {
            oldSearchText = searchTasks.value
            drawTasks(allTasks.filter((t) => 
                t.description.toLowerCase().includes(searchTasks.value) ||
                t.priority.toLowerCase().includes(searchTasks.value) ||
                priorityName[t.priority].toLowerCase().includes(searchTasks.value) ||
                t.title.toLowerCase().includes(searchTasks.value) ||
                t.due_date.toLowerCase().includes(searchTasks.value)
            ))
        }
        setTimeout(loop, 1000/10)
    }
    loop()

    if (allTasks[0]) drawTasks(allTasks)
    else {
        let noTask = document.createElement('li')
        noTask.className = 'no-tasks'
        noTask.innerText = 'Nenhuma tarefa encontrada'
        tasksList.append(noTask)
    }
}