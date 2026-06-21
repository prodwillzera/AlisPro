import "../configUser.js"

let serverUrl = 'http://26.180.163.91:3003'
let siteUrl = 'http://26.180.163.91:3000'

let currentParams = new URLSearchParams(window.location.search);
let token = currentParams.get('token'); 

let newHomeworkButton = document.getElementById("newHomeworkButton")
newHomeworkButton.onclick = () => window.location.href = siteUrl+'/HTML/task?'+new URLSearchParams({ token: token }).toString();

let tasksList = document.getElementById("tasksList")
let searchTasks = document.getElementById("searchTasks")

let priorityName = { high: 'Alta', medium: 'Média', low: 'Baixa' } 

let getTaskList = async() => {
    const userTasks = await fetch(serverUrl+'/get-tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token
        })
    }).then((res) => res.json());

    if (!userTasks.error) {
        let allTasks = userTasks.data
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
        drawTasks(allTasks)
    }
}

let drawTasks = async(tasks) => {
    tasksList.innerHTML = ''

    if (!tasks[0]) {
        let noTask = document.createElement('li')
        noTask.className = 'no-tasks'
        noTask.innerText = 'Nenhuma tarefa encontrada'
        tasksList.append(noTask)
    }

    for (let task of tasks) {
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

        taskInfoName.innerText = task.title.length >= 40 ? task.title.substring(0, 40)+'...' : task.title

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

        newtask.onclick = async(event) => {
            if (event.target.className.includes("action-btn")) {
                const deleteTaskRes = await fetch(serverUrl+'/delete-task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: task.id,
                        token
                    })
                }).then((res) => res.json());

                console.log(deleteTaskRes)
                if (!deleteTaskRes.error) getTaskList()
            } else {
                window.location.href = siteUrl+'/HTML/task?'+new URLSearchParams({
                    token: token,
                    taskId: task.id
                }).toString();
            }
        }
    }
}

getTaskList()