const infoTable = document.querySelector(".info-table")
const infoTableContent = infoTable.querySelector(".table-content")
const postNumbers = infoTable.querySelectorAll(".table-cell.number p")


async function start() {
    initEscapeButton()
    updateUserSelect()
    setLoading()

    if (!await init()) {
        createNotification("error", "Ошибка загрузки страницы")
    }

    clearLoading()
}


async function init() {
    const table = await updateTable()
    if (!table) {
        return false
    }
    initEvents()

    return true
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


async function updateTable() {
    const post = Cookie.get("post")

    if (!post) return

    return await getSmth(
        `info/zns/${post}`,
        "GET",
        (data) => {
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

            infoTableContent.innerHTML = ""
            const rowContent = document.createElement("div")
            rowContent.className = "row-content"

            for (const row of data) {
                const clone = rowContent.cloneNode(true)
                clone.dataset.znNumber = row.number

                clone.append(
                    constructCell(`${createReadableDate(row.date1)}<br>${createReadableDate(row.date2)}`, "time"),
                    constructCell(row.number, "number"),
                    constructCarCell(row.car),
                    constructTaskEquip()
                )

                const addData = constructAddData(row)
                const nothing = document.createElement("div")

                clone.append(addData, nothing)

                infoTableContent.append(clone)
            }
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

    tableEquipButton.innerHTML = SVG.arrowRight

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
        constructCarCellCarCell(model.win, "win"),
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

function initEscapeButton() {
    const escapeButton = document.querySelector(".escape")

    escapeButton.addEventListener("click", () => {
        window.location.href = "first_page.html"
    })
}


start()