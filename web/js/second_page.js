initEscapeButton("first_page.html")


const infoTable = document.querySelector(".info-table")
const postNumbers = infoTable.querySelectorAll(".table-cell.number p")

let mechanic = null
let post = null

startRequestsCount = 1

const znsData = new SmartContainer()

async function start() {
    post = Cookie.get("post")
    mechanic = Cookie.get("mechanic")

    if (!mechanic || !post) {
        createNotification("error", "Ошибка данных Cookie")
        return
    }

    updateUserSelect()

    setLoading()

    initStart()
}


async function initStart() {
    await initSSE()

    await updateTable()
}

async function initEnd() {
    initEvents()

    clearLoading()
}



function updateUserSelect() {
    const texts = document.querySelector(".header-settings-main").querySelectorAll(".setting-block-value span")

    const data = Cookie.getGroup([
        "territory", "post", "mechanic"
    ], true)

    texts[0].textContent = (data.territory) ? data.territory : "?"
    texts[1].textContent = (data.post) ? data.post : "?"
    texts[2].textContent = (data.mechanic) ? data.mechanic : "?"
}


function renderData() {
    const data = znsData.data()

    infoTable.innerHTML = '' +
        '<div class="table-column-name no-break">\n' +
        '            <span>Время</span>\n' +
        '          </div>\n' +
        '          <div class="table-column-name">\n' +
        '            <span>№ Заказ наряда</span>\n' +
        '          </div>\n' +
        '          <div class="table-column-name">\n' +
        '            <span>Автомобиль</span>\n' +
        '          </div>\n' +
        '          <div></div>\n' +
        '  \n' +
        '          <div class="table-content">\n' +
        '  \n' +
        '          </div>'

    if (!data.length) {
        infoTable.innerHTML = ""
        infoTable.style.display = "flex"
        infoTable.style.alignItems = "center"
        infoTable.style.justifyContent = "center"

        const nothing = document.createElement("span")
        nothing.className = "nothing-text"
        nothing.textContent = "По этой выборке ничего не найдено..."

        infoTable.append(nothing)
        return
    }

    const infoTableContent = infoTable.querySelector(".table-content")
    infoTableContent.innerHTML = ""

    for (const row of data) {
        const rowContent = document.createElement("div")
        rowContent.className = "row-content"
        rowContent.dataset.znNumber = row.number

        rowContent.append(
            constructCell(`${createReadableDate(row.date1)}<br>${createReadableDate(row.date2)}`, "time"),
            constructCell(row.number, "number"),
            constructCarCell(row.car),
            constructTaskEquip()
        )

        const addData = constructAddData(row)
        const nothing = document.createElement("div")

        rowContent.append(addData, nothing)

        infoTableContent.append(rowContent)
    }
}


async function updateTable() {
    const post = Cookie.get("post")

    if (!post) return

    return await requestManager.send(
        `info/zns`,
        "POST",
        {
            data: {post: post},
            okFunc: (data) => {
                doneStartRequest("zns", data, (data) => {
                    znsData.replace(data)
                    renderData()
                })
            },
            isStart: true,
        }
    )
}

function constructAddData(row) {
    const addDataWrapper = document.createElement("div")
    addDataWrapper.classList = "add-data-wrapper"

    const addData = document.createElement("div")
    addData.classList = "add-data"

    const addDataName = document.createElement("label")
    addDataName.className = "add-data-name"
    addDataName.textContent = "Причина обращения"

    const reason = document.createElement("textarea")
    reason.className = "textarea reason"
    reason.value = row.reason
    reason.disabled = true

    addData.append(addDataName, reason)

    addDataWrapper.append(addData)

    return addDataWrapper
}

function constructTaskEquip() {
    const tableEquip = document.createElement("div")
    tableEquip.className = "table-equip"

    const tableEquipButton = document.createElement("button")
    tableEquipButton.className = "table-equip-button"

    tableEquipButton.innerHTML = SVG.arrowLeft

    tableEquip.append(tableEquipButton)

    return tableEquip
}

function constructCarCell(model) {
    const cell = document.createElement("div")
    cell.classList.add("table-cell", "car")

    const modelHeader = document.createElement("div")
    modelHeader.className = "car-header"

    const modelFooter = document.createElement("div")
    modelFooter.className = "car-footer"

    modelHeader.append(
        constructCarCellCarCell(model.vin, "vin"),
        constructCarCellCarCell(model.reg, "reg"),
    )

    modelFooter.append(
        constructCarCellCarCell(model.model, "model"),
        constructCarCellCarCell(model.year + "г.", "year"),
        constructCarCellCarCell(model.millage + "км.", "millage")
    )

    cell.append(modelHeader, modelFooter)

    return cell
}

function constructCarCellCarCell(text, addClass) {
    const modelCell = document.createElement("div")
    modelCell.classList.add("car-cell", addClass)

    let modelSpan = document.createElement("span")
    modelSpan.textContent = text

    if (addClass === "reg") {
        modelSpan = beautyReg(text)
    }

    modelCell.append(modelSpan)

    return modelCell
}


function initEvents() {
    postNumbers.forEach((postNumber) => {
        const result = []
        const breakIndex = Math.round(postNumber.textContent.length / 3)

        for (let i = 0; i < postNumber.textContent.length; i++) {
            result.push(postNumber.textContent[i])
            if (i % (breakIndex) === breakIndex - 1) result.push("\u00AD")
        }

        postNumber.textContent = result.join("")
    })

    infoTable.addEventListener("click", (event) => {
        const equipButton = event.target.closest(".table-equip-button")
        const tableCell = event.target.closest(".table-cell")

        if (equipButton !== null) {
            equipButton.classList.add("clicked")

            const znNumber = equipButton.closest(".row-content").dataset.znNumber
            Cookie.set("znNumber", znNumber)

            setTimeout(() => {
                window.location.href = "third_page.html"

                setTimeout(() => {
                    equipButton.classList.remove("clicked")
                }, 100)
            }, 500)
        } else if (tableCell !== null) {
            const rowContent = tableCell.closest(".row-content")
            const addDataWrapper = rowContent.querySelector(".add-data-wrapper")
            const addData = addDataWrapper.querySelector(".add-data")

            if (addDataWrapper.classList.contains("opened")) {
                addDataWrapper.classList.remove("opened")
                addDataWrapper.style.height = '0'
            } else {
                addDataWrapper.classList.add("opened")
                addDataWrapper.style.height = pxToRem(addData.offsetHeight) + "rem"
            }
        }
    })
}

async function initSSE() {
    sseSource = new SmartSSESource("second_page", MY_UUID)
    sseSource.reconnectAddInfo = {post: post}

    await sseSource.subServerEvents({post: post})

    function handleCarChanges(carChanges) {
        for (const carChange of carChanges) {
            const { type, data } = carChange

            if (type === "create" || type === "update") {
                znsData.update(
                    { car: data },
                    { "car_vin": data["vin"] },
                )
            } else if (type === "delete") {
                znsData.delete(
                    { "car_vin": data["vin"] },
                )
            }
        }
    }

    function handleZNChanges(znChanges) {
        for (const znChange of znChanges) {
            const { type, data } = znChange

            if (type === "create") {
                znsData.create(data)
            } else if (type === "update") {
                const number = data.number
                delete data.number

                znsData.update(
                    data,
                    { number: number },
                    1
                )
            } else if (type === "delete") {
                znsData.delete(
                    { number: data.number },
                    1
                )
            }
        }
    }

    function handlePostsChanges(postsChanges) {
        for (const postChange of postsChanges) {
            const { type, data } = postChange

            if (type === "create" || type === "update") {
                const forUpdate = {}
                if (data.date1) forUpdate.date1 = data.date1
                if (data.date1) forUpdate.date1 = data.date1

                znsData.update(
                    forUpdate,
                    { post_uuid: data.uuid },
                    1
                )
            } else {
                znsData.delete(
                    { post_uuid: data.uuid },
                    1
                )
            }
        }
    }

    sseSource.addSSEEvent("zn", (info) => {
        handleZNChanges(info)
		return "zns"
    })

    sseSource.addSSEEvent("car", (info) => {
        handleCarChanges(info)
		return "zns"
    })

    sseSource.addSSEEvent("posts", (info) => {
        handlePostsChanges(info)
		return "zns"
    })

    sseSource.addRecoverHandler("zns", (
        {
            zn_changes,
            car_changes,
            posts_changes,
        }
    ) => {
        handleZNChanges(zn_changes)
        handleCarChanges(car_changes)
        handlePostsChanges(posts_changes)

        znsData.orderBy("date1", true)
    })

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}


start()