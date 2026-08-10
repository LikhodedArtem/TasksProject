let post
let znNumber
let mechanic
let position
let carVin
let name

startRequestsCount = 1

const tasksList = document.querySelector(".tasks-list")


async function start() {
    initEscapeButton("third_page.html")

    post = Cookie.get("post")
    znNumber = Cookie.get("znNumber")
    mechanic = Cookie.get("mechanic")
    position = Cookie.get("position")
    carVin = Cookie.get("carVin")
    name = Cookie.get("name")

    // post = "Название поста"
    // znNumber = "Номер заказ-наряда"
    // mechanic = "ФИО механика"
    // position = "Ведущий специалист"
    // carVin = "Пример номера"
    // name = "ФИО специалиста"
    // position = "Менеджер"

    initHeaderText()
    initCreateButton()

    // setLoading()

    // initStart()

    initStart()
}

async function initStart() {
    await initSSE()

    await getTasks()
}


async function initEnd() {
    clearLoading()
}


async function initSSE() {

}


function initCreateButton() {
    const createNew = document.querySelector("#createNew")
    const createNewPanelWrapper = document.querySelector(".create-new-panel-wrapper")
    const createNewPanel = createNewPanelWrapper.querySelector(".create-new-panel")

    const pinFiles = createNewPanel.querySelector(".pin-files")
    const textArea = createNewPanel.querySelector(".textarea")

    const sendTask = createNewPanel.querySelector(".send-task")

    function clearPanel() {
        pinFiles.classList.remove("has-files")
        textArea.value = ""
    }

    sendTask.addEventListener("click", () => {
        if (textArea.value.length === 0) {
            createNotification("error", "Нельзя отправить задачу без текста")
            return
        }

        const getValue = textArea.value

        requestManager.send(
            "/info/tasks/create",
            "POST",
            {
                data: {
                    to_name: name,
                    value: getValue,
                    post: post,
                    mechanic: mechanic,
                    zn_number: znNumber,
                    vin: carVin,
                },
                changeUUID: true,
            }
        )

        const newTask = constructTask(getValue, post, mechanic, znNumber, carVin)
        newTask.style.height = "0"

        tasksList.prepend(newTask)

        newTask.style.height = `${newTask.querySelector(".task").offsetHeight}px`
        newTask.classList.add("opened")

        if (!sendTask.classList.contains("clicked"))
            sendTask.classList.add("clicked")
            sendTask.addEventListener("animationend", () => {
                sendTask.classList.remove("clicked")
            }, { once: true })

        clearPanel()
    })

    createNew.addEventListener("click", () => {
        if (createNew.classList.contains("clicked")) {
            createNew.classList.remove("clicked")

            createNewPanelWrapper.classList.remove("opened")
            createNewPanelWrapper.style.height = "0"

        } else {
            createNew.classList.add("clicked")

            createNewPanelWrapper.classList.add("opened")
            createNewPanelWrapper.style.height = `${createNewPanel.offsetHeight}px`
        }
    })
}


function initHeaderText() {
    document.querySelector("#position").textContent = position
    document.querySelector("#mechanic").textContent = mechanic
    document.querySelector("#post").textContent = post
    document.querySelector("#znNumber").textContent = znNumber
    document.querySelector("#name").textContent = name
    document.querySelector("#carVin").textContent = carVin
}


function constructTask(value, postName, mechanicName, znName, vinName) {
    const taskWrapper = document.createElement("div")
    taskWrapper.className = "task-wrapper"

    const task = document.createElement("div")
    task.className = "task"

    const taskHead = document.createElement("div")
    taskHead.className = "task-head"

    const taskHeadArrow = document.createElement("div")
    taskHeadArrow.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

    const taskHeadContent = document.createElement("div")
    taskHeadContent.className = "task-head-content"

    const addressName = document.createElement("div")
    addressName.className = "address-name"
    addressName.innerHTML = "<span>ОТ:</span>"

    const taskValueWrapper = document.createElement("div")
    taskValueWrapper.className = "task-value-wrapper"

    const taskValue = document.createElement("div")
    taskValue.className = "task-value"

    const taskValueMain = document.createElement("div")
    taskValueMain.className = "task-value-main"

    const textArea = document.createElement("textarea")
    textArea.className = "textarea"
    textArea.disabled = true
    textArea.textContent = value

    const pinFiles = document.createElement("button")
    pinFiles.className = "pin-files"
    pinFiles.innerHTML = SVG.pin

    taskHeadContent.append(addressName)

    taskHead.append(taskHeadArrow, taskHeadContent)
    taskValueWrapper.append(taskValue)
    taskValue.append(taskValueMain)
    taskValueMain.append(textArea, pinFiles)

    task.append(taskHead, taskValueWrapper)
    taskWrapper.append(task)

    const info = [
        ["post", postName],
        ["mechanic", mechanicName],
        ["zn-number", znName],
        ["car-vin", vinName],
    ]

    info.forEach(([classAdd, value]) => {
        const fromEl = document.createElement("div")
        fromEl.className = `from`
        fromEl.innerHTML = `<span class="from-content ${classAdd}">${value}</span>`
        taskHeadContent.append(fromEl)
    })

    taskHead.addEventListener("click", () => {
        if (task.classList.contains("opened")) {
            taskValueWrapper.style.height = "0"
            taskWrapper.style.height = `${taskHead.offsetHeight}px`
            task.classList.remove("opened")
        } else {
            taskValueWrapper.style.height = `${taskValue.offsetHeight}px`
            taskWrapper.style.height = `${taskHead.offsetHeight + taskValue.offsetHeight + 16}px`
            task.classList.add("opened")
        }
    })

    return taskWrapper
}


async function getTasks() {
    await requestManager.send(
        "/info/tasks/get",
        "POST",
        {
            data: {
                "to_name": name
            },
            okFunc: (data) => {
                doneStartRequest("tasks", data, (data) => {
                    renderTasks(data)
                })
            }
        }
    )
}


function renderTasks(data) {
    tasksList.innerHTML = ""

    for (const row of data) {
        const newTask = constructTask(
            row.value,
            row.post,
            row.mechanic,
            row.zn_number,
            row.vin
        )
        newTask.style.marginBottom = "var(--space-2)"
        newTask.classList.add("opened")

        tasksList.append(newTask)
    }
}


start()