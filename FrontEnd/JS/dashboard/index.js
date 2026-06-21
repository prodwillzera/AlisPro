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
        if (task.status == 'completed') {
            taskMeta.style.color = 'var(--priority-low)'
            taskMeta.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                
            `
        } else if (taskMetaTime <= +new Date()) {
            taskMeta.style.color = 'var(--priority-high)'
            taskMeta.innerHTML =`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M12 9V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                
            `
        } else {
            taskMeta.style.color = 'var(--priority-medium)'
            taskMeta.innerHTML = `
                <svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            `
        }

        taskMeta.innerHTML += `${taskMetaTime.getDate().toString().padStart(2, "0")}/${taskMetaTime.getMonth().toString().padStart(2, "0")}/${taskMetaTime.getFullYear()}`

        taskActions.className = 'task-actions'
        deleteTaskButton.className = 'action-btn'
        deleteTaskButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6 7L7 20H17L18 7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M9 7V4H15V7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
        `

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