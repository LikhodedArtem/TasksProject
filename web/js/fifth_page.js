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

    const test = document.querySelector(".test")
    test.style.display = 'flex'
    test.style.gap = "var(--space-4)"

    test.append(
        constructNumInput(null, {
            type: "float",
            tenth: [true, true],
            max: 50,
            basic: 0.5,
        } ),
    )

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
        rows.append(constructRow(`Тест текста строки номер ${i}`, i % 2 === 0))
    }
}


function constructRow(value, double = false) {
    const row = document.createElement("div")
    row.className = "row"

    const button = double ? constructDoubleButton() : constructTripleButton()

    const text = document.createElement("div")
    text.textContent = value

    row.append(button, text)

    return row
}


function constructDoubleButton() {
    const doubleButton = document.createElement("div")
    doubleButton.className = "double-button"

    const doubleButtonPointBlack = document.createElement("div")
    doubleButtonPointBlack.className = "double-button-point red inactive"

    const doubleButtonPointWhite = document.createElement("div")
    doubleButtonPointWhite.className = "double-button-point green inactive"

    const points = [
        doubleButtonPointBlack,
        doubleButtonPointWhite,
    ]

    initMultipleButton(
        doubleButton,
        points
    )

    doubleButton.append(...points)

    return doubleButton
}


function getInt(num) {
    return Math.floor(num)
}

function getFloat(num) {
    return (Math.round(num * 100) - Math.floor(num) * 100) % 100
}


function constructNumInput(
    value = null,
    {
        min = 0,
        max = Infinity,
        type = "integer", // integer, float
        tenth = [],
        basic = null
    }) {
    if (
        !(
            type === "float"
            || type === "integer"
        )
    ) {
        throw Error("Wrong NumInput type")
    }

    const numInput = document.createElement("div")
    numInput.className = "num-input"

    const numInputValue = document.createElement("div")
    numInputValue.className = "num-input-value"

    const numInputValueText = document.createElement("span")
    numInputValueText.className = "num-input-value-text"
    numInputValueText.textContent = value ? value : '?'

    numInputValue.append(numInputValueText)
    numInput.append(numInputValue)

    function getTenth(id) {
        return tenth[id] === undefined || tenth[id] === null ? false : tenth[id]
    }

    function getBasic() {
        return basic === undefined || basic === null ? min : basic
    }

    function constructPanel() {
        const numInputPanel = document.createElement("div")
        numInputPanel.className = `num-input-panel ${type}`

        const numInputPanelBody = document.createElement("div")
        numInputPanelBody.className = "num-input-panel-body"

        const numInputPanelClose = document.createElement("div")
        numInputPanelClose.className = "num-input-panel-close"
        numInputPanelClose.innerHTML = SVG.x

        const numInputPanelApply = document.createElement("div")
        numInputPanelApply.className = "num-input-panel-apply"
        numInputPanelApply.innerHTML = `<div>${SVG.load}</div>`

        numInputPanelClose.addEventListener("click", closeNumInput)
        numInputPanelApply.addEventListener("click", apply)

        numInputPanelBody.append(numInputPanelClose, numInputPanelApply)

        if (type === "integer") {
            const numInteger = constructInteger(
                getTenth(0),
                numInputValueText.textContent !== "?"
                    ? numInputValueText.textContent
                    : getBasic(),
                min,
                max
            )

            numInputPanelBody.append(
                numInteger
            )

            numInteger.addEventListener("click", (event) => {
                const arrow = event.target.closest(".num-arrow")
                if (!arrow) return

                const value = arrow.classList.contains("tenth") ? 10 : 1
                const operation = arrow.classList.contains("add")
                const check = operation
                    ? numInteger.get() !== max
                    : numInteger.get() !== min

                if (!check) {
                    if (!arrow.classList.contains("bad-click")) {
                        arrow.classList.add("bad-click")
                        arrow.addEventListener("animationend", () => {
                            arrow.classList.remove("bad-click")
                        }, { once: true })
                    }
                    return
                }

                numInteger.set(
                    operation
                        ? Math.min(numInteger.get() + value, max)
                        : Math.max(numInteger.get() - value, min)
                )
            })

            numInput.apply = () => {
                return numInteger.get().toString()
            }

        } else if (type === "float") {
            const dot = document.createElement("div")
            dot.className = 'num-input-dot'

            const currentValue = numInputValueText.textContent !== "?"
                ? Number(numInputValueText.textContent)
                : getBasic()

            const intNumInput = constructInteger(
                getTenth(0),
                getInt(currentValue)
            )
            intNumInput.classList.add("int")

            const floatNumInput = constructInteger(
                getTenth(1),
                getFloat(currentValue)
            )
            intNumInput.classList.add("float")

            numInputPanelBody.append(
                intNumInput,
                dot,
                floatNumInput,
            )

            function getCurrent() {
                return intNumInput.get() + floatNumInput.get() * 0.01
            }

            numInputPanelBody.addEventListener("click", (event) => {
                const arrow = event.target.closest(".num-arrow")
                if (!arrow) return

                const multiplier = arrow.closest(".num-integer").classList.contains("int") ? 1 : 0.01
                const value = arrow.classList.contains("tenth") ? 10 : 1
                const operation = arrow.classList.contains("add")

                const currentValue = getCurrent()

                const check = operation
                    ? currentValue !== max
                    : currentValue !== min

                if (!check) {
                    if (!arrow.classList.contains("bad-click")) {
                        arrow.classList.add("bad-click")
                        arrow.addEventListener("animationend", () => {
                            arrow.classList.remove("bad-click")
                        }, { once: true })
                    }
                    return
                }

                const newValue = operation
                    ? Math.min(currentValue + value * multiplier, max)
                    : Math.max(currentValue - value * multiplier, min)

                intNumInput.set(getInt(newValue))
                floatNumInput.set(getFloat(newValue))
            })

            numInput.apply = () => {
                return getCurrent()
            }
        }

        numInputPanel.append(numInputPanelBody)

        return numInputPanel
    }

    function openNumInput() {
        if (numInput.classList.contains("opened")) return

        numInput.classList.add("opened")

        const panel = constructPanel()

        numInput.append(panel)

        panel.style.opacity = "0"

        void panel.offsetHeight

        panel.style.opacity = "1"

        setTimeout(setAnotherClickHandler, 10)
    }

    function closeNumInput() {
        if (!numInput.classList.contains("opened")) return

        numInput.classList.remove("opened")

        numInput.removeChild(numInput.querySelector(".num-input-panel"))
    }

    numInput.addEventListener("click", (event) => {
        if (event.target.closest(".num-input-panel") !== null) return
        openNumInput()
    })

    function setAnotherClickHandler() {
        window.addEventListener("click", (event) => {
            const findNumInputPanel = event.target.closest(".num-input-panel")

            findNumInputPanel === numInput.querySelector(".num-input-panel")
                ? setAnotherClickHandler()
                : closeNumInput()
        }, {
            once: true
        })
    }

    function apply() {
        numInputValueText.textContent = numInput.apply()
        closeNumInput()
    }

    return numInput
}

function constructInteger(tenth, basic) {
    const numInteger= document.createElement("div")
    numInteger.className = "num-integer"

    numInteger.append(constructNumArrow(true, false))
    if (tenth) numInteger.append(constructNumArrow(true, true))

    const field = constructNumField(basic)

    numInteger.append(field)

    if (tenth) numInteger.append(constructNumArrow(false, true))
    numInteger.append(constructNumArrow(false, false))

    numInteger.get = field.get
    numInteger.set = field.set

    return numInteger
}

function constructNumArrow(add = true, tenth = false) {
    const numArrow = document.createElement("div")
    numArrow.className = `num-arrow ${add ? "add" : "sub"}${tenth ? " tenth" : ""}`
    if (!tenth) numArrow.innerHTML = '<svg viewBox="0 0 24 24" overflow="visible" fill="currentColor" stroke="var(--color-border)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M10.66,2.68 L1.34,21.32 Q0,24 3,24 L21,24 Q24,24 22.66,21.32 L13.34,2.68 Q12,0 10.66,2.68 Z" vector-effect="non-scaling-stroke"/></svg>'

    return numArrow
}

function constructNumField(value) {
    const numField = document.createElement("div")
    numField.className = "num-field"

    const numFieldValue = document.createElement("span")
    numFieldValue.className = "num-field-value"
    numFieldValue.textContent = value

    numField.append(numFieldValue)

    numField.get = () => {
        return numFieldValue.length !== 0 ? Number(numFieldValue.textContent) : null
    }

    numField.set = (newNum) => {
        numFieldValue.textContent = newNum
    }

    return numField
}


function constructTripleButton() {
    const tripleButton = document.createElement("button")
    tripleButton.className = "triple-button"

    const tripleButtonPointRed = document.createElement("div")
    tripleButtonPointRed.className = "triple-button-point red inactive"

    const tripleButtonPointYellow = document.createElement("div")
    tripleButtonPointYellow.className = "triple-button-point yellow inactive"

    const tripleButtonPointGreen = document.createElement("div")
    tripleButtonPointGreen.className = "triple-button-point green inactive"

    const points = [
        tripleButtonPointRed,
        tripleButtonPointYellow,
        tripleButtonPointGreen
    ]

    initMultipleButton(
        tripleButton,
        points,
    )

    tripleButton.append(...points)

    return tripleButton
}


function initMultipleButton(button, buttonPoints) {
    button.isActive = false

    button.addEventListener("click", (event) => {
        let closest
        let minDistance = Infinity

        const clickX = event.clientX
        const clickY = event.clientY

        buttonPoints.forEach((tripleButtonPoint) => {
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
            buttonPoints.forEach((point) => {
                const active = point.classList.contains("active")
                const clicked = point === closest

                if (active || clicked) {
                    const funcName = active ? "sub" : "add"
                    console.log(Array.from(point.classList)[1])

                    counters[Array.from(point.classList)[1]][funcName]()
                }

                if (clicked) {
                    point.classList.add("active")
                } else {
                    point.classList.remove("active")
                }
            })

            if (!button.isActive) {
                button.isActive = true
                buttonPoints.forEach((point) => {
                    point.classList.remove("inactive")
                })
                counters.gray.sub()
            }
        }
    })
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