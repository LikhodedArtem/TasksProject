let post
let znNumber
let mechanic
let position
let carVin
let name

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
    initTasks()

    // setLoading()

    // initStart()

    initEnd()
}

async function initStart() {
    await initSSE()
}


async function initEnd() {

}


async function initSSE() {

}


function initCreateButton() {
    const createNew = document.querySelector("#createNew")
    const createNewPanelWrapper = document.querySelector(".create-new-panel-wrapper")
    const createNewPanel = document.querySelector(".create-new-panel")

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


function initTasks() {
    const tasks = document.querySelectorAll(".task")

    tasks.forEach((task) => {
        const taskHead = task.querySelector(".task-head")
        const taskValueWrapper = task.querySelector(".task-value-wrapper")
        const taskValue = task.querySelector(".task-value")

        taskHead.addEventListener("click", () => {
            if (task.classList.contains("opened")) {
                taskValueWrapper.style.height = "0"
                task.classList.remove("opened")
            } else {
                taskValueWrapper.style.height = `${taskValue.offsetHeight}px`
                task.classList.add("opened")
            }
        })
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


start()