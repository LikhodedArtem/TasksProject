initEscapeButton("second_page.html")


let mechanic = null
let znNumber = null
let post = null

let canChange = false

function cantChange() {
    createNotification("warning", "Начните работу для изменений")
}

const packagesPanel = document.querySelector(".packages-panel")
const packages = packagesPanel.querySelectorAll(".package")

const worksTable = packagesPanel.querySelector(".info-table.works")
const worksTableValue = worksTable.querySelector(".table-content")
const detailsTable = packagesPanel.querySelector(".info-table.details")
const detailsTableValue = detailsTable.querySelector(".table-content")

const headerPinFiles = document.querySelector("#headerPinFiles")
const recPinFiles = document.querySelector("#recPinFiles")

const recApply = document.querySelector("#recApply")
const recArea = document.querySelector("#recArea")
const recInput = document.querySelector("#recInput")

const reasonArea = document.querySelector("#reasonArea")

const jobs = document.querySelector("#jobs")
const parts = document.querySelector("#parts")

const checklistCounter = constructChecklistCounter()


const jobsData = new SmartContainer()
const partsData = new SmartContainer()


let znHasOwnFiles = false

const CLOSE_SECONDS = 10

let sseSource = null


startRequestsCount = 4


async function start() {
    post = Cookie.get("post")
    znNumber = Cookie.get("znNumber")
    mechanic = Cookie.get("mechanic")

    if (!mechanic || !znNumber || !post) {
        window.location.href = "first_page.html"
        return
    }

    initPackagesEvents()
    initMakeTasks()
    initChecklistButton()
    initChecklistCounter()

    setLoading()

    initStart()
}

async function initStart() {
    await initSSE()

    await getZnInfo()
    await uploadJobsTable()
    await uploadPartsTable()
    await updateZNStatus()
}

function initEnd(){
    initStartZN()

    initCustomPinFiles()
    initRecommendation()

    clearLoading()
}

function initChecklistCounter() {
    const oldCounter = document.querySelector('.checklist-counter')
    oldCounter.parentNode.prepend(checklistCounter)
    oldCounter.parentNode.removeChild(oldCounter)
}

async function getZnInfo() {
    await requestManager.send(
        `info/zn`,
        "POST",
        {
            data: {zn_number: znNumber},
            okFunc: (data) => {
                doneStartRequest("zn", data, (data) => {
                    updateAllZnInfo(data)
                })
            },
            isStart: true,
        }
    )
}

function hasFiles(pinFiles) {
    if (!pinFiles.classList.contains("has-files")) {
        pinFiles.classList.add("has-files")
    }
    headerPinFiles.classList.add("has-files")
}

function hasNotFiles(pinFiles) {
    if (pinFiles.classList.contains("has-files")) {
        pinFiles.classList.remove("has-files")
        if (pinFiles !== headerPinFiles) updateHeaderPinFiles()
    }
}

function updateHeaderPinFiles() {
    if (
        !znHasOwnFiles
        && !checkHasFiles(recPinFiles)
        && jobsData.select({ hasFiles: true }, null, 1).length === 0
        && partsData.select({ hasFiles: true }, null, 1).length === 0
    ) {
        hasNotFiles(headerPinFiles)
    }
}

const znNumberText = document.querySelector("#znNumber span")
const znDateText = document.querySelector("#date span")
const znManagerText = document.querySelector("#manager span")
const znAssistantText = document.querySelector("#assistant span")

const carVinText = document.querySelector("#vin span")
const carReg = document.querySelector("#reg")
const carModelText = document.querySelector("#model span")
const carYearText = document.querySelector("#year span")
const carMillageText = document.querySelector("#millage span")


function updateZnInfo({ number, date, manager, assistant, reason, recommendation}) {
    if (number) znNumberText.textContent = number
    if (date) znDateText.textContent = createReadableDate(Number(date))
    if (manager) znManagerText.textContent = manager
    if (assistant) znAssistantText.textContent = assistant
    if (reason) {
        reasonArea.disabled = true
        reasonArea.value = reason
    }
    if (recommendation) {
        recArea.disabled = true
        recArea.value = recommendation
    }
}

function updateCarReg(reg) {
    carReg.replaceChild(beautyReg(reg), carReg.querySelector("span"))
}

function updateCarInfo({ vin, reg, model, year, millage }) {
    if (vin) carVinText.textContent = vin
    if (reg) updateCarReg(reg)
    if (model) carModelText.textContent = model
    if (year) carYearText.textContent = `${year}г.`
    if (millage !== null) carMillageText.textContent = `${millage}${millage !== 0 ? "км." : ""}`
}

function updateChecklistCounter({ red, yellow, green, gray }) {
    checklistCounter.red.set(red)
    checklistCounter.yellow.set(yellow)
    checklistCounter.green.set(green)
    checklistCounter.gray.set(gray)
}

async function updateAllZnInfo(data) {
    if (data.zn_has_own_files) {
        hasFiles(headerPinFiles)
        znHasOwnFiles = true
    }


    if (data.rec_has_files) {
        hasFiles(recPinFiles)
    }

    if (data.checklist) {
        updateChecklistCounter(data.checklist)
    }

    updateZnInfo({
        number: data.number,
        date: data.date,
        manager: data.manager,
        assistant: data.assistant,
        reason: data.reason,
        recommendation: data.recommendation,
    })

    updateCarInfo(data.car)
}


function closePackageForever(el, addClass) {
    const packageP = el.closest(".package-wrapper").querySelector(".package")
    packageP.classList.add("close-forever", addClass)
    removePackageRightPanel(packageP)
}



function renderData(smartData, tableValue, renderRow, removeChanges) {
    const data = smartData.data()

    if (data.length === 0) {
        closePackageForever(tableValue, "empty")
        return
    }

    tableValue.innerHTML = ""

    let count = 1

    let forObserve = 0

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return
            }

            const rowEl = entry.target
            const rowContent = rowEl.closest(".row-content")

            smartData.update(
                { checked: true },
                { uuid: rowContent.dataset.uuid },
                1
            )

            tableValue.changeCounterSub()

            observer.unobserve(rowEl)
        })
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
    })

    for (const row of data) {
        const rowObj = renderRowWrapper(
            renderRow(row, count),
            row.done,
            row.uuid,
            row.hasFiles,
            row.change,
        )

        if (row.change && !row.checked) {
            observer.observe(Array.from(rowObj.children)[0])
            forObserve++
        }

        tableValue.append(
            rowObj
        )

        count++
    }

	try { tableValue.changeCounterSet(forObserve) } catch(e) {console.error(e) }
    
    tableValue.updateDoneAll()
}

function renderRowWrapper(cells, done, uuid, isHasFiles, change) {
    const rowWrapper = document.createElement("div")
    rowWrapper.className = "row-content"
    rowWrapper.dataset.uuid = uuid

    if (done) rowWrapper.classList.add("yes")

    rowWrapper.append(...cells)

    if (isHasFiles) hasFiles(rowWrapper.querySelector(".pin-files"))
    if (change) rowWrapper.querySelector(".table-cell.number").classList.add(change)

    return rowWrapper
}


function renderWorksRow(row, indx) {
    return [
        constructCell(indx, "number"),
        constructCell(row.name, "work-content"),
        constructCell(row.number, "work-count"),
        constructCell(row.normalTime, "n-ch"),
        constructPinFiles()
    ]
}

function renderDetailsRow(row, indx) {
    return [
        constructCell(indx, "number"),
        constructCell(row.name, "detail-name"),
        constructCell(row.manufacturerCode, "prod-code"),
        constructCell(row.manufacturer, "prod"),
        constructCell(row.quantity, "count"),
        constructCell(row.units, "unit"),
        constructPinFiles()
    ]
}


async function uploadJobsTable() {
    return await uploadTable(
        "jobs",
        {zn_number: znNumber},
        (data) => {
            jobsData.replace(data)
            updateJobsTable()
        },
        () => {
            jobs.querySelector(".package").className = "package close-forever empty"
        }
    )
}

async function uploadPartsTable() {
    return await uploadTable(
        "parts",
        {zn_number: znNumber},
        (data) => {
            partsData.replace(data)
            updatePartsTable()
        },
    )
}

async function uploadTable(type, data, onOk) {
    return await requestManager.send(
        `/info/${type}`,
        "POST",
        {
            data: data,
            okFunc: (data) => {
                doneStartRequest(type, data, (data) => {
                    onOk(data)
                })
            },
            isStart: true,
        }
    )
}

async function updateJobsTable() {
    renderData(jobsData, worksTableValue, renderWorksRow)
}

async function updatePartsTable() {
    renderData(partsData, detailsTableValue, renderDetailsRow)
}

function removePackageRightPanel(packageP) {
    const panel = packageP.querySelector(".right-panel")
    if (panel) packageP.removeChild(panel)
}


function constructPinFiles() {
    const pinFiles = document.createElement("div")
    pinFiles.className = "pin-files"

    const pinFilesIcon = document.createElement("button")
    pinFilesIcon.className = "pin-files-icon"
    pinFilesIcon.innerHTML = SVG.pin

    pinFiles.append(pinFilesIcon)

    return pinFiles
}


async function sendDone(uuid, type, value, all) {
    const requestData = {
        mechanic: mechanic,
        post: post,
        zn_number: znNumber,
        type: type,
        new_value: value,
        uuid: uuid,
    }

    requestManager.send(
        `info/done${(all) ? "/all" : ""}`,
        "POST",
        {
            data: requestData,
            changeUUID: true,
        }
    )
}


function initCustomPinFiles() {
    headerPinFiles.addEventListener("click", () => {
        createPinFilesPanel("zn")
    })
}


function initPackagesEvents() {
    packages.forEach((packageP) => {
        if (packageP.classList.contains("close-forever")) {
            return
        }

        const wrapper = packageP.closest(".package-wrapper")
        const valueWrapper = wrapper.querySelector(".package-value-wrapper")
        const value = valueWrapper.querySelector(".package-value")
        const tableContent = wrapper.querySelector(".table-content")

        value.style.height = pxToRem(value.scrollHeight) + 'rem'

        function openPackage() {
            packageP.classList.add("opened")
            valueWrapper.classList.add("opened")
            valueWrapper.style.height = pxToRem(value.scrollHeight) + 'rem'
        }

        function closePackage() {
            packageP.classList.remove("opened")
            valueWrapper.classList.remove("opened")
            valueWrapper.style.height = '0'
        }

        let closeTimer

        function createCloseTimer() {
            closeTimer = setTimeout(() => {
                closePackage()
            }, CLOSE_SECONDS * 1000)
        }

        const doneAll = packageP.querySelector(".select-all .checkbox")
        const changeCounter = packageP.querySelector(".change-counter")
        const changeCounterInner = packageP.querySelector(".change-counter span")

        let rowContents = value.querySelectorAll(".row-content")

        function refreshRowContents() {
            rowContents = value.querySelectorAll(".row-content")
        }

        function updateDoneAll() {
            refreshRowContents()
            let allFlag = true

            for (const rowContent of rowContents) {
                if (!rowContent.classList.contains("yes")) {
                    allFlag = false
                    break
                }
            }

            allFlag ? yesCheckbox(doneAll) : noCheckbox(doneAll)
        }

        if (doneAll) updateDoneAll()

        value.addEventListener("dblclick", async (event) => {
            if (!canChange) {
                cantChange()
                return
            }

            const tableCell = event.target.closest(".table-cell")
            if (!tableCell) return
            const rowContent = tableCell.closest(".row-content")

            const uuid = rowContent.dataset.uuid
            const type = (rowContent.closest(".info-table").classList.contains("details"))
                ? "parts"
                : "jobs"
            const value = !rowContent.classList.contains("yes")

            await sendDone(
                uuid,
                type,
                value,
                false
            )

            const data = type === "jobs" ? jobsData : partsData

            if(!data.update(
                {done: value},
                {uuid: uuid},
                1,
            ).length) {
                createNotification("error", "Ошибка обновления данных на странице")
                return
            }

            if (rowContent.classList.contains("yes")) {
                rowContent.classList.remove("yes")
                noCheckbox(doneAll)
            } else {
                rowContent.classList.add("yes")
                updateDoneAll()
            }
        })

        value.addEventListener("click", (event) => {
            const pinFilesIcon = event.target.closest(".pin-files-icon")
            if (!pinFilesIcon) return

            const rowContent = pinFilesIcon.closest(".row-content")
            const type = pinFilesIcon.closest(".package-wrapper").id

            createPinFilesPanel(type, rowContent)
        })

        packageP.addEventListener("click", async (event) => {
            const pinPackage = event.target.closest(".pin .pin-package")
            const finDoneAll = event.target.closest(".select-all .checkbox")

            if (pinPackage !== null) {
                if (pinPackage.classList.contains("clicked")) {
                    pinPackage.classList.remove("clicked")
                    if (packageP.classList.contains("opened")) {
                        closePackage()
                    }
                } else {
                    pinPackage.classList.add("clicked")
                    clearTimeout(closeTimer)
                }
            } else if (finDoneAll !== null) {
                if (!canChange) {
                    cantChange()
                    return
                }

                const type = (packageP.closest(".package-wrapper").querySelector(".info-table").classList.contains("details"))
                    ? "parts"
                    : "jobs"

                async function rowContentUpdate(func) {
                    const uuids = []
                    const value = !doneAll.classList.contains("yes")
                    refreshRowContents()

                    for (const rowContent of rowContents) {
                        uuids.push(rowContent.dataset.uuid)
                    }

                    if (!uuids.length) return

                     await sendDone(
                        uuids,
                        type,
                        value,
                        true
                    )

                    const data = type === "jobs" ? jobsData : partsData

                    data.update({done: value})

                    for (const rowContent of rowContents) {
                        func(rowContent)
                    }

                    return true
                }

                if (!doneAll.classList.contains("yes")) {
                    const result = await rowContentUpdate((rowContent) => {rowContent.classList.add("yes")})
                    if (result) {
                        yesCheckbox(doneAll)
                    }
                } else {
                    const result = await rowContentUpdate((rowContent) => {rowContent.classList.remove("yes")})
                    if (result) {
                        noCheckbox(doneAll)
                    }
                }
            } else {
                const findPinPackage = packageP.querySelector(".pin .pin-package")

                if (valueWrapper.classList.contains("opened")) {
                    closePackage()
                    clearTimeout(closeTimer)
                } else {
                    openPackage()

                    if (findPinPackage !== null && !findPinPackage.classList.contains("clicked")) {
                        createCloseTimer()
                    }
                }
            }
        })

        // Outer API

        function oneRowDone(done, index) {
            const row = Array.from(tableContent.children)[index]

            if (done) {
                row.classList.add("yes")
                updateDoneAll()
            } else {
                row.classList.remove("yes")
                noCheckbox(doneAll)
            }
        }

        function changeCounterSet(newNum) {
            if (!changeCounterInner || newNum === 0) return
			// body.innerHTML += `<span>${newNum} ||| ${changeCounterInner}</span>`
            changeCounter.classList.remove("hide")
            changeCounterInner.textContent = newNum
        }

        function changeCounterSub() {
            if (!changeCounterInner || changeCounterInner.textContent === "0") return
			// body.innerHTML += `<span>${changeCounterInner}, ${changeCounterInner.textContent}</span>`

            changeCounterInner.textContent = Number(changeCounterInner.textContent) - 1

            if (changeCounterInner.textContent === "0") {
                changeCounter.classList.add("hide")
            }
        }

        wrapper.oneRowDone = oneRowDone
        if (tableContent) {
            tableContent.changeCounterSet = changeCounterSet
            tableContent.changeCounterSub = changeCounterSub
            tableContent.updateDoneAll = updateDoneAll
        }
    })
}

let fileSaveAdd = null
let fileSaveRender = null

function yesCheckbox(checkBox) {
    if (checkBox.classList.contains("disabled")) return

    checkBox.classList.remove("no")
    checkBox.classList.add("yes")
}

function noCheckbox(checkBox) {
    if (checkBox.classList.contains("disabled")) return

    if (checkBox.classList.contains("yes")) {
        checkBox.classList.add("no")
        checkBox.classList.remove("yes")
    }
}


function initRecommendation() {
    recApply.addEventListener("click", async () => {
        if (!canChange) {
            cantChange()
            return
        }

        let addData = recInput.value.trim()
		if (!addData) return
		
        const currentData = recArea.value
		
		if (currentData && currentData.slice(currentData.length - 1) !== "\n") {
			addData = "\n" + addData
		}
		
		const newData = currentData + addData

        requestManager.send(
            "info/rec",
            "POST",
            {
                data: {
                    rec: newData,
                    zn_number: znNumber,
                },
                changeUUID: true,
            }
        )

        recArea.value = newData
        recInput.value = ""
    })
}


const startZn = document.querySelector(".start-zn")
const headerButtonsWrapper = startZn.closest(".header-buttons-wrapper")

const pauseButton = headerButtonsWrapper.querySelector(".pause-button")
const stopButton = headerButtonsWrapper.querySelector(".stop-button")


function setStartStatus() {
    startZn.classList.remove("clicked")

    pauseButton.style.pointerEvents = "none"
    pauseButton.style.opacity = 0
    stopButton.style.pointerEvents = "none"
    stopButton.style.opacity = 0

    canChange = false
    recInput.disabled = true
}


function setUnStartStatus() {
    startZn.classList.add("clicked")

    setUnPausedStatus()
    setUnStoppedStatus()

	stopButton.classList.remove("clicked")

    pauseButton.style.pointerEvents = "all"
    pauseButton.style.opacity = 1
    stopButton.style.pointerEvents = "all"
    stopButton.style.opacity = 1

    canChange = true
    recInput.disabled = false
}

function setPausedStatus() {
	pauseButton.classList.add("clicked")
    canChange = false
}

function setUnPausedStatus() {
    pauseButton.classList.remove("clicked")
    canChange = true
}

function setStoppedStatus() {
	stopButton.classList.add("clicked")
    canChange = false
}

function setUnStoppedStatus() {
    stopButton.classList.remove("clicked")
    canChange = true
}

function initStartZN() {
	async function setStatus(status, func) {
        setLoading()
 
        await sendStatus(status, func)

        clearLoading()
    }
	
    startZn.addEventListener("click", async () => { await setStatus("start", setUnStartStatus) })
    pauseButton.addEventListener("click", async () => {
        if (pauseButton.classList.contains("clicked")) {
            await setStatus("start", setUnStartStatus)
        } else {
            await setStatus("paused", () => {
                setUnStartStatus()
                setPausedStatus ()
            })
        }
    })
    stopButton.addEventListener("click", async () => {
        if (stopButton.classList.contains("clicked")) {
            await setStatus("start", setUnStartStatus)
        } else {
            await setStatus("stopped", () => {
                setUnStartStatus()
                setStoppedStatus()
            })
        }
    })

    async function sendStatus(status, onOk) {
        onOk()
        requestManager.send(
            "info/status/set",
            "POST",
            {
                data: {
                    zn_number: znNumber,
                    post: post,
                    mechanic: mechanic,
                    status: status
                },
                changeUUID: true,
            }
        )
    }
}


function setStatus(status) {
    if (status === "never") {
        setStartStatus()
    } else if (status === "start") {
        setUnStartStatus()
    } else if (status === "stopped") {
        setUnStartStatus()
        setStoppedStatus()
    } else if (status === "paused") {
        setUnStartStatus()
        setPausedStatus()
    } else {
        console.error(`Get wrong status: ${status}`)
    }
}


async function updateZNStatus() {
    return await requestManager.send(
        "info/status/get",
        "POST",
        {
           data: {
                zn_number: znNumber,
                post: post,
            },
            okFunc: (result) => {
               doneStartRequest("status", result, (data) => {
                    setStatus(data)
                })
            },
            isStart: true,
        }
    )
}


async function initSSE() {
    sseSource = new SmartSSESource("third_page", MY_UUID)
    sseSource.reconnectAddInfo = {
        zn_number: znNumber,
        post: post,
    }

    function handleDone(jobs, doneChanges) {
        let smartData

        if (jobs) {
            smartData = jobsData
        } else {
            smartData = partsData
        }

        let any = false

        for (const data of doneChanges) {
            if(!smartData.update(
                {done: data.value},
                {uuid: data.identicalStr},
                1
            ).length) {
                createNotification("error", "Ошибка в полученных данных")
                console.error(`Not found: identical_str=${data.identicalStr}`)
            }
            any = true
        }

        return any
    }

    function handleZnItems(jobs, mainChanges) {
        let smartData

        if (jobs) {
            smartData = jobsData
        } else {
            smartData = partsData
        }

        let any = false

        for (const change of mainChanges) {
            const { type, data } = change

            data.change = type
            data.checked = false

            if (type === "create") {
				if (smartData.select({uuid: data.uuid}).length !== 0) continue
				
                smartData.create(data)
            } else if (type === "update") {
                const uuid = data.uuid
                delete data.uuid

                smartData.update(
                    data,
                    { uuid: uuid },
                    1,
                )
            } else {
                smartData.delete(
                    { uuid: data.uuid },
                    1
                )
            }

            any = true
        }
        return any
    }

    function handleCar(carChanges) {
        if (carChanges && carChanges.length !== 0) {
            const {type, data} = carChanges[0]

            if (type === "delete") {
                setClosePage()
                return
            }

            if (type === "update") {
                updateCarInfo(data)
            }
        }
    }

    function handleZn(znChanges) {
        if (znChanges && znChanges.length !== 0) {
            const { type, data } = znChanges[0]

            if (type === "delete") {
                setClosePage()
                return
            }

            if (type === "update") {
                updateZnInfo(data)
            }
        }
    }


    // car_changes: list[dict[str, Any]], zn_changes: list[dict[str, Any]]
    sseSource.addRecoverHandler("zn", ({ car_changes, zn_changes, checklist }) => {
        handleCar(car_changes)
        handleZn(zn_changes)
        updateChecklistCounter(checklist)
    })
    sseSource.addSSEEvent("zn", (changes) => {
        handleZn(changes)
		return "zn"
    })
    sseSource.addSSEEvent("car", (changes) => {
        handleCar(changes)
		return "zn"
    })


    // done_changes: list[dict[str, Any]], main_changes: list[dict[str, Any]]
    sseSource.addRecoverHandler("jobs", ({ done_changes, main_changes }) => {
		if (handleZnItems(true, main_changes)
            || handleDone(true, done_changes))

        updateJobsTable()
    })
    sseSource.addSSEEvent("jobs", (changes) => {
        if (handleZnItems(true, changes)) updateJobsTable()
		return "jobs"
	})


    // done_changes: list[dict[str, Any]], main_changes: list[dict[str, Any]]
    sseSource.addRecoverHandler("parts", ({ done_changes, main_changes }) => {
        if (handleZnItems(false, main_changes)
            || handleDone(false, done_changes)) updatePartsTable()
    })
    sseSource.addSSEEvent("parts", (changes) => {
        if (handleZnItems(false, changes)) updatePartsTable()
		return "parts"
    })


    // status: str | None
    // sseSource.addRecoverHandler("status", ({ status }) => {
    //     if (status === null) return

    //     setStatus(status)
    // })

    // type: str, uuid: str, new_value: bool
    sseSource.addSSEEvent("done", ({ type, uuid, new_value }) => {
        const data = type === "jobs" ? jobsData : partsData
        const packageWrapper =  type === "jobs" ? jobs : parts

        const indexes = data.update(
            {done: new_value},
            {uuid: uuid},
            1
        )

        if (indexes.length) {
            packageWrapper.oneRowDone(new_value, indexes[0])
        }

        return type
    })

    // type: str, new_value: bool, uuids: list[str]
    sseSource.addSSEEvent("done_all", ({ type, uuids, new_value }) => {
        const data = type === "jobs" ? jobsData : partsData
        const packageWrapper = type === "jobs" ? jobs : parts

        for (const uuid of uuids) {
            const indexes = data.update(
                {done: new_value},
                {uuid: uuid},
                1
            )

            if (indexes.length) {
                 packageWrapper.oneRowDone(new_value, indexes[0])
            }
        }

        return type
    })

    // type: str, identical_str: str | None, has_files: bool
    sseSource.addSSEEvent("has_files", ({ type, identical_str, has_files }) => {
        console.log("has_files")

        let pinFiles

        if (type === "zn") {
            pinFiles = headerPinFiles
            znHasOwnFiles = has_files
        } else if (type === "rec") {
            pinFiles = recPinFiles
        } else {
            const data = type === "jobs" ? jobsData : partsData
            const packageWrapper = type === "jobs" ? jobs : parts

            const result = data.update(
                {has_files: has_files},
                {uuid: identical_str},
                1
            )

            if (!result.length) {
                createNotification("error", "Ошибка обновления данных на странице")
                throw Error("Wrong result")
            }

            pinFiles = Array.from(packageWrapper.querySelectorAll(".pin-files"))[result[0]]
        }

        has_files
            ? pinFiles.classList.add("has-files")
            : pinFiles.classList.remove("has-files")

        return type === "zn" || type === "rec" ? "zn" : type
    })

    // status: str
    sseSource.addSSEEvent("status", ({ status, post_name }) => {
        if (post_name !== post || status === null) return
        setStatus(status)
        return "status"
    })

    // rec: str
    sseSource.addSSEEvent("rec", ({ rec }) => {
        recArea.value = rec
        return "zn"
    })

    await sseSource.subServerEvents({"zn": znNumber})

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}

function initMakeTasks() {
    const tasksButtons = document.querySelectorAll(".borderus .pin-files-icon")

    tasksButtons.forEach((tasksButton) => {
        tasksButton.addEventListener("click", () => {
            const borderus = tasksButton.closest(".borderus")
            const position = borderus.querySelector("label").textContent
            const name = borderus.querySelector("span").textContent
            const carVin = document.querySelector("#vin span").textContent

            Cookie.set("position", position)
            Cookie.set("name", name)
            Cookie.set("carVin", carVin)

            window.location.href = "fourth_page.html"
        })
    })
}

function initChecklistButton() {
    const checklistButton = document.querySelector("#checklistButton")

    checklistButton.addEventListener("click", () => {
        checklistButton.classList.add("clicked")

        setTimeout(() => {
            window.location.href = "fifth_page.html"
            setTimeout(() => {
                checklistButton.classList.remove("clicked")
            }, 100)
        }, 500)
    })
}

start()