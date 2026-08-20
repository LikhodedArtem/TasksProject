initEscapeButton("third_page.html")


let post
let znNumber
let mechanic
let position
let carVin
let name

startRequestsCount = 1

const createNew = document.querySelector("#createNew")
const createNewPanelWrapper = document.querySelector(".create-new-panel-wrapper")
const createNewPanel = createNewPanelWrapper.querySelector(".create-new-panel")
const createNewPinFiles = createNewPanel.querySelector(".pin-files")
const createNewPanelMain = createNewPanel.querySelector(".create-new-panel-main")

const tasksList = document.querySelector(".tasks-list")
const sendTask = createNewPanel.querySelector(".send-task")

const pinFiles = createNewPanel.querySelector(".pin-files")
const textArea = createNewPanel.querySelector(".textarea")

function clearPanel() {
    pinFiles.classList.remove("has-files")
    textArea.value = ""
}

const createNewFilesSaver = []

const tasksData = new SmartContainer()


let canChange = true


async function start() {
    post = Cookie.get("post")
    znNumber = Cookie.get("znNumber")
    mechanic = Cookie.get("mechanic")
    position = Cookie.get("position")
    carVin = Cookie.get("carVin")
    name = Cookie.get("name")

    if (!post || !znNumber || !mechanic || !position || !carVin || !name) {
        createNotification("error", "Ошибка данных Cookie")
        return
    }

    // post = "Название поста"
    // znNumber = "Номер заказ-наряда"
    // mechanic = "ФИО механика"
    // position = "Ведущий специалист"
    // carVin = "Пример номера"
    // name = "ФИО специалиста"
    // position = "Менеджер"

    initHeaderText()
    initCreateButton()

    setLoading()

    initStart()
}

async function initStart() {
    await initSSE()

    await getTasks()
}


async function initEnd() {
    initPinFiles()

    clearLoading()
}


function addTask(
    uuid,
    value,
    postName,
    mechanicName,
    znNumberName,
    carVinName,
    has,
) {
    const newTask = constructTask(
        uuid,
        value,
        postName,
        mechanicName,
        znNumberName,
        carVinName,
        has,
    )
    newTask.style.height = "0"

    tasksList.prepend(newTask)

    newTask.style.height = `${newTask.querySelector(".task").offsetHeight}px`
    newTask.classList.add("opened")

    clearPanel()
}


function initCreateButton() {
    sendTask.addEventListener("click", () => {
        if (textArea.value.length === 0) {
            createNotification("error", "Нельзя отправить задачу без текста")
            return
        }

        const getValue = textArea.value

        const uuid = crypto.randomUUID()

        requestManager.send(
            "/info/tasks/create",
            "POST",
            {
                data: {
                    uuid: uuid,
                    to_name: name,
                    value: getValue,
                    post: post,
                    mechanic: mechanic,
                    zn_number: znNumber,
                    vin: carVin,
                },
                files: [...createNewFilesSaver],
                changeUUID: true,
                anywayFunc: (data) => {
                    console.log(data)
                }
            }
        )

        addTask(uuid, getValue, post, mechanic, znNumber, carVin, createNewFilesSaver.length !== 0)

        if (!sendTask.classList.contains("clicked"))
        sendTask.classList.add("clicked")
        sendTask.addEventListener("animationend", () => {
            sendTask.classList.remove("clicked")
        }, { once: true })

        createNewFilesSaver.splice(0, createNewFilesSaver.length)
        createNewPinFiles.classList.remove("has-files")
    })

    createNew.addEventListener("click", () => {
        if (createNew.classList.contains("clicked")) {
            createNew.classList.remove("clicked")

            createNewPanelWrapper.classList.remove("opened")
            createNewPanelWrapper.style.height = "0"
            createNewPanelWrapper.style.marginTop = "0"
        } else {
            createNew.classList.add("clicked")

            createNewPanelWrapper.classList.add("opened")
            createNewPanelWrapper.style.height = `${createNewPanel.offsetHeight}px`
            createNewPanelWrapper.style.marginTop = "var(--space-2)"
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


function initPinFiles() {
    createNewPinFiles.addEventListener("click", () => {
        createPinFilesPanel("tasks", createNewPanelMain, false, createNewFilesSaver)
    })

    tasksList.addEventListener("click", (event) => {
        const pinFiles = event.target.closest(".pin-files")
        if (!pinFiles) return

        if (!pinFiles.classList.contains("has-files")) {
            createNotification("warning", "У этой задачи нет файлов")
            return
        }

        createPinFilesPanel("tasks", pinFiles.closest(".task-wrapper"), true, null)
    })
}

function hasFiles(pinFiles) {
    if (!pinFiles.classList.contains("has-files")) {
        pinFiles.classList.add("has-files")
    }
}

function hasNotFiles(pinFiles) {
    if (pinFiles.classList.contains("has-files")) {
        pinFiles.classList.remove("has-files")
    }
}


function constructTask(uuid, value, postName, mechanicName, znName, vinName, has) {
    const taskWrapper = document.createElement("div")
    taskWrapper.className = "task-wrapper"
    taskWrapper.dataset.uuid = uuid

    const task = document.createElement("div")
    task.className = "task"

    const taskHead = document.createElement("div")
    taskHead.className = "task-head"

    const taskHeadArrow = document.createElement("div")
    taskHeadArrow.style.maxHeight = "1.5rem"
    taskHeadArrow.style.maxWidth = "1.5rem"
    taskHeadArrow.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

    const taskHeadContent = document.createElement("div")
    taskHeadContent.className = "task-head-content"

    const addressName = document.createElement("div")
    addressName.className = "address-name"
    addressName.innerHTML = "<span>ОТ:</span>"

    const taskValueWrapper = document.createElement("div")
    taskValueWrapper.className = "task-value-wrapper"
    taskValueWrapper.style.height = "0px"

    const taskValue = document.createElement("div")
    taskValue.className = "task-value"

    const taskValueMain = document.createElement("div")
    taskValueMain.className = "task-value-main"

    const textArea = document.createElement("textarea")
    textArea.className = "textarea"
    textArea.disabled = true
    textArea.value = value

    const pinFiles = document.createElement("button")
    pinFiles.className = `pin-files${has ? " has-files" : ""}`
    pinFiles.innerHTML = SVG.pin

    taskHeadContent.append(addressName)
    taskHead.append(taskHeadArrow, taskHeadContent)
    taskValueMain.append(textArea, pinFiles)
    taskValue.append(taskValueMain)
    taskValueWrapper.append(taskValue)
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
        fromEl.className = "from"
        fromEl.innerHTML = `<span class="from-content ${classAdd}">${value}</span>`
        taskHeadContent.append(fromEl)
    })

    taskHead.addEventListener("click", () => {
        if (task.classList.contains("opened")) {
            taskValueWrapper.style.height = "0"
            taskWrapper.style.height = `${taskHead.offsetHeight + 10}px`
            task.classList.remove("opened")
        } else {
            const contentHeight = taskValueWrapper.scrollHeight

            taskValueWrapper.style.height = `${contentHeight}px`
            taskWrapper.style.height = `${taskHead.offsetHeight + contentHeight + 10}px`
            task.classList.add("opened")
        }
    })

    requestAnimationFrame(() => {
        taskWrapper.style.height = `${taskHead.offsetHeight + 10}px`
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
                    tasksData.replace(data)
                    renderTasks()
                })
            },
            isStart: true,
        }
    )
}


function renderTasks() {
    const data = tasksData.data()

    tasksList.innerHTML = ""

    for (const row of data) {
        const newTask = constructTask(
            row.uuid,
            row.value,
            row.post,
            row.mechanic,
            row.znNumber,
            row.vin,
            row.hasFiles,
        )
        newTask.style.marginBottom = "var(--space-2)"
        newTask.classList.add("opened")
		newTask.style.height = "auto"

        tasksList.append(newTask)
    }
}

async function initSSE() {
    sseSource = new SmartSSESource("fourth_page", MY_UUID)
    sseSource.reconnectAddInfo = {
        to_name: name,
    }

    function handleTasks(info) {
        for (const { type, data } of info) {
            if (type === "create") {
                tasksData.replace([data, ...tasksData.data()])

                addTask(
                    data.uuid,
                    data.value,
                    data.post,
                    data.mechanic,
                    data.znNumber ? data.znNumber : data.zn_number,
                    data.vin,
                    data.hasFiles,
                )
            }
        }
    }

    sseSource.addSSEEvent("tasks", (data) => {
        handleTasks(data)
        return "tasks"
    })

    sseSource.addRecoverHandler("tasks", ({ data }) => {
        handleTasks(data)
    })

    await sseSource.subServerEvents({"to_name": name})

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}


start()