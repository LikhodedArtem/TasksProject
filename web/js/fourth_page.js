let post
let znNumber
let mechanic
let position
let carVin
let name

async function start() {
    initEscapeButton("third_page.html")

    // post = Cookie.get("post")
    // znNumber = Cookie.get("znNumber")
    // mechanic = Cookie.get("mechanic")
    // position = Cookie.get("position")
    // carVin = Cookie.get("carVin")
    // name = Cookie.get("name")

    post = "Название поста"
    znNumber = "Номер заказ-наряда"
    mechanic = "ФИО механика"
    position = "Ведущий специалист"
    carVin = "Пример номера"
    name = "ФИО специалиста"
    // position = "Менеджер"

    initHeaderText()
    initCreateButton()

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

    createNew.addEventListener("click", () => {
        if (createNew.classList.contains("clicked")) {
            createNew.classList.remove("clicked")
        } else {
            createNew.classList.add("clicked")
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


start()