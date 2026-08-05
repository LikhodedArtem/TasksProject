let mechanic = null
let znNumber = null
let post = null


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
    createNotification("warning", "Начните работу для изменений")
}

const packagesPanel = document.querySelector(".packages-panel")
const packages = packagesPanel.querySelectorAll(".package")

const worksTable = packagesPanel.querySelector(".info-table.works")
const worksTableValue = worksTable.querySelector(".table-content")
const detailsTable = packagesPanel.querySelector(".info-table.details")
const detailsTableValue = detailsTable.querySelector(".table-content")

const tookButton = document.querySelector("#took")

const headerPinFiles = document.querySelector("#headerPinFiles")
let znHasFiles = false
const recPinFiles = document.querySelector("#recPinFiles")

const recApply = document.querySelector("#recApply")
const recArea = document.querySelector("#recArea")
const recInput = document.querySelector("#recInput")

const reasonArea = document.querySelector("#reasonArea")

const jobs = document.querySelector("#jobs")
const parts = document.querySelector("#parts")


const jobsData = new SmartContainer()
const partsData = new SmartContainer()


const EXTENSIONS = {
    document: ['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt'],
    picture: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'weba'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz', 'bz2', 'arc']
}

const CLOSE_SECONDS = 30

let sseSource = null


startRequestsCount = 4


async function start() {
    initEscapeButton()

    post = Cookie.get("post")
    znNumber = Cookie.get("znNumber")
    mechanic = Cookie.get("mechanic")

    if (!mechanic || !znNumber || !post) {
        createNotification("error", "")
        return
    }

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

    initPackagesEvents()
    initTookButton()
    initCustomPinFiles()
    initRecommendation()
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
            }
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
    if (znHasFiles) {
        headerPinFiles.add("has-files")
        return
    }

    const pinsFiles = document.querySelectorAll(".pin-files")

    let hasFiles = false

    for (const pinFiles of Array.from(pinsFiles)) {
        if (pinFiles !== headerPinFiles && pinFiles.classList.contains("has-files")) {
            hasFiles = true
            return
        }
    }

    if (!hasFiles) {
        headerPinFiles.classList.remove("has-files")
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

async function updateAllZnInfo(data) {
    if (data.zn_has_files) {
        hasFiles(headerPinFiles)
        znHasFiles = true
    }


    if (data.rec_has_files) {
        hasFiles(recPinFiles)
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
                row.uuid,
                row.has_files
            )
        )
        count++
    }
}

function renderRowWrapper(cells, done, uuid, isHasFiles) {
    const rowWrapper = document.createElement("div")
    rowWrapper.className = "row-content"
    if (done) rowWrapper.classList.add("yes")
    rowWrapper.dataset.uuid = uuid

    rowWrapper.append(...cells)

    if (isHasFiles) hasFiles(rowWrapper.querySelector(".pin-files"))

    return rowWrapper
}


function renderWorksRow(row, indx) {
    return [
        constructCell(indx, "number"),
        constructCell(row.name, "work-content"),
        constructCell(row.number, "work-count"),
        constructCell(row.normal_time, "n-ch"),
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
            }
        }
    )
}

async function updateJobsTable() {
    renderData(jobsData.data(), worksTableValue, renderWorksRow)
}

async function updatePartsTable() {
    renderData(partsData.data(), detailsTableValue, renderDetailsRow)
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

    await requestManager.send(
        `info/done${(all) ? "/all" : ""}`,
        "POST",
        {
            data: requestData,
            changeUUID: true,
        }
    )
}


function createPinFilesPanel(type, rowContent) {
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

    const pinFilesCellFiles = constructPinFilesCell("files", type, rowContent)

    const pinFilesCellAudio = constructPinFilesCell("audio" )

    const pinFilesCellVideo = constructPinFilesCell("video")

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
        const tableContent = value.querySelector(".table-content")

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

        // function allRowDone(done) {
        //     if (done) {
        //         Array.from(rowContents).forEach((rowContent) => { rowContent.classList.add("yes") })
        //         yesCheckbox(doneAll)
        //     } else {
        //         Array.from(rowContents).forEach((rowContent) => { rowContent.classList.remove("yes") })
        //         noCheckbox(doneAll)
        //     }
        // }
        //
        // wrapper.allRowDone = allRowDone

        wrapper.oneRowDone = oneRowDone
    })
}

let fileSaveAdd = null
let fileSaveRender = null


function constructPinFilesCell(addClass, type, rowContent) {
    if (addClass === "files") {
        const pinFilesCell = document.createElement("div")
        pinFilesCell.classList.add("pin-files-cell", addClass)

        const pinFilesCellHeader = document.createElement("div")
        pinFilesCellHeader.className = "pin-files-cell-header"

        const pinFilesCellName = document.createElement("span")
        pinFilesCellName.className = "pin-files-cell-name"
        pinFilesCellName.textContent = "Файловый менеджер"

        const pinFilesCellFooter = document.createElement("div")
        pinFilesCellFooter.className = "pin-files-cell-footer"

        pinFilesCellHeader.append(pinFilesCellName)
        pinFilesCell.append(pinFilesCellHeader, pinFilesCellFooter)

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

        const playButton = document.createElement("button")
        playButton.className = "play-button hide"
        playButton.innerHTML = SVG.play

        const clickedCounter = document.createElement("span")
        clickedCounter.className = "clicked-counter"
        clickedCounter.textContent = 1

        const pinFilesDownloading = document.createElement("div")
        pinFilesDownloading.className = "pin-files-downloading"

        const pinFilesDownloadingLine = document.createElement("span")
        pinFilesDownloadingLine.className = "pin-files-downloading-line"

        pinFilesDownloading.append(pinFilesDownloadingLine)

        editPanel.append(closeButton, deleteButton, downloadButton, playButton, clickedCounter)
        pinFilesCellHeader.append(editPanel, pinFilesDownloading, pinFilesCellCounter)

        const realInput = document.createElement("input")
        realInput.type = "file"
        realInput.style.display = "none"
        realInput.multiple = true
        realInput._storedFiles = new DataTransfer().files
        realInput._storedUUIDS = []
        realInput._storedTypes = null

        let isGetFiles = false

        getFiles(type)

        function startDownload() {
            pinFilesDownloading.classList.add("active")
        }

        function endDownload() {
            pinFilesDownloading.classList.remove("active")
        }

        async function getFiles(type) {
            if (isGetFiles) return
            isGetFiles = true

            startDownload()

            const result = await getFilesFromBase(type)

            if (!result) {
                createNotification("error", "Файлы не были загружены")
            }

            endDownload()
            isGetFiles = false
        }

        async function getFilesFromBase() {
            try {
                const data = {
                    zn_number: znNumber,
                }

                if (type !== "zn") {
                    data.type = type
                    if (type !== "rec") {
                        data.identical_str = rowContent.dataset.uuid
                    }
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
                    updateCounter(0)
                    return false
                }

                const archiveBlob = await response.blob()

                if (archiveBlob.size < 4) {
                    updateCounter(0)
                    return true
                }

                const zip = await JSZip.loadAsync(archiveBlob)

                const fileEntries = Object.entries(zip.files).filter(([pathInZip, zipEntry]) => {
                    return pathInZip !== "types.json" && pathInZip !== "uuids.json" && !zipEntry.dir
                })

                if (fileEntries.length === 0) {
                    updateCounter(0)
                    return true
                }

                const uuidsFile = zip.file("uuids.json")

                if (!uuidsFile) {
                    updateCounter(0)
                    return true
                }

                const typesFile = zip.file("types.json")
                if (typesFile) {
                    realInput._storedTypes = JSON.parse(await typesFile.async("text")).types
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
                updateCounter(0)
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

        function updateTypes(length) {
            if (type === "zn") {
                if (!realInput._storedTypes) {
                    realInput._storedTypes = []
                }

                const newTypes = []

                for (let i = 0; i < length; i++) {
                    newTypes.push("zn")
                }

                realInput._storedTypes = [...newTypes, ...realInput._storedTypes]
            }
        }

        async function fullUploadFiles(forUUIDS, forAdd) {
            if (isUploadFiles) return
            isUploadFiles = true

            startDownload()
			
			try {
				if (forUUIDS) {
                    updateTypes(forUUIDS.length)

					const result = await updateUUIDS(forUUIDS)
					if (!result) {
						createNotification("error", "Ошибка отправки данных")
					}
				}
				if (forAdd && forAdd.length) {
					addFilesToInput(forAdd)
				}
				renderFiles()
			} finally {
				endDownload()
				isUploadFiles = false
			}

            
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
            if (!files || !files.length) return true

            let objectData = null

            if (rowContent) {
                objectData = {uuid: rowContent.dataset.uuid}
            }

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

            let hasZN = false

            for (let index = 0; index < realInput.files.length; index++) {
                const file = realInput.files[index]
                const type = realInput._storedTypes !== null ? realInput._storedTypes[index] : null

                if (type === "zn") {
                    hasZN = true
                }

                filePanel.append(
                    constructFile(
                        index,
                        file,
                        type,
                    )
                )
            }

            if (realInput._storedTypes !== null) {
                znHasFiles = hasZN
            }

            updateCounter(realInput.files.length)
            resetClickedCounter()
        }

        function updatePinFiles(el, count) {
            count === 0 ? hasNotFiles(el) : hasFiles(el)
        }

        function updateCounter(count) {
            if (type === "zn") {
                updatePinFiles(headerPinFiles, count)
            } else if (type === "rec") {
                updatePinFiles(recPinFiles, count)
            } else {
                updatePinFiles(rowContent.querySelector(".pin-files"), count)
            }

            pinFilesCellCounter.textContent = count
        }

        playButton.addEventListener("click", () => {
            const clickedList = findClicked()

            if (clickedList.length !== 1) {
                createNotification("error", "Ошибка выбранных файлов")
                return
            }

            const file = realInput.files[clickedList[0]]
            const extension = getFileExtension(file).toLowerCase()

            let type

            if (EXTENSIONS.audio.includes(extension)) {
                type = "audio"
            } else if (EXTENSIONS.video.includes(extension)) {
                type = "video"
            } else {
                createNotification("error", "Ошибка выбранных файлов")
                return
            }

            createRecordPanel(type, false, file)
        })

        function showPlayButton() {
            playButton.classList.remove("hide")
        }

        function hidePlayButton() {
            playButton.classList.add("hide")
        }

        function checkPlayButton() {
            const clickedList = findClicked()

            if (clickedList.length !== 1) {
                hidePlayButton()
                return
            }

            const clicked = Array.from(filePanel.children)[clickedList[0]]

            if (clicked.dataset.playable === "false") {
                hidePlayButton()
                return
            } else {
                showPlayButton()
            }
        }

        let firstFlag = true

        function clickedCounterAdd() {
            if (firstFlag) {
                editPanel.classList.add("show")
                pinFilesCellName.classList.add("hide")
                checkPlayButton(1)
                firstFlag = false
            } else if (!firstFlag) {
                checkPlayButton()
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
                checkPlayButton()
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
            const saveTypes = []
            const deleteUUIDS = []

            for (let indx = 0; indx < realInput.files.length; indx++) {
                if (indexes.indexOf(indx) === -1) {
                    dt.items.add(realInput.files[indx])
                    saveUUIDS.push(realInput._storedUUIDS[indx])
                    saveTypes.push(realInput._storedTypes[indx])
                } else {
                    deleteUUIDS.push(realInput._storedUUIDS[indx])
                }
            }

            const response = await smartSendRequest(
                "files/delete",
                "POST",
                {
                    uuids: deleteUUIDS,
                    mechanic: mechanic,
                    post: post,
                }
            )

            if (!response) return false

            realInput.files = dt.files
            realInput._storedFiles = dt.files
            realInput._storedUUIDS = saveUUIDS
            realInput._storedTypes = saveTypes

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

        return pinFilesCell
    }

    if (addClass === "audio" || addClass === "video") {
        const isAudio = addClass === "audio"

        const recordIconWrapper = document.createElement("div")
        recordIconWrapper.className = "record-icon-wrapper"

        const recordIcon = document.createElement("button")
        recordIcon.className = "record-icon"
        recordIcon.innerHTML = isAudio ? SVG.audio : SVG.video

        recordIconWrapper.append(recordIcon)

        recordIcon.addEventListener("click", () => {
            createRecordPanel(addClass, true, null)
        })

        return recordIconWrapper
    }
}

function createRecordPanel(addClass, addButtons, appendFile) {
    const isAudio = addClass === "audio"

    const pinFilesCell = document.createElement("div")
    pinFilesCell.classList.add("pin-files-cell", addClass)

    const pinFilesCellHeader = document.createElement("div")
    pinFilesCellHeader.className = "pin-files-cell-header"

    const pinFilesCellName = document.createElement("span")
    pinFilesCellName.className = "pin-files-cell-name"

    if (addButtons) {
        pinFilesCellName.textContent = isAudio ? "Запись аудио" : "Запись видео"
    } else {
        pinFilesCellName.textContent = isAudio ? "Прослушивание аудио" : "Просмотр видео"
    }

    const pinFilesCellFooter = document.createElement("div")
    pinFilesCellFooter.className = "pin-files-cell-footer"

    pinFilesCellHeader.append(pinFilesCellName)
    pinFilesCell.append(pinFilesCellHeader, pinFilesCellFooter)


    let mediaRecorder = null
    let stream = null
    let chunks = []

    let actionAfterStop = null
    let lastRecordedBlob = null
    let lastRecordedUrl = null

    const pinFilesCellWrapper = document.createElement("div")
    pinFilesCellWrapper.className = "background-blur fast"
    pinFilesCellWrapper.style.zIndex = 101

    const recordHeader = document.createElement("div")
    recordHeader.className = "record-header"

    const recordDisplay = document.createElement("div")
    recordDisplay.className = "record-display"

    const pinFilesCellEscape = document.createElement("button")
    pinFilesCellEscape.className = "pin-files-panel-escape"
    pinFilesCellEscape.innerHTML = SVG.x

    pinFilesCellHeader.append(pinFilesCellEscape)

    pinFilesCellFooter.append(recordHeader, recordDisplay)

    const isRecordActive = document.createElement("span")
    isRecordActive.className = "is-record-active"
    isRecordActive.textContent = isAudio ? "Микрофон" : "Камера"

    if (addButtons) {
        const timer = new RecurringTimer(addTimeCounter, 1000)

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

        if (isAudio) {
            recordButton.classList.add("record-button-audio", "play")
        } else {
            recordButton.classList.add("record-button-video", "play")
            recordButton.innerHTML = SVG.play
        }

        const addButton = document.createElement("button")
        addButton.className = "add-button"
        addButton.innerHTML = SVG.load

        timeCounter.append(timeCounterMinutes, timeCounterSeconds)
        recordHeader.append(isRecordActive, timeCounter)

        recordFooter.append(againButton, recordButton, addButton)

        pinFilesCellFooter.append(recordFooter)

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

                if (!isAudio) {
                    clearPreview()

                    const preview = document.createElement("video");
                    preview.autoplay = true;
                    preview.muted = true;
                    preview.playsInline = true;
                    preview.srcObject = stream;
                    preview.className = "record-preview"

                    recordDisplay.classList.add("play")
                    recordDisplay.append(preview)
                }

                mediaRecorder.addEventListener("dataavailable", (event) => {
                    if (event.data && event.data.size > 0) {
                        chunks.push(event.data)
                    }
                })

                mediaRecorder.addEventListener("stop", handleRecordStop, {once: true})

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
                const blob = new Blob(chunks, {type: mimeType})
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

        function getSupportedMimeType() {
            const types = isAudio
                ? [
                    "audio/weba;codecs=opus",
                    "audio/weba",
                    "audio/ogg;codecs=opus",
                    "audio/ogg"
                ]
                : [
                    "video/webm;codecs=vp9,opus",
                    "video/webm;codecs=vp8,opus",
                    "video/webm"
                ];

            return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
        }

        function getFallbackMimeType(kind) {
            return kind === "video" ? "video/webm" : "audio/weba"
        }

        function deleteRecorder() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            stream = null
            mediaRecorder = null
        }

        function removeRecordPreview() {
            recordDisplay.classList.remove("play")
            lastRecordedBlob = null
            lastRecordedUrl = null
        }

        recordDisplay.addEventListener("animationend", () => {
            recordDisplay.classList.remove("updated")
        })

        function saveLastBlob(blob) {
            if (lastRecordedUrl) {
                URL.revokeObjectURL(lastRecordedUrl)
            }

            lastRecordedBlob = blob
            lastRecordedUrl = URL.createObjectURL(blob)
        }

        async function createRecorder() {
            stream = await navigator.mediaDevices.getUserMedia(
                isAudio
                    ? {audio: true}
                    : {video: {facingMode: "environment"}, audio: true}
            )

            const mimeType = getSupportedMimeType()
            const options = mimeType ? {mimeType} : {}

            mediaRecorder = new MediaRecorder(stream, options)

            mediaRecorder.start()
        }

        function clearCurrentRecordData() {
            chunks = []
        }

        function getExtensionFromBlob(blob) {
            const mimeType = blob.type.split(";")[0]

            const mimeToExt = {
                "audio/weba": "weba",
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
            clearPreview()
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

                const name = `${mechanic} ${addZero(hour)}:${addZero(minutes)} ${addZero(date)}.${addZero(month)}.${year.toString().slice(2)}`
                const extension = getExtensionFromBlob(lastRecordedBlob)
                const fileName = `${name}.${extension}`

                const file = new File(
                    [lastRecordedBlob],
                    `${fileName}`,
                    {type: lastRecordedBlob.type || "application/octet-stream"}
                )

                await fileSaveAdd([file], [file])
                fileSaveRender()

                removeRecordPreview()
                stopRecorder()
                resetRecordPanel()
                clearPreview()
                clearCurrentRecordData()

                body.removeChild(pinFilesCellWrapper)
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
                timeCounterSeconds.textContent = addZero(Number(timeCounterSeconds.textContent) + 1)
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
    } else {
        pinFilesCellFooter.classList.add("no-buttons")
        addRecordPreview(appendFile)
    }

    function clearPreview() {
            const currentMedia = recordDisplay.querySelector(addClass)

            if (currentMedia) {
                recordDisplay.removeChild(currentMedia)
            }

            if (currentMedia?.dataset.objectUrl) {
                URL.revokeObjectURL(currentMedia.dataset.objectUrl)
            }
        }

    function addRecordPreview(blob) {
        if (recordDisplay.classList.contains("play")) {
            const oldElement = recordDisplay.querySelector(addClass)

            if (oldElement) {
                recordDisplay.removeChild(oldElement)

                const oldUrl = oldElement?.dataset.objectUrl
                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl)
                }
            }

            const mediaUrl = URL.createObjectURL(blob)

            recordDisplay.classList.remove("updated")
            recordDisplay.classList.add("updated")

            const mediaElement = document.createElement(addClass)

            if (mediaElement) {
                mediaElement.src = mediaUrl
                mediaElement.dataset.objectUrl = mediaUrl
                mediaElement.controls = true
                mediaElement.preload = "metadata"
                mediaElement.load()
            } else {
                clearPreview()
            }

            recordDisplay.append(mediaElement)
        } else {
            recordDisplay.classList.add("play")

            const mediaUrl = URL.createObjectURL(blob)
            let mediaElement

            mediaElement = document.createElement(addClass)
            mediaElement.controls = true
            mediaElement.playsInline = true

            mediaElement.src = mediaUrl
            mediaElement.preload = "metadata"
            mediaElement.dataset.objectUrl = mediaUrl
            mediaElement.load()

            clearPreview()
            recordDisplay.append(mediaElement)
        }
    }

    function stopRecorder() {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop()

                deleteRecorder()

                isRecordActive.classList.remove("active")
            }
        }

    pinFilesCellEscape.addEventListener("click", () => {
            body.removeChild(pinFilesCellWrapper)
            stopRecorder()
            clearCurrentRecordData()
        })

    pinFilesCellWrapper.append(pinFilesCell)
    body.append(pinFilesCellWrapper)
}

function constructFile(index, realFile, type) {
    const file = document.createElement("div")
    file.className = "file"
    file.dataset.index = index

    const fileIcon = constructFileIcon(realFile)

    const fileInfo = document.createElement("div")
    fileInfo.className = "file-info"

    const fileName = document.createElement("span")
    fileName.className = "file-name"
    fileName.textContent = getFileName(realFile)

    const fileAddInfo = document.createElement("div")
    fileAddInfo.className = "file-add-info"

    const extension = getFileExtension(realFile).toUpperCase()

    const fileExtension = document.createElement("span")
    fileExtension.className = "file-extension"
    fileExtension.textContent = extension

    const fileWeight = document.createElement("span")
    fileWeight.className = "file-weight"
    fileWeight.innerHTML = constructFileSize(realFile)

    fileAddInfo.append(fileExtension, fileWeight)
    fileInfo.append(fileName, fileAddInfo)

    file.append(fileIcon)

    if (type) {
        file.style.gridTemplateColumns = "min-content min-content 1fr"
        file.append(constructFileTypeIcon(type))
    }

    file.append(fileInfo)

    if (EXTENSIONS.audio.includes(extension.toLowerCase()) || EXTENSIONS.video.includes(extension.toLowerCase())) {
        file.dataset.playable = true
    } else {
        file.dataset.playable = false
    }

    return file
}

async function uploadFiles(files, type, objectData) {
    try {
        const formData = new FormData()

        formData.append("zn_number", znNumber)
        formData.append("type", type)
        formData.append("mechanic", mechanic)
        formData.append("post", post)

        if (objectData && objectData.uuid) {
            formData.append("identical_str", objectData.uuid)
        } else {
            formData.append("identical_str", null)
        }

        for (const file of files) {
            formData.append("files", file, file.name)
        }

        const response = await fetch(`${API_PATH}/files/create`, {
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

function constructFileIcon(file) {
    const icon = document.createElement("div")
    const extension = getFileExtension(file)

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


function constructFileTypeIcon(type) {
    const typeIcon = document.createElement("div")
    typeIcon.className = "file-type-icon"

    switch (type) {
        case "zn":
            typeIcon.innerHTML = SVG.zn
            break
        case "rec":
            typeIcon.innerHTML = SVG.rec
            break
        case "jobs":
            typeIcon.innerHTML = SVG.job
            break
        case "parts":
            typeIcon.innerHTML = SVG.part
            break
    }

    return typeIcon
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

function initEscapeButton() {
    const escapeButton = document.querySelector(".escape")

    escapeButton.addEventListener("click", () => {
        window.location.href = "second_page.html"
    })
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

        const result = await requestManager.send(
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

        return result
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
        return await requestManager.send(
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
            okFunc: (result) => { doneStartRequest("status", result, (result) => {
                setStatus(result)
            }) },
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

        for (const data of doneChanges) {
            if(!smartData.update(
                {done: data.value},
                {uuid: data.identical_str},
                1
            ).length) {
                createNotification("error", "Ошибка в полученных")
                console.error(`Not found: identical_str=${data.identical_str}`)
            }
        }
    }

    function handleZnItems(jobs, mainChanges) {
        console.log(`Handle zn_items: ${mainChanges}`)

        let smartData

        if (jobs) {
            smartData = jobsData
        } else {
            smartData = partsData
        }

        for (const change of mainChanges) {
            const { type, data } = change

            if (type === "create") {
                console.log("create", data)
                smartData.create(data)
            } else if (type === "update") {
                const uuid = data.uuid
                delete data.uuid

                smartData.update(
                    data,
                    {uuid: uuid},
                    1,
                )
            } else {
                smartData.delete(
                    {uuid: data.uuid},
                    1
                )
            }
        }
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
    sseSource.addRecoverHandler("zn", ({ car_changes, zn_changes }) => {
        handleCar(car_changes)
        handleZn(zn_changes)
    })
    sseSource.addSSEEvent("zn", (changes) => {
        handleZn(changes)
    })
    sseSource.addSSEEvent("car", (changes) => {
        handleCar(changes)
    })


    // done_changes: list[dict[str, Any]], main_changes: list[dict[str, Any]]
    sseSource.addRecoverHandler("jobs", ({ done_changes, main_changes }) => {
        handleZnItems(true, main_changes)
        handleDone(true, done_changes)

        updateJobsTable()
    })
    sseSource.addSSEEvent("jobs", (changes) => {
        handleZnItems(true, changes)

        updateJobsTable()
    })


    // done_changes: list[dict[str, Any]], main_changes: list[dict[str, Any]]
    sseSource.addRecoverHandler("parts", ({ done_changes, main_changes }) => {
        handleZnItems(false, main_changes)
        handleDone(false, done_changes)

        updatePartsTable()
    })
    sseSource.addSSEEvent("parts", (changes) => {
        handleZnItems(false, changes)

        updatePartsTable()
    })


    // status: str | None
    sseSource.addRecoverHandler("status", ({ status }) => {
        if (status === null) return

        setStatus(status)
    })

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

    // status: str
    sseSource.addSSEEvent("status", ({ status }) => {
        setStatus(status)
    })

    // type: str, identical_str: str | None, has_files: bool
    sseSource.addSSEEvent("has_files", ({ type, identical_str, has_files }) => {
        let pinFiles

        if (type === "zn") {
            pinFiles = headerPinFiles
            znHasFiles = has_files
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
    sseSource.addSSEEvent("status", ({ status }) => {
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

start()