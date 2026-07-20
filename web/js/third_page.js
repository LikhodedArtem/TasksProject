class RecurringTimer {
    constructor(callback, delay) {
        this.callback = callback
        this.delay = delay
        this.remaining = delay
        this.timerId = null
        this.startTime = null
        this.running = false
    }

    resume() {
        if (this.running) return

        this.running = true
        this.startTime = performance.now();

        this.timerId = setTimeout(() => {
            this.running = false
            this.remaining = this.delay
            this.callback()
            this.resume()
        }, this.remaining)
    }

    pause() {
        if (!this.running) return

        clearTimeout(this.timerId)
        this.remaining -= performance.now() - this.startTime
        this.running = false
    }

    stop() {
        clearTimeout(this.timerId)
        this.timerId = null
        this.remaining = this.delay
        this.running = false
    }
}

let canChange = false

function cantChange() {
    createNotification("error", "Начните работу для изменений")
}

const packagesPanel = document.querySelector(".packages-panel")
const packages = packagesPanel.querySelectorAll(".package")

const worksTable = packagesPanel.querySelector(".info-table.works")
const worksTableValue = worksTable.querySelector(".table-content")
const detailsTable = packagesPanel.querySelector(".info-table.details")
const detailsTableValue = detailsTable.querySelector(".table-content")

const tookButton = document.querySelector("#took")

const EXTENSIONS = {
    document: ['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt'],
    picture: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'weba'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz', 'bz2', 'arc']
}

const CLOSE_SECONDS = 30

let sseSource = null

async function start() {
    initEscapeButton()
    setLoading()

    if (!await init()) {
        createNotification("error", "Ошибка загрузки страницы")
    }

    clearLoading()
}

async function init() {
    if (!await getZnInfo()) return false

    if (!await updateWorksTable()) return false

    if (!await updateDetailsTable()) return false

    initStartZN()
    if (!await updateZNStatus()) return false

    initPackagesEvents()
    initTookButton()
    initZNPinFiles()
    initRecommendation()

    return true
}

async function getZnInfo() {
    const znNumber = Cookie.get("znNumber")
    if (!znNumber) return false

    return await getSmth(
        `info/zn/${znNumber}`,
        "GET",
        (data) => {
            updateZnInfo(data)
        }
    )
}

async function updateZnInfo(data) {
    document.querySelector("#znNumber span").textContent = data.number
    const reg = document.querySelector("#reg")
    reg.replaceChild(beautyReg(data.car.reg), reg.querySelector("span"))

    const znList = ["date", "manager", "assistant"]
    const carList = ["win", "model", "year", "millage"]

    for(const u of znList) {
        let text = data[u]

        if (u === "date") {
            text = createReadableDate(Number(text))
        }

        document.querySelector(`#${u} span`).textContent = text
    }

    for(const u of carList) {
        let text = data.car[u]

        if (u === "millage") {
            text += "км."
        } else if (u === "year") {
            text += "г."
        }

        document.querySelector(`#${u} span`).textContent = text
    }

    const reasonArea = document.querySelector("#reasonArea")
    const recArea = document.querySelector("#recArea")
    reasonArea.disabled = true
    reasonArea.value = data.reason

    recArea.disabled = true
    recArea.value = data.recommendation
}


async function updateTable(url, tableValue, renderRow) {
    return await getSmth(
        `${url}`,
        "GET",
        (data) => {
            renderData(data, tableValue, renderRow)
        }
    )
}


function closePackageForever(el, addClass) {
    const packageP = el.closest(".package-wrapper").querySelector(".package")
    packageP.classList.add("close-forever", addClass)
    removePackageRightPanel(packageP)
}



function renderData(data, tableValue, renderRow) {
    if (data.length === 0) {
        closePackageForever(tableValue, "empty")
        return
    }

    tableValue.innerHTML = ""

    let count = 1

    for (const row of data) {
        tableValue.append(
            renderRowWrapper(
                renderRow(row, count),
                row.done,
                row.uuid
            )
        )
        count++
    }
}

function renderRowWrapper(cells, done, uuid) {
    const rowWrapper = document.createElement("div")
    rowWrapper.className = "row-content"
    if (done) rowWrapper.classList.add("yes")
    rowWrapper.dataset.uuid = uuid

    rowWrapper.append(...cells)

    return rowWrapper
}


function renderWorksRow(row, indx) {
    return [
        constructCell(indx, "number"),
        constructCell(row.name, "work-content"),
        constructCell(row.normal_time, "n-ch"),
        constructCell(row.normal_time, "work-count"),
        constructPinFiles()
    ]
}

function renderDetailsRow(row, indx) {
    return [
        constructCell(indx, "number"),
        constructCell(row.name, "detail-name"),
        constructCell(row.manufacturer_code, "prod-code"),
        constructCell(row.manufacturer, "prod"),
        constructCell(row.quantity, "count"),
        constructCell(row.units, "unit"),
        constructPinFiles()
    ]
}

async function updateWorksTable() {
    const znNumber = Cookie.get("znNumber")
    if (!znNumber) return false

    return await updateTable(
        `info/jobs/${znNumber}`,
        worksTableValue,
        renderWorksRow
    )
}

async function updateDetailsTable() {
    const znNumber = Cookie.get("znNumber")
    if (!znNumber) return false

    return await updateTable(
        `info/parts/${znNumber}`,
        detailsTableValue,
        renderDetailsRow
    )
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


async function saveDone(uuid, type, value, all) {
    setLoading()

    const done = await sendDone(uuid, type, value, all)

    clearLoading()

    return done
}


async function sendDone(uuid, type, value, all) {
    try {
        const data = Cookie.getGroup([
            "mechanic", "post", "znNumber"
        ])

        if (!data) return

        const result = await sendRequestToServer(
            `info/done${(all) ? "/all" : ""}`,
            "POST",
            {
                by_mechanic: data.mechanic,
                on_post: data.post,
                zn_number: data.znNumber,
                uuid: uuid,
                type: type,
                new_value: value,
            }
        )

        if (result === null) {
            return false
        }

        return true
    } catch (e) {
        console.error(e)
        return false
    }
}


function createPinFilesPanel(type, data) {
    const pinFilesPanelWrapper = document.createElement("div")
    pinFilesPanelWrapper.classList.add("background-blur", "fast")
    pinFilesPanelWrapper.style.zIndex = 101

    const pinFilesPanel = document.createElement("div")
    pinFilesPanel.className = "pin-files-panel"

    const pinFilesPanelHeader = document.createElement("div")
    pinFilesPanelHeader.className = "pin-files-panel-header"

    const pinFilesPanelName = document.createElement("span")
    pinFilesPanelName.className = "pin-files-panel-name"
    pinFilesPanelName.textContent = "Вложения и записи"

    const pinFilesPanelEscape = document.createElement("button")
    pinFilesPanelEscape.className = "pin-files-panel-escape"
    pinFilesPanelEscape.innerHTML = SVG.x

    const pinFilesPanelFooter = document.createElement("div")
    pinFilesPanelFooter.className = "pin-files-panel-footer"

    const pinFilesCellFiles = constructPinFilesCell("files", "Файловый менеджер", type, data)

    const pinFilesCellAudio = constructPinFilesCell("audio", "Запись аудио")

    const pinFilesCellVideo = constructPinFilesCell("video", "Запись видео")

    pinFilesPanelHeader.append(pinFilesPanelName, pinFilesPanelEscape)
    pinFilesPanelFooter.append(pinFilesCellFiles, pinFilesCellAudio, pinFilesCellVideo)

    pinFilesPanel.append(pinFilesPanelHeader, pinFilesPanelFooter)
    pinFilesPanelWrapper.append(pinFilesPanel)

    body.style.overflow = "hidden"
    body.append(pinFilesPanelWrapper)

    pinFilesPanelEscape.addEventListener("click", () => {
        body.style.overflow = "auto"
        body.removeChild(pinFilesPanelWrapper)
    })
}


const headerPinFiles = document.querySelector(".pin-files-icon")


function initZNPinFiles() {
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
        const value = wrapper.querySelector(".package-value")

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
        const rowContents = value.querySelectorAll(".row-content")

        function updateDoneAll() {
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

            const result = await saveDone(uuid, type, value)

            if (!result) {
                createNotification("error", "Нет связи с сервером")
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

            const uuid = pinFilesIcon.closest(".row-content").dataset.uuid
            const type = (pinFilesIcon.closest("#works")) ? "jobs" : "parts"

            createPinFilesPanel(type, { uuid: uuid })
        })

        packageP.addEventListener("click", async (event) => {
            const autoClose = event.target.closest(".auto-close .checkbox")
            const finDoneAll = event.target.closest(".select-all .checkbox")

            if (autoClose !== null) {
                if (!autoClose.classList.contains("yes")) {
                    yesCheckbox(autoClose)
                    createCloseTimer()
                } else {
                    noCheckbox(autoClose)
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

                    for(const rowContent of rowContents) {
                        if (rowContent.classList.contains("yes") !== value) {
                            uuids.push(rowContent.dataset.uuid)
                        }
                    }

                    const done = await saveDone(
                        uuids,
                        type,
                        value,
                        true
                    )

                    if (!done) {
                        createNotification("error", "Нет связи с сервером")
                        return false
                    }

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
                const findAutoClose = packageP.querySelector(".auto-close .checkbox")

                if (valueWrapper.classList.contains("opened")) {
                    closePackage()
                    clearTimeout(closeTimer)
                } else {
                    openPackage()

                    if (findAutoClose !== null && findAutoClose.classList.contains("yes")) {
                        createCloseTimer()
                    }
                }
            }
        })

        const rightPanel = packageP.querySelector(".right-panel")

        if (rightPanel.classList.contains("auto-close")) {
            yesCheckbox(rightPanel.querySelector(".checkbox"))
        }
    })
}

let fileSaveAdd = null
let fileSaveRender = null


function constructPinFilesCell(addClass, name, type, objectData) {
    const pinFilesCell = document.createElement("div")
    pinFilesCell.classList.add("pin-files-cell", addClass)

    const pinFilesCellHeader = document.createElement("div")
    pinFilesCellHeader.className = "pin-files-cell-header"

    const pinFilesCellName = document.createElement("span")
    pinFilesCellName.className = "pin-files-cell-name"
    pinFilesCellName.textContent = name

    const pinFilesCellFooter = document.createElement("div")
    pinFilesCellFooter.className = "pin-files-cell-footer"

    pinFilesCellHeader.append(pinFilesCellName)
    pinFilesCell.append(pinFilesCellHeader, pinFilesCellFooter)

    if (addClass === "files") {
        const pinFilesCellCounter = document.createElement("span")
        pinFilesCellCounter.className = "pin-files-cell-counter"
        pinFilesCellCounter.textContent = 0

        const editPanel = document.createElement("div")
        editPanel.className = "edit-panel"

        const closeButton = document.createElement("button")
        closeButton.className = "close-button"
        closeButton.innerHTML = SVG.x

        const deleteButton = document.createElement("button")
        deleteButton.className = "delete-button"
        deleteButton.innerHTML = SVG.delete

        const downloadButton = document.createElement("button")
        downloadButton.className = "download-button"
        downloadButton.innerHTML = SVG.download

        const clickedCounter = document.createElement("span")
        clickedCounter.className = "clicked-counter"
        clickedCounter.textContent = 1

        const pinFilesDownloading = document.createElement("div")
        pinFilesDownloading.className = "pin-files-downloading"

        const pinFilesDownloadingLine = document.createElement("span")
        pinFilesDownloadingLine.className = "pin-files-downloading-line"

        pinFilesDownloading.append(pinFilesDownloadingLine)

        editPanel.append(closeButton, deleteButton, downloadButton, clickedCounter)
        pinFilesCellHeader.append(editPanel, pinFilesDownloading, pinFilesCellCounter)

        const realInput = document.createElement("input")
        realInput.type = "file"
        realInput.style.display = "none"
        realInput.multiple = true
        realInput._storedFiles = new DataTransfer().files
        realInput._storedUUIDS = []

        let isGetFiles = false

        getFiles()

        function startDownload() {
            pinFilesDownloading.classList.add("active")
        }

        function endDownload() {
            pinFilesDownloading.classList.remove("active")
        }

        async function getFiles() {
            if (isGetFiles) return
            isGetFiles = true

            startDownload()

            const result = await getFilesFromBase()

            if (!result) {
                createNotification("error", "Файлы не были загружены")
            }

            endDownload()
            isGetFiles = false
        }

        async function getFilesFromBase() {
            try {
                const data = {}

                if (type === "zn") {
                    data.identical_str = Cookie.get("znNumber")
                } else {
                    data.identical_str = objectData.uuid
                }

                const response = await fetch(`${API_PATH}/files/get`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(data)
                })

                if (!response.ok) {
                    return false
                }

                const archiveBlob = await response.blob()

                if (archiveBlob.size < 4) {
                    return true
                }

                const zip = await JSZip.loadAsync(archiveBlob)

                const fileEntries = Object.entries(zip.files).filter(([pathInZip, zipEntry]) => {
                    return pathInZip !== "uuids.json" && !zipEntry.dir
                })

                if (fileEntries.length === 0) {
                    return true
                }

                const uuidsFile = zip.file("uuids.json")

                if (!uuidsFile) {
                    return true
                }

                const uuids = JSON.parse(await uuidsFile.async("text"))
                const dataTransfer = new DataTransfer()

                for (const [pathInZip, zipEntry] of fileEntries) {
                    const blob = await zipEntry.async("blob")
                    const name = pathInZip.split("/").at(-1)

                    dataTransfer.items.add(
                        new File([blob], name, {
                            type: blob.type || "application/octet-stream",
                            lastModified: Date.now()
                        })
                    )
                }

                addFilesToInput(dataTransfer.files)
                realInput._storedUUIDS = [
                    ...(uuids.uuids || []),
                    ...realInput._storedUUIDS
                ]

                renderFiles()

                return true
            } catch (e) {
                console.error(e)
                return false
            }
        }

        const filePanelWrapper = document.createElement("div")
        filePanelWrapper.className = "files-panel-wrapper"

        const filePanel = document.createElement("div")
        filePanel.className = "files-panel"

        const pinFilesButton = document.createElement("button")
        pinFilesButton.className = "pin-files-button"
        pinFilesButton.innerHTML = SVG.load

        pinFilesButton.addEventListener("click", () => {
            if (!canChange) {
                cantChange()
                return
            }
            realInput.click()
        })

        pinFilesCellFooter.append(pinFilesButton)

        filePanelWrapper.append(filePanel)
        pinFilesCellFooter.append(realInput, filePanelWrapper)

        realInput.addEventListener("change", async () => {
            if (!canChange) {
                cantChange()
                return
            }

            await fullUploadFiles(realInput.files, realInput._storedFiles)
        })

        let isUploadFiles = false

        async function fullUploadFiles(forUUIDS, forAdd) {
            if (isUploadFiles) return
            isUploadFiles = true

            startDownload()

            const result = await updateUUIDS(forUUIDS)
            if (!result) {
                createNotification("error", "Ошибка отправки данных")
                return
            }

            addFilesToInput(forAdd)
            renderFiles()

            endDownload()

            isUploadFiles = false
        }

        closeButton.addEventListener("click", () => {
            unclickAll()
        })

        let isRemoveFiles = false

        deleteButton.addEventListener("click", async () => {
            if (!canChange) {
                cantChange()
                return
            }

            if (isRemoveFiles) return true
            isRemoveFiles = true

            startDownload()

            const response = await removeFilesFromInput(findClicked())

            if (!response) {
                createNotification("error", "Ошибка отправки данных")
            }

            renderFiles()

            endDownload()

            isRemoveFiles = false
        })

        downloadButton.addEventListener(("click"), () => {
            if (!canChange) {
                cantChange()
                return
            }

            downloadFiles(findClicked())
            unclickAll()
        })

        function findClicked() {
            const indexes = []

            for (const file of Array.from(filePanel.children)) {
                if (file.classList.contains("clicked")) {
                    indexes.push(Number(file.dataset.index))
                }
            }

            return indexes
        }

        filePanel.addEventListener("click", (event) => {
            if (!canChange) {
                cantChange()
                return
            }

            const file = event.target.closest(".file")
            if (!file) return

            if (file.classList.contains("clicked")) {
                file.classList.remove("clicked")
                clickedCounterSub()
            } else {
                file.classList.add("clicked")
                clickedCounterAdd()
            }
        })

        async function updateUUIDS(files) {
            const uuids = await uploadFiles(files, type, objectData)
            if (!uuids) return false

            realInput._storedUUIDS = [...uuids, ...realInput._storedUUIDS]
            return true
        }

        function addFilesToInput(files) {
            const dt = new DataTransfer()

            for (const file of realInput.files) { dt.items.add(file) }
            for (const file of files) { dt.items.add(file) }

            realInput.files = dt.files
            realInput._storedFiles = dt.files
        }

        function renderFiles() {
            filePanel.innerHTML = ""

            let index = 0

            for (const file of realInput.files) {
                filePanel.append(constructFile(file, index))
                index++
            }

            updateCounter(realInput.files.length)
            resetClickedCounter()
        }

        function updateCounter(count) {
            pinFilesCellCounter.textContent = count
        }

        let firstFlag = true

        function clickedCounterAdd() {
            if (firstFlag) {
                editPanel.classList.add("show")
                pinFilesCellName.classList.add("hide")
                firstFlag = false
            } else if (!firstFlag) {
                clickedCounter.textContent = Number(clickedCounter.textContent) + 1
            }
        }

        function clickedCounterSub() {
            if (clickedCounter.textContent === "1") {
                editPanel.classList.remove("show")
                pinFilesCellName.classList.remove("hide")
                firstFlag = true
            }
            if (!firstFlag) {
                clickedCounter.textContent = Number(clickedCounter.textContent) - 1
            }
        }

        function unclickAll() {
            for (const file of Array.from(filePanel.children)) {
                file.classList.remove("clicked")
                resetClickedCounter()
            }
        }

        function resetClickedCounter() {
            firstFlag = true
            clickedCounter.textContent = "1"
            editPanel.classList.remove("show")
            pinFilesCellName.classList.remove("hide")
        }

        async function removeFilesFromInput(indexes) {
            if (!indexes) return false

            const dt = new DataTransfer()
            const saveUUIDS = []
            const deleteUUIDS = []

            for (let indx = 0; indx < realInput.files.length; indx++) {
                if (indexes.indexOf(indx) === -1) {
                    dt.items.add(realInput.files[indx])
                    saveUUIDS.push(realInput._storedUUIDS[indx])
                } else {
                    deleteUUIDS.push(realInput._storedUUIDS[indx])
                }
            }

            const data = Cookie.getGroup([
                "mechanic", "post"
            ])

            if (!data) return false

            const response = await sendRequestToServer(
                "files/delete",
                "POST",
                {
                    uuids: deleteUUIDS,
                    mechanic: data.mechanic,
                    on_post: data.post,
                }
            )

            if (!response) return false

            realInput.files = dt.files
            realInput._storedFiles = dt.files
            realInput._storedUUIDS = saveUUIDS

            return true
        }

        async function downloadFiles(indexes) {
            if (!indexes) return

            let currentIndex = 0

            for (const file of realInput.files) {
                if (indexes.indexOf(currentIndex) !== -1) {
                    const link = document.createElement("a")
                    const url = URL.createObjectURL(file)

                    link.href = url
                    link.download = file.name

                    filePanel.appendChild(link)
                    link.click()
                    filePanel.removeChild(link)

                    URL.revokeObjectURL(url)
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
                currentIndex++
            }
        }

        fileSaveAdd = fullUploadFiles
        fileSaveRender = renderFiles
    }

    if (addClass === "audio" || addClass === "video") {
        let mediaRecorder = null
        let stream = null
        let chunks = []

        let actionAfterStop = null
        let lastRecordedBlob = null
        let lastRecordedUrl = null

        const timer = new RecurringTimer(() => {
            addTimeCounter()
        }, 1000)

        const recordHeader = document.createElement("div")
        recordHeader.className = "record-header"

        const isRecordActive = document.createElement("span")
        isRecordActive.className = "is-record-active"
        isRecordActive.textContent = (addClass === "audio") ? "Микрофон" : "Камера"

        const timeCounter = document.createElement("div")
        timeCounter.className = "time-counter"

        const timeCounterMinutes = document.createElement("div")
        timeCounterMinutes.className = "time-counter-minutes"
        timeCounterMinutes.textContent = "00"

        const timeCounterSeconds = document.createElement("div")
        timeCounterSeconds.className = "time-counter-seconds"
        timeCounterSeconds.textContent = "00"

        const recordFooter = document.createElement("div")
        recordFooter.className = "record-footer"

        const againButton = document.createElement("button")
        againButton.className = "again-button"
        againButton.innerHTML = SVG.again

        const recordButton = document.createElement("button")

        if (addClass === "audio") {
            recordButton.classList.add("record-button-audio", "play")
        } else {
            recordButton.classList.add("record-button-video", "play")
            recordButton.innerHTML = SVG.play
        }

        const addButton = document.createElement("button")
        addButton.className = "add-button"
        addButton.innerHTML = SVG.load

        const recordDisplay = document.createElement("div")
        recordDisplay.className = "record-display"

        const recordValue = document.createElement("div")
        recordValue.className = "record-value"

        timeCounter.append(timeCounterMinutes, timeCounterSeconds)
        recordHeader.append(isRecordActive, timeCounter)

        recordDisplay.append(recordValue)

        recordFooter.append(againButton, recordButton, addButton)

        pinFilesCellFooter.append(recordHeader, recordDisplay, recordFooter)

        async function startRecord() {
            if (!(await startRecording())) return
            timer.resume()
            recordButton.classList.remove("play")
        }

        function stopRecord() {
            timer.pause()
            recordButton.classList.add("play")

            clearCurrentRecordData()
            stopRecorder()
        }

        async function startRecording() {
            try {
                actionAfterStop = null

                await createRecorder()

                mediaRecorder.addEventListener("dataavailable", (event) => {
                    if (event.data && event.data.size > 0) {
                        chunks.push(event.data)
                    }
                })

                mediaRecorder.addEventListener("stop", handleRecordStop, { once: true })

                isRecordActive.classList.add("active")
                return true
            } catch (e) {
                console.error(`Start Recording error: ${e}`)
                console.log(`Error code: ${e.code}`)
                resetRecordPanel()
                deleteRecorder()
                return false
            }
        }

        function handleRecordStop() {
            const mimeType = mediaRecorder?.mimeType || getFallbackMimeType(addClass)
            const hasData = chunks.length > 0

            if (hasData && actionAfterStop !== "reset") {
                const blob = new Blob(chunks, { type: mimeType })
                saveLastBlob(blob)
                addRecordPreview(blob, mimeType)
                addButton.disabled = false
            }

            if (actionAfterStop === "reset") {
                clearCurrentRecordData()
            }

            resetRecordPanel()
            deleteRecorder()
            actionAfterStop = null
        }

        function getSupportedMimeType(kind) {
            const variants = kind === "video"
                ? [
                    "video/webm;codecs=vp9,opus",
                    "video/webm;codecs=vp8,opus",
                    "video/webm"
                ]
                : [
                    "audio/webm;codecs=opus",
                    "audio/webm",
                    "audio/mp4"
                ]

            for (const type of variants) {
                if (MediaRecorder.isTypeSupported(type)) return type
            }

            return ""
        }

        function getFallbackMimeType(kind) {
            return kind === "video" ? "video/webm" : "audio/webm"
        }

        function deleteRecorder() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            stream = null
            mediaRecorder = null
        }

        function stopRecorder() {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop()
                isRecordActive.classList.remove("active")

                deleteRecorder()
            }
        }

        function addRecordPreview(blob) {
            if (recordDisplay.classList.contains("play")) {
                const mediaElement = recordValue.querySelector(addClass === "audio" ? "audio" : "video")
                const oldUrl = mediaElement?.dataset.objectUrl
                const mediaUrl = URL.createObjectURL(blob)

                recordDisplay.classList.remove("updated")
                recordDisplay.classList.add("updated")


                mediaElement.pause()
                mediaElement.currentTime = 0
                mediaElement.src = mediaUrl
                mediaElement.dataset.objectUrl = mediaUrl
                mediaElement.load()

                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl)
                }
            }
            else {
                recordDisplay.classList.add("play")

                recordValue.innerHTML = ""

                const mediaUrl = URL.createObjectURL(blob)
                let mediaElement

                if (addClass === "audio") {
                    mediaElement = document.createElement("audio")
                    mediaElement.controls = true
                } else {
                    mediaElement = document.createElement("video")
                    mediaElement.controls = true
                    mediaElement.playsInline = true
                }

                mediaElement.src = mediaUrl
                mediaElement.preload = "metadata"
                mediaElement.dataset.objectUrl = mediaUrl
                mediaElement.load()

                recordValue.append(mediaElement)
            }
        }

        recordDisplay.addEventListener("animationend", () => {
            recordDisplay.classList.remove("updated")
        })

        function removeRecordPreview() {
            recordDisplay.classList.remove("play")
            recordValue.innerHTML = ""
            lastRecordedBlob = null
            lastRecordedUrl = null
        }

        function saveLastBlob(blob) {
            if (lastRecordedUrl) {
                URL.revokeObjectURL(lastRecordedUrl)
            }

            lastRecordedBlob = blob
            lastRecordedUrl = URL.createObjectURL(blob)
        }

        async function createRecorder() {
            stream = await navigator.mediaDevices.getUserMedia(
                addClass === "audio"
                    ? { audio: true }
                    : { video: true, audio: true }
            )

            const mimeType = getSupportedMimeType(addClass)
            const options = mimeType ? { mimeType } : {}

            mediaRecorder = new MediaRecorder(stream, options)

            mediaRecorder.start()
        }

        function clearCurrentRecordData() {
            chunks = []
        }

        function getExtensionFromBlob(blob) {
            const mimeType = blob.type.split(";")[0]

            const mimeToExt = {
                "audio/webm": "webm",
                "video/webm": "webm",
                "audio/ogg": "ogg",
                "video/ogg": "ogv",
                "audio/mpeg": "mp3",
                "video/mp4": "mp4",
                "audio/mp4": "m4a",
                "audio/wav": "wav"
            }

            return mimeToExt[mimeType] || "bin"
        }

        recordButton.addEventListener("click", () => {
            if (!canChange) {
                cantChange()
                return
            }

            if (recordButton.classList.contains("play")) {
                startRecord()
            } else {
                stopRecord()
            }
        })

        againButton.addEventListener("click", () => {
            if (againButton.classList.contains("rotate")) return

            againButton.classList.add("rotate")

            actionAfterStop = "reset"

            removeRecordPreview()
            stopRecorder()
            resetRecordPanel()
            clearCurrentRecordData()
        })

        againButton.addEventListener("animationend", () => {
            againButton.classList.remove("rotate")
        })

        addButton.addEventListener("click", async () => {
            if (!canChange) {
                cantChange()
                return
            }

            if (addButton.classList.contains("bad-clicked") || addButton.classList.contains("clicked")) return

            if (lastRecordedBlob === null || !recordButton.classList.contains("play")) {
                addButton.classList.add("bad-clicked")
            } else {
                addButton.classList.add("clicked")

                const time = new Date()

                const year = time.getFullYear()
                const month = time.getMonth()
                const date = time.getDate()
                const hour = time.getHours()
                const minutes = time.getMinutes()

                const mechanic = Cookie.get("name")

                const name = `${mechanic} ${addZero(hour)}:${addZero(minutes)} ${addZero(date)}.${addZero(month)}.${year.toString().slice(2)}`
                const extension = getExtensionFromBlob(lastRecordedBlob)
                const fileName = `${name}.${extension}`

                const file = new File (
                    [lastRecordedBlob],
                    `${fileName}`,
                    { type: lastRecordedBlob.type || "application/octet-stream" }
                )

                await fileSaveAdd([file], [file])
                fileSaveRender()

                removeRecordPreview()
                stopRecorder()
                resetRecordPanel()
                clearCurrentRecordData()
            }
        })

        addButton.addEventListener("animationend", () => {
            addButton.classList.remove("bad-clicked")
            addButton.classList.remove("clicked")
        })

        function resetRecordPanel() {
            timer.stop()
            resetTimeCounter()

            recordButton.classList.add("play")
        }

        function addTimeCounter() {
            if (timeCounterSeconds.textContent === "59") {
                timeCounterSeconds.textContent = "00"
                timeCounterMinutes.textContent = addZero(Number(timeCounterMinutes.textContent) + 1)
            } else {
                timeCounterSeconds.textContent =addZero(Number(timeCounterSeconds.textContent) + 1)
            }
        }

        function resetTimeCounter() {
            timeCounterMinutes.textContent = "00"
            timeCounterSeconds.textContent = "00"
        }

        function addZero(num) {
            const string = num.toString()
            if (string.length === 1) return "0" + string
            return string
        }
    }

    return pinFilesCell
}

function constructFile(realFile, index) {
    const file = document.createElement("div")
    file.className = "file"
    file.dataset.index = index

    const fileIcon = constructFileIcon(getFileExtension(realFile))

    const fileInfo = document.createElement("div")
    fileInfo.className = "file-info"

    const fileName = document.createElement("span")
    fileName.className = "file-name"
    fileName.textContent = getFileName(realFile)

    const fileAddInfo = document.createElement("div")
    fileAddInfo.className = "file-add-info"

    const fileExtension = document.createElement("span")
    fileExtension.className = "file-extension"
    fileExtension.textContent = getFileExtension(realFile).toUpperCase()

    const fileWeight = document.createElement("span")
    fileWeight.className = "file-weight"
    fileWeight.innerHTML = constructFileSize(realFile)

    const fileButtons = document.createElement("div")
    fileButtons.className = "file-buttons"

    fileAddInfo.append(fileExtension, fileWeight)
    fileInfo.append(fileName, fileAddInfo)

    file.append(fileIcon, fileInfo, fileButtons)

    return file
}

async function uploadFiles(files, type, objectData) {
    try {
        const formData = new FormData()

        const data = Cookie.getGroup([
            "mechanic", "post", "znNumber"
        ])

        if (!data) return

        formData.append("zn_number", data.znNumber)
        formData.append("type", type)
        formData.append("mechanic", data.mechanic)
        formData.append("on_post", data.post)

        let object
        if (type === "zn") {
            object = "zn"
        } else {
            object = "zn_items"
            formData.append("uuid", objectData.uuid)
        }

        for (const file of files) {
            formData.append("files", file, file.name)
        }

        const response = await fetch(`${API_PATH}/files/${object}/create`, {
            method: "POST",
            credentials: "include",
            body: formData,
        })

        if (!response.ok) {
            console.error(response.status, await response.json())
            return false
        }

        return await response.json()

    } catch (e) {
        console.error(`Upload file Error: ${e}`)
        createNotification("error", "Ошибка отправки данных")
    }
}

function getFileName(file) {
    const dotIndex = file.name.lastIndexOf('.')
    if (dotIndex <= 0) return file.name
    return file.name.slice(0, dotIndex)
}

function getFileExtension(file) {
    const dotIndex = file.name.lastIndexOf('.')
    if (dotIndex <= 0) return '?'
    return file.name.slice(dotIndex + 1).toLowerCase()
}

function constructFileSize(file) {
    const bytes = file.size

    if (!Number.isFinite(bytes) || bytes < 0) return "0 Б"

    const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"]
    let value = bytes
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
    }

    const formatted = value >= 10
        ? Math.round(value)
        : Number(value.toFixed(1))

    return `${formatted} ${units[unitIndex]}`
}

function constructFileIcon(extension) {
    const icon = document.createElement("div")
    icon.className = "file-icon"

    if (EXTENSIONS.document.includes(extension)) {
        icon.innerHTML = SVG.document
    } else if (EXTENSIONS.picture.includes(extension)) {
        icon.innerHTML = SVG.picture
    } else if (EXTENSIONS.video.includes(extension)) {
        icon.innerHTML = SVG.video
    } else if (EXTENSIONS.audio.includes(extension)) {
        icon.innerHTML = SVG.audio
    } else if (EXTENSIONS.archive.includes(extension)) {
        icon.innerHTML = SVG.archive
    } else {
        icon.innerHTML = SVG.document
    }

    return icon
}

function initTookButton() {
    tookButton.addEventListener("click", () => {
        if (tookButton.classList.contains("clicked")) {
            tookButton.classList.remove("clicked")
            tookButton.textContent = "Взять в работу"
        } else {
            tookButton.classList.add("clicked")
            tookButton.textContent = "Взято в работу"
        }
    })
}

function pxToRem(px) {
    const remBase = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return Math.round(px / remBase * 100) / 100
}

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


window.addEventListener("beforeunload", () => {
    if (sseSource) {
        sseSource.close()
    }
})

function initEscapeButton() {
    const escapeButton = document.querySelector(".escape")

    escapeButton.addEventListener("click", () => {
        window.location.href = "../second_page.html"
    })
}


const recApply = document.querySelector("#recApply")
const recArea = document.querySelector("#recArea")
const recInput = document.querySelector("#recInput")


function initRecommendation() {
    recApply.addEventListener("click", async () => {
        if (!canChange) {
            cantChange()
            return
        }
        const formattedData = recInput.value.trim()
        if (!formattedData) return
        let newContent = formattedData + "\n"

        if (formattedData.slice(formattedData.length - 1) !== "\n" && formattedData.length !== 0) {
            newContent = "\n" + newContent
        }

        const znNumber = Cookie.get("znNumber")

        if (!znNumber) return

        const result = await sendRequestToServer(
            "info/rec",
            "POST",
            {
                rec: formattedData + newContent,
                zn_number: znNumber.toString(),
            }
        )

        if (!result) return

        recArea.value += newContent
        recInput.value = ""
    })
}


const startZn = document.querySelector(".start-zn")
const headerButtonsWrapper = startZn.closest(".header-buttons-wrapper")

const pauseButton = headerButtonsWrapper.querySelector(".pause-button")
const stopButton = headerButtonsWrapper.querySelector(".stop-button")


function setPlayStatus() {
    startZn.classList.remove("clicked")

    pauseButton.style.pointerEvents = "none"
    pauseButton.style.opacity = 0
    stopButton.style.pointerEvents = "none"
    stopButton.style.opacity = 0

    canChange = false
    recInput.disabled = true
}


function setUnPlayStatus() {
    startZn.classList.add("clicked")

    pauseButton.style.pointerEvents = "all"
    pauseButton.style.opacity = 1
    stopButton.style.pointerEvents = "all"
    stopButton.style.opacity = 1

    canChange = true
    recInput.disabled = false
}


function initStartZN() {
    startZn.addEventListener("click", async () => {
        setLoading()

        const result = await sendStatus("start")

        if (!result) {
            createNotification("error", "Ошибка отправки данных")
        } else {
            setUnPlayStatus()
        }

        clearLoading()
    })

    pauseButton.addEventListener("click", async () => { await reverse("paused") })
    stopButton.addEventListener("click", async () => { await reverse("stopped") })

    async function reverse(status) {
        setLoading()

        const result = await sendStatus(status)

        if (!result) {
            createNotification("error", "Ошибка отправки данных")
        } else {
            setPlayStatus()
        }

        clearLoading()
    }

    async function sendStatus(status) {
        const data = Cookie.getGroup([
            "mechanic", "post", "znNumber"
        ])

        const result = await sendRequestToServer(
            "info/zn_status/set",
            "POST",
            {
                zn_number: data.znNumber,
                on_post: data.post,
                mechanic: data.mechanic,
                status: status
            }
        )

        if (!result) return false

        return true
    }
}

async function updateZNStatus() {
    const data = Cookie.getGroup([
        "mechanic", "znNumber"
    ])

    if (!data) return

    const result = await sendRequestToServer(
        "info/zn_status/get",
        "POST",
        {
            zn_number: data.znNumber,
            mechanic: data.mechanic,
        }
    )

    if (!result) return false

    if (result === "start") {
        setUnPlayStatus()
    } else if (result === "paused" || result === "stopped") {
        setPlayStatus()
    } else {
        return false
    }

    return true
}

// Единые нотификации
// Единые Cookie
// Единые запросы
// Единые названия create delete remove update upload send
// Нормальные обёртки для start / end loading
// Начало загрузки лишь через время (Единый таймер)
// Надо менять вечные проверки на !result и ему тоже сделать единое название


start()