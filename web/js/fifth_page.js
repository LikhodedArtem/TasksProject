initEscapeButton("third_page.html")


let znNumber
let post
let mechanic

let carReg = "ИМИТАЦИЯ ДАННЫХ"
let znDate = "ИМИТАЦИЯ ДАННЫХ"


const rows = document.querySelector(".rows")


async function start() {
    znNumber = Cookie.get("znNumber")
    post = Cookie.get("post")
    mechanic = Cookie.get("mechanic")

    initInfo()
    initRows()

    if (!znNumber || !post || !mechanic) {
        createNotification("error", "Ошибка загрузки страницы")
        return
    }


    await init()
}

function initInfo() {
    document.querySelector("#znNumber span").textContent = znNumber
    document.querySelector("#date span").textContent = znDate
    document.querySelector("#reg span").textContent = carReg
    document.querySelector("#post span").textContent = post
}


function initRows() {
    for (let i = 1; i <= 10; i++) {
        rows.append(constructRow(`Тест текста строки номер ${i}`))
    }
}


function constructRow(value) {
    const row = document.createElement("div")
    row.className = "row"

    const tripleButton = constructTripleButton()

    const text = document.createElement("div")
    text.textContent = value

    row.append(tripleButton, text)

    return row
}


function constructTripleButton() {
    const tripleButton = document.createElement("button")
    tripleButton.className = "triple-button"

    const tripleButtonPointRed = document.createElement("div")
    tripleButtonPointRed.className = "triple-button-point red"

    const tripleButtonPointYellow = document.createElement("div")
    tripleButtonPointYellow.className = "triple-button-point yellow"

    const tripleButtonPointGreen = document.createElement("div")
    tripleButtonPointGreen.className = "triple-button-point green"

    const points = [tripleButtonPointRed, tripleButtonPointYellow, tripleButtonPointGreen]

    tripleButton.addEventListener("click", (event) => {
        let closest
        let minDistance = Infinity

        const clickX = event.clientX
        const clickY = event.clientY

        points.forEach((tripleButtonPoint) => {
            const rect = tripleButtonPoint.getBoundingClientRect()

            const centerX = rect.left  + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const distance = Math.hypot(clickX - centerX, clickY - centerY)

            if (distance < minDistance) {
                minDistance = distance
                closest = tripleButtonPoint
            }
        })

        if (!closest.classList.contains("active")) {
            points.forEach((point) => {
                point.classList.remove("active")
                point !== closest
                    ? point.classList.add("inactive")
                    : point.classList.remove("inactive")
            })

            closest.classList.add("active")
        }
    })

    tripleButton.append(...points)

    return tripleButton
}


async function init() {
    await initSSE()

    await getZnInfo()
}

async function initEnd() {
    clearLoading()
}


async function getZnInfo() {

}


async function initSSE() {

}


start()