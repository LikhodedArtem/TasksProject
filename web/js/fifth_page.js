initEscapeButton("third_page.html")


let znNumber
let post
let mechanic

let carReg = null
let znDate = null


startRequestsCount = 1


const rows = document.querySelector(".rows")

const counterRed = document.querySelector(".checklist-cell-counter.red span")
const counterYellow = document.querySelector(".checklist-cell-counter.yellow span")
const counterGreen = document.querySelector(".checklist-cell-counter.green span")
const counterGrey = document.querySelector(".checklist-cell-counter.gray span")

const counters = {
    red: counterRed,
    yellow: counterYellow,
    green: counterGreen,
    gray: counterGrey,
}


async function start() {
    znNumber = Cookie.get("znNumber")
    post = Cookie.get("post")
    mechanic = Cookie.get("mechanic")

    initCounters()
    initRows()

    if (!znNumber || !post || !mechanic) {
        createNotification("error", "Ошибка загрузки страницы")
        return
    }


    await init()
}

async function init() {
    await initSSE()

    await getZnInfo()
}

function initInfo() {
    document.querySelector("#znNumber span").textContent = znNumber
    document.querySelector("#date span").textContent = znDate
    document.querySelector("#post span").textContent = post

    const reg = document.querySelector("#reg span")
    reg.parentNode.replaceChildren(document.querySelector("#reg label"), beautyReg(carReg))
}


function initRows() {
    for (let i = 1; i <= 10; i++) {
        counters.gray.add()
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
    tripleButton.isActive = false

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
                const active = point.classList.contains("active")
                const clicked = point === closest

                if (active || clicked) {
                    const funcName = active ? "sub" : "add"
                    console.log(Array.from(point.classList)[1])

                    counters[Array.from(point.classList)[1]][funcName]()
                }

                if (clicked) {
                    point.classList.add("active")
                    point.classList.remove("inactive")
                } else {
                    point.classList.remove("active")
                    point.classList.add("inactive")
                }
            })

            if (!tripleButton.isActive) {
                tripleButton.isActive = true
                counters.gray.sub()
            }
        }
    })

    tripleButton.append(...points)

    return tripleButton
}


function initCounters() {
    Object.values(counters).forEach(counter => {
        counter.add = () => { counter.textContent = Number(counter.textContent) + 1 }
        counter.sub = () => { counter.textContent = Number(counter.textContent) - 1 }
        counter.set = (newNum) => { counter.textContent = newNum }
    })
}

async function initEnd() {
    clearLoading()
}


async function getZnInfo() {
    await requestManager.send(
        "/info/checklist/get",
        "POST",
        {
            data: {
                zn_number: znNumber,
            },
            okFunc: (data) => {
                doneStartRequest("changelist", data, (data) => {
                    znDate = createReadableDate(data.date)
                    carReg = data.car_reg
                    initInfo()
                })
            }
        }
    )
}


async function initSSE() {
    sseSource = new SmartSSESource("third_page", MY_UUID)
    sseSource.reconnectAddInfo = {
        zn_number: znNumber,
        post: post,
    }

    await sseSource.subServerEvents({"zn": znNumber})

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}


start()