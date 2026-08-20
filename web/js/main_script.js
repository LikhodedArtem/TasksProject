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


const MY_UUID = crypto.randomUUID()
const generateUUIDv7 = (() => {
    let lastTimestamp = -1;
    let counter = 0;

    return function () {
        const bytes = new Uint8Array(16);
        let timestamp = Date.now();

        if (timestamp <= lastTimestamp) {
            timestamp = lastTimestamp;
            counter += 1;

            if (counter > 0xfff) {
                timestamp += 1;
                counter = 0;
            }
        } else {
            counter = crypto.getRandomValues(new Uint16Array(1))[0] & 0xfff;
        }

        lastTimestamp = timestamp;

        bytes[0] = (timestamp / 2 ** 40) & 0xff;
        bytes[1] = (timestamp / 2 ** 32) & 0xff;
        bytes[2] = (timestamp / 2 ** 24) & 0xff;
        bytes[3] = (timestamp / 2 ** 16) & 0xff;
        bytes[4] = (timestamp / 2 ** 8) & 0xff;
        bytes[5] = timestamp & 0xff;
        bytes[6] = 0x70 | ((counter >> 8) & 0x0f);
        bytes[7] = counter & 0xff;

        crypto.getRandomValues(bytes.subarray(8));
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
})();


const body = document.querySelector(".body")


const SVG = {
    load: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V5M12 5l-4 4M12 5l4 4M5 17.5v1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5V16M12 16l-4-4M12 16l4-4M5 17.5v1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05 12.25 20.24a6 6 0 1 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.48-8.48"/></svg>',
    delete: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v5"/><path d="M14 11v5"/><path d="M6 7l1 11a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7"/><path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7"/></svg>',
    again: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-label="Заново" role="img"><path d="M4 4v5h5M5.5 8A8 8 0 1 1 4.7 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>',
    arrowLeft: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Стрелка влево\"> <path d=\"M36 24H14\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/> <path d=\"M22 16L14 24L22 32\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',
    open: '<svg class="chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',

    document: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>',
    picture: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="2"/><path d="M3 19l7-7 3 3 3-3 5 5"/></svg>',
    video: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3z"/><path d="M9 9l4 3-4 3z"/></svg>',
    audio: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/></svg>',
    archive: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v4h6V3"/><path d="M12 10h.01"/><path d="M12 13h.01"/><path d="M12 16h.01"/><path d="M10 19h4"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none"><path d=\"M8 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19V5A1.5 1.5 0 0 1 8.5 3.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M14 3.5V8h4\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M9 12.5h6M9 16h6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>',

    war: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.5L13.7 4.2a2 2 0 0 0-3.4 0Z\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/></svg>",
    ok: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">\n <path d="M7 12.5L10.2 15.7L17.5 8.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>',
    x: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19" /><line x1="5" y1="19" x2="19" y2="5" /></svg>',

    zn: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5H6a2 2 0 0 0-2 2v13h16V7a2 2 0 0 0-2-2h-2"/><rect x="8" y="3" width="8" height="4" rx="1.5"/><path d="M8 11h8M8 15h8"/></svg>',
    job: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 5.5a5.5 5.5 0 0 1-6.7 5.4L7.2 19.3a2.5 2.5 0 0 1-3.5-3.5l8.2-8.2a5.5 5.5 0 0 1 7.3-6.4l-4 4 .5 2.2 2.2.5 4-4c.1.5.1 1.1.1 1.6Z"/><path d="M5.5 17.5h.01"/></svg>',
    part: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.2 3.2h3.6c.5 0 .9.3 1 .8l.3 1.5c.6.2 1.1.5 1.6.9l1.5-.5c.5-.2 1 0 1.2.5l1.8 3.1c.3.4.2 1-.2 1.3l-1.2 1.1v1.8l1.2 1.1c.4.3.5.9.2 1.3l-1.8 3.1c-.2.5-.7.7-1.2.5l-1.5-.5c-.5.4-1 .7-1.6.9l-.3 1.5c-.1.5-.5.8-1 .8h-3.6c-.5 0-.9-.3-1-.8l-.3-1.5c-.6-.2-1.1-.5-1.6-.9l-1.5.5c-.5.2-1 0-1.2-.5l-1.8-3.1c-.3-.4-.2-1 .2-1.3l1.2-1.1v-1.8L3 10.8c-.4-.3-.5-.9-.2-1.3l1.8-3.1c.2-.5.7-.7 1.2-.5l1.5.5c.5-.4 1-.7 1.6-.9L9.2 4c.1-.5.5-.8 1-.8Z"/><circle cx="12" cy="12.8" r="3"/></svg>',
    rec: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m8 11 2.5 2.5L16 8"/></svg>',
}

const EXTENSIONS = {
    document: ['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt'],
    picture: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'weba'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz', 'bz2', 'arc']
}

const $notification = document.createElement("div")
$notification.className = "notification"
$notification.style.pointerEvents = "none"

const $notificationIcon = document.createElement("div")
$notificationIcon.className = "notification-icon"

const $notificationText = document.createElement("div")
$notificationText.className = "notification-text"

const $notificationMainTextElement = document.createElement("h1")
$notificationMainTextElement.className = "notification-text-main"

const $notificationAddTextElement = document.createElement("p")
$notificationAddTextElement.className = "notification-text-add"

const $notificationClose = document.createElement("button")
$notificationClose.className = "notification-close"
$notificationClose.innerHTML = SVG.x
$notificationClose.style.display = "none"

$notificationText.append($notificationMainTextElement, $notificationAddTextElement)
$notification.append($notificationIcon, $notificationText, $notificationClose)

$notification.addEventListener("click", () => {
    clearTimeout(hideTimer)
    clearTimeout(removeClassTimer)

    $notification.classList.remove('show')
    $notification.style.pointerEvents = "none"
})

body.append($notification)

let hideTimer
let removeClassTimer

// const baseUrl = window.location.origin
//
// const API_PATH = baseUrl + ':8000/api/web'

const API_PATH = "http://192.168.50.95:8000/api/web"

// const API_PATH = "http://192.168.30.93:8000/api/web"

function createNotification(operation, mainText) {
    clearTimeout(hideTimer)
    clearTimeout(removeClassTimer)

    const formattedOperation = operation.toLowerCase()

    function iconClear() {
        $notificationIcon.className = "notification-icon"
    }

    if (formattedOperation === "ok") {
        iconClear()
        $notificationIcon.classList.add("ok")
        $notificationIcon.innerHTML = SVG.ok
        $notificationAddTextElement.textContent = "Операция успешно выполнена"
    } else if (formattedOperation === "error") {
        iconClear()
        $notificationIcon.classList.add("error")
        $notificationIcon.innerHTML = SVG.x
        $notificationAddTextElement.textContent = "Не удалось выполнить операцию"
    } else if (formattedOperation === "warning") {
        iconClear()
        $notificationIcon.classList.add("warning")
        $notificationIcon.innerHTML = SVG.war
        $notificationAddTextElement.textContent = "Просьба обратить внимание"
    }
    else {
        return null
    }

    $notificationMainTextElement.textContent = mainText

    $notification.style.pointerEvents = "all"

    $notification.classList.add("show")
    $notification.classList.remove("hide")

    hideTimer = setTimeout(() => {
        $notification.classList.remove('show');
        $notification.classList.add('hide');
        $notification.style.pointerEvents = "none"
    }, 5000);

    removeClassTimer = setTimeout(() => {
        $notification.classList.remove('hide');
        $notification.style.pointerEvents = "none"
    }, 5100);
}

const loadingIcon = createLoading()


function setLoading() {
    if (loadingIcon.parentNode === body) return
    body.append(loadingIcon)
}

function clearLoading() {
    if (loadingIcon.parentNode !== body) return
    body.removeChild(loadingIcon)
}

function createLoading() {
    const backgroundBlur = document.createElement("div")
    backgroundBlur.className = "background-blur loading"

    const loadingIcon = document.createElement("div")
    loadingIcon.className = "loading-icon"

    backgroundBlur.append(loadingIcon)

    return backgroundBlur
}

function deleteLoading() {
    const backgroundBlur = body.querySelector(".background-blur")
    const loadingIcon = backgroundBlur.querySelector(".loading-icon")

    const reloadButton = document.createElement("button")
    reloadButton.className = "active-button"
    reloadButton.textContent = "Перезагрузить страницу"
    reloadButton.style.position = "absolute"
    reloadButton.style.height = "5.5rem"
    reloadButton.style.opacity = 0

    backgroundBlur.append(reloadButton)

    reloadButton.style.opacity = 1
    loadingIcon.style.opacity = 0


    reloadButton.addEventListener("click", () => {
        window.location.reload()
    })
}


function constructCell(text, addClass) {
    const cell = document.createElement("div")
    cell.classList.add("table-cell", addClass)

    const cellSpan = document.createElement("span")

    if (addClass === "work-content" || addClass === "detail-name" || addClass === "prod") {
        cellSpan.setAttribute("lang", "ru")
    }

    cellSpan.innerHTML = text

    cell.append(cellSpan)
    return cell
}

async function sendRequestToServer(
    url,
    method,
    data,
) {
    try {
        let body
        if (typeof data === 'string') {
            body = data
        } else if (data != null) {
            body = JSON.stringify(data)
        } else {
            body = null
        }

        return await fetch(`${API_PATH}/` + url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Id': MY_UUID,
            },
            body: body
        })

    } catch (error) {
        console.error("Ошибка отправки:", error)
        return null
    }
}


async function smartSendRequest(
    url,
    method,
    data,
    onOk,
    on404,
    on500,
    onError
) {
    try {
        let response = null
        let cycles = 0
        
        while (!response) {
            if (cycles === 3) {
                createNotification("error", "Нет связи с сервером")
                deleteLoading()
                return false
            }
            if (cycles > 1) {
                createNotification("error", "Нет ответа от сервера")
            }

            response = await sendRequestToServer(url, method, data)
            cycles++
        }

        if (response.ok) {
            const answer = await response.json()

            if (onOk) {
                const result = onOk(answer)

                if (result != null) return result
            }

            if (answer) return answer

            return true
        }

        switch (response.status) {
            case 404:
                if (on404) {
                    on404(response)
                    return true
                } else {
                    console.warn(response.statusText)
                    createNotification("warning", "Данные не найдены")
                }
                break
            case 500:
                if (on500) {
                    on500(response)
                    return true
                } else {
                    console.error(`Answer code 500 response text: ${response.statusText}`)
                    createNotification("warning", "На сервере произошла ошибка")
                }
                break
            default:
                console.error(`Unexpected code: ${response.status}`)
                createNotification("error", "Произошла неизвестная ошибка")
        }

        return false
    } catch (e) {
        console.error(`smartSendRequest Error: ${e}`)

        if (onError) {
            onError()
        } else {
            createNotification("error", "Неизвестная ошибка")
        }

        return false
    }
}


function createReadableDate(unix) {
    const date = new Date(unix * 1000)

    const hours = addZero(date.getHours().toString())
    const minutes = addZero(date.getMinutes().toString())

    const day = addZero(date.getDate().toString())
    const month = addZero(date.getMonth().toString())
    const year = date.getFullYear().toString()


    function addZero(string) {
        return (string.length === 1) ? "0" + string : string
    }

    return `${day}.${month}.${year} - ${hours}:${minutes}`
}


function beautyReg(reg) {
    const mainLine = document.createElement("span")
    mainLine.style.display = "flex"
    mainLine.style.gap = "0.3rem"

    const first = document.createElement("span")
    first.textContent = reg.slice(0, 1)

    const second = document.createElement("span")
    second.textContent = reg.slice(1, 4)

    const third = document.createElement("span")
    third.textContent = reg.slice(4, 6)

    const fourth = document.createElement("span")
    fourth.textContent = reg.slice(6, 9)

    mainLine.append(first, second, third, fourth)
    mainLine.style.textTransform = "uppercase"

    return mainLine
}

function pxToRem(px) {
    const remBase = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return Math.round(px / remBase * 100) / 100
}

class Cookie {
    static set(name, value, options = {}) {
        let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

        if (options.hours) {
            const date = new Date()
            date.setTime(date.getTime() + options.hours * 60 * 60 * 1000)
            cookieStr += `; expires=${date.toUTCString()}`
        } else if (options.maxAge) {
            cookieStr += `; max-age=${options.maxAge}`
        }

        cookieStr += `; path=${options.path || '/'}`

        if (options.domain) cookieStr += `; domain=${options.domain}`
        if (options.secure) cookieStr += `; secure`
        cookieStr += `; samesite=${options.sameSite || 'Lax'}`

        document.cookie = cookieStr
    }

    static get(name) {
        const cookies = document.cookie.split('; ');
        const found = cookies.find(row => row.startsWith(encodeURIComponent(name) + '='));
        return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null;
    }

    static getGroup(lst, always) {
        let answer = {}

        for (const name of lst) {
            const value = this.get(name)

            if (!always && value == null) {
                answer = null
                break
            } else {
                answer[name] = value
            }
        }

        return answer
    }

    static delete(name, options = {}) {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}`;
    }

    static has(name) {
        return this.get(name) !== null;
    }
}


class SmartContainer {
    constructor (data=null) {
        if (!data) {
            this._data = []
            return
        }
        this._data = data
    }

    create(
        newRow
    ) {
        this._data.push(newRow)
    }

    select(
        forFind = null,
        forSelect = null,
        limit = null
    ) {
        let count = 0

        const answer = []

        function getColumnsFromRow(row) {
            let data

            if (forSelect.length !== 1) {
                data = {}

                for (const key of forSelect) {
                    data[key] = row[key]
                }
            } else {
                data = row[forSelect[0]]
            }

            return data
        }

        outerLoop:
        for (const row of this._data) {
            if (forFind) {
                for (const [key, value] of Object.entries(forFind)) {
                    if (value !== null && row[key] !== value) {
                        continue outerLoop
                    }
                }
            }

            if (forSelect) {
                answer.push(getColumnsFromRow(row))
            } else {
                answer.push(row)
            }

            count++

            if (limit && limit === count) {
                break
            }
        }

        return answer
    }

    // dict
    // dict
    // int

    update(
        forUpdate,
        forFind = null,
        limit = null,
    ) {
        let count = 0
        let index = -1

        const indexes = []

        outerLoop:
        for (const row of this._data) {
            index++
            if (forFind) {
                for (const [key, value] of Object.entries(forFind)) {
                    if (row[key] !== value) {
                        continue outerLoop
                    }
                }
            }

            for (const [key, value] of Object.entries(forUpdate)) {
                if (value === null) continue
                if (value === undefined) throw Error("Undefined in update dict")
                row[key] = value
            }

            indexes.push(index)
            count++

            if (limit && limit === count) {
                break
            }
        }

        return indexes
    }

    // dict
    // int

    delete(
        forFind,
        limit = null,
        onDelete = null,
    ) {
        let count = 0

        outerLoop:
        for (let i = 0; i < this._data.length; i++) {
            const obj = this._data[i]

            for (const [key, value] of Object.entries(forFind)) {
                if (obj[key] !== value) {
                    continue outerLoop
                }
            }



            const value = this._data.splice(i, 1)[0]
            if (onDelete) onDelete(value)
            i--

            count++

            if (limit !== null && count >= limit) break
        }

        return count
    }

    replace(
        newData
    ) {
        this._data = newData
    }

    data() {
        return this._data
    }

    orderBy(columnName, max = true) {
        const newData = []

        for (const obj of this._data) {
            let index = newData.length

            for (let i = 0; i < newData.length; i++) {
                const shouldInsertHere = max
                    ? obj[columnName] >= newData[i][columnName]
                    : obj[columnName] <= newData[i][columnName]

                if (shouldInsertHere) {
                    index = i
                    break
                }
            }

            newData.splice(index, 0, obj)
        }

        this._data = newData
    }
}


class SmartSSESource {
    constructor(type, uuid) {
        this._type = type
        this._uuid = uuid

        this._controller = null

        this._sseEvents = {}
        this._serverEvents = {}

        this._lastIDs = {}

        this._recoverFuncs = {}

        this._retry = 3000

        this.stopped = true
        this.reconnecting = false
        this.reconnectAddInfo = null

        this.STOPPED = {}
        this.LOST_CONNECTION = {}

        this.headers = {
            'Content-Type': 'application/json',
            'X-Client-ID': this._uuid,
        }

        this.requests = null

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stop()
            } else {
                this.start()
            }
        })

        window.addEventListener('beforeunload', () => {
            this.stop()
        })
    }

    async _connect() {
        this._controller = new AbortController()

        try {
            const response = await fetch(
                `${API_PATH}/sse/connect`,
                {
                    method: 'POST',
                    signal: this._controller.signal,
                    headers: this.headers,
                    body: JSON.stringify({
                        type: this._type,
                    })
                }
            )

            if (!response.ok) {
                throw Error(`Connect error: ${response.statusText}`)
            }

            if (Object.keys(this._serverEvents).length) {
                await this.subServerEvents(
                    this._serverEvents,
                    true,
                    false
                )
            }

            console.log("SSE connected")

			setTimeout(() => {
				this._recoverData()
                this.requests._runRecover()
			}, 5000)

            this.stopped = false
            this.reconnecting = false

            this.requests._setConTrue()

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()

                if (value) {
                    buffer += decoder.decode(value, { stream: true })
                }

                let boundary

                while ((boundary = buffer.indexOf("\n\n")) !== -1) {
                    const rawEvent = buffer.slice(0, boundary)
                    buffer = buffer.slice(boundary + 2)

                    const data = SmartSSESource._parse(rawEvent)
                    if (data !== null) this._handleEvent(data)
                }

                if (done) break
            }

            return this.STOPPED
        } catch (error) {
            console.log(`SSE escape error: ${error}`)
            if (this.stopped) return this.STOPPED
            return this.LOST_CONNECTION
        }
    }

    static _parse(text) {
        try {
            const lines = text.split("\n")

            const data = {
                event: null,
                data: null,
                id: null,
                retry: null,
            }

            for (const line of lines) {
                if (!line.length || line.indexOf(":") === 0) continue

                const separator = line.indexOf(":")
                const key = line.slice(0, separator)
                const value = line.slice(separator + 2)

                if (Object.keys(data).indexOf(key) !== -1) {
                    data[key] = value
                } else {
                    console.error("Bad data format")
                    return null
                }
            }

            if (Object.values(data).every(v => v === null)) {
                return null
            } else {
                if (data.data) data.data = JSON.parse(data.data)
                if (data.retry) data.retry = Number(data.retry)

                return data
            }
        } catch (error) {
            console.error(`SSE Parse data Error: ${error}`)
        }
    }

    async _recoverData() {
        const recoverResponse = await fetch(
                `${API_PATH}/sse/recover`,
                {
                    method: 'POST',
                    headers: {
                        ...this.headers,
                        'Last-Event-IDs': JSON.stringify(this._lastIDs),
                    },
                    body: JSON.stringify({
                        add_data: this.reconnectAddInfo,
                    })
                }
            )

            if (!recoverResponse.ok) {
                console.error("Recover data error")
            } else {
                const info = await recoverResponse.json()

                const string = JSON.stringify(info)

                function deepFreeze(value) {
                    if (value === null || typeof value !== 'object') {
                        return value
                    }

                    Object.freeze(value)

                    for (const [key, child] of Object.entries(value)) {
                        if (key === "change_uuid") continue
                        deepFreeze(child)
                    }

                    return value
                }

                const newObj = deepFreeze(JSON.parse(string))

                this._handleRecover(newObj)

                console.log("Data recovered")
            }
    }

    _handleRecover(data) {
        // console.log("Recover event handle with data:", data)

        for (const [key, value] of Object.entries(data)) {
            if (this._recoverFuncs[key] !== undefined && value !== null && (!value.data || value.data.length !== 0)) {
                if (value["last_change_uuid"] !== "skip") this._lastIDs[key] = value["last_change_uuid"]
                // delete value["last_change_uuid"]

                try {
                    // console.log(`Event ${key}:`, value)
                    this._recoverFuncs[key](value)
                } catch (error) {
                    console.error(`Error while attempting to run recover func: ${error}`)
                }
            }
        }
    }

    _handleEvent({ event, data, id, retry }) {
        // console.log("SSE event handle with:", id, event, data, retry)
        // console.log(this._sseEvents[event])

        if (this._sseEvents[event] !== undefined) {
            for (const func of this._sseEvents[event]) {
                try {
                    const idName = func(data)
                    if (id && id !== "skip") this._lastIDs[idName] = id
                } catch (error) {
                    console.error(`SSE Function ${func} on Event: ${event} Error: ${error}`)
                }
            }
        }

        if (retry != null) this._retry = retry
    }

    async start() {
        try {
            if (!this.stopped && !this.reconnecting) return

            console.log("SSE starting...")

            this.reconnecting = true

            const result = await this._connect()

            if (result === this.STOPPED) {
                console.log("SSE stopped")
            } else if (result === this.LOST_CONNECTION) {
                console.log("SSE lost connection")
            }

            this.stopped = true
            this.reconnecting = false
            this.requests._setConFalse()
        } catch (e) {
            console.error(`Error while starting SSE connection: ${e}`)
        }
    }

    stop() {
        this.stopped = true
        this._controller.abort()

        // console.log("SSE stopped")
    }

    async unsubscribe() {
        const result = await fetch(
            `${API_PATH}/sse/unsubscribe`,
            {
                method: 'POST',
                headers: this.headers,
            }
        )

        if (!result.ok) {
            throw Error(`SSE unsubscribe Error: ${result.statusText}`)
        }
    }

    addRecoverHandler(name, func) {
        this._recoverFuncs[name] = func
    }

    addSSEEvent(name, func) {
        function eventReact(data) {
            return func(data)
        }

        if (this._sseEvents[name] === undefined) {
            this._sseEvents[name] = []
        }

        this._sseEvents[name].push(eventReact)
    }

    removeSSEEvent(name) {
        if (this._sseEvents[name] === undefined) return

        delete this._sseEvents[name]
    }

    // data format: dict[str, null | str | list[str]]
    async subServerEvents(
        data,
        send = false,
        add = true) {
        try {
            if (send) {
                const response = await fetch(
                    `${API_PATH}/sse/subscribe/events`,
                    {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: this.headers,
                    },
                )

                if (!response.ok) throw new Error(response.statusText)
            }

            if (!add) return

            for (let [event, addInfo] of Object.entries(data)) {
                if (this._serverEvents[event] === null) continue

                if (addInfo === null) {
                    this._serverEvents[event] = null
                    continue
                }

                if (typeof addInfo === "string") {
                    addInfo = [addInfo]
                }

                if (this._serverEvents[event] === undefined) {
                    this._serverEvents[event] = addInfo
                    continue
                }

                this._serverEvents[event] = [...this._serverEvents[event], ...addInfo]
            }
        } catch (error) {
            console.error(`SSE subscribe events Error: ${error}`)
        }
    }

    // data format: dict[str, null | str | list[str]]
    async unsubServerEvents(data, remove = true) {
        try {
            const response = await fetch(
                `${API_PATH}/sse/unsubscribe/events`,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: this.headers,
                }
            )

            if (!response.ok) throw new Error(response.statusText)

            if (!remove) return

            for (let [event, addInfo] of Object.entries(data)) {
                if (this._serverEvents[event] === undefined) continue

                if (addInfo === null) {
                    delete this._serverEvents[event]
                    continue
                }

                if (typeof addInfo === "string") {
                    addInfo = [addInfo]
                }

                this._serverEvents[event].filter(item => addInfo.indexOf(item) === -1)
            }
        } catch (error) {
            console.error(`SSE unsubscribe events Error: ${error}`)
        }
    }
}


class RequestContainer {
    constructor() {
        // list[tuple[func, tryCount]]
        this._requestQueue = []

        this._reconnectTimeout = null
        this.delay = 10
        this.maxAttempts = 3

        this.CONNECTED = true
        this.STOPPED = false

        this.SSE = null

        this.recoverDelay = 10
        this._recoverTimeout = null

        this._activeRequestsCount = 0
    }

    run() {
        this._runQueue()
    }

    async send(
        addURL,
        method,
        {
            data = null,
            files = null,
            headers = {},
            credentials = "omit",
            timeout = 3,
            okFunc = null,
            anywayFunc = null,
            errorsFuncs = null,
            changeUUID = false,
            rawResponse = false,
            isStart = false,
       }) {
        if (!isStart) this._activeRequestsCount++
        let body

        const isFormData = Array.isArray(files)

        if (isFormData) {
            const formData = new FormData()

            if (data != null && typeof data === 'object') {
                for (const [key, value] of Object.entries(data)) {
                    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
                }
            }

            for (const file of files) {
                formData.append('files', file, file.name)
            }

            body = formData
        } else if (typeof data === 'string') {
            body = data
        } else if (data != null) {
            body = JSON.stringify(data)
        } else {
            body = null
        }

        if (changeUUID) {
            headers['X-Change-UUID'] = generateUUIDv7()
        }

        async function fetchInvoker() {
            try {
                const requestHeaders = {
                    'X-Client-Id': MY_UUID,
                    ...headers
                }

                if (!isFormData) {
                    requestHeaders['Content-Type'] = 'application/json'
                }

                const response = await fetch(
                    `${API_PATH}/${addURL.replace(/^\/+/, "")}`,
                    {
                        method: method,
                        headers: requestHeaders,
                        body: body,
                        credentials: credentials,
                        signal: AbortSignal.timeout(timeout * 1000)
                    }
                )

                if (typeof anywayFunc === "function") {
                    anywayFunc()
                }

                if (!response.ok) {
                    const num = response.status.toString()

                    if (!errorsFuncs
                        || Object.keys(errorsFuncs).indexOf(num) === -1) return

                    const find = errorsFuncs[num]

                    if (typeof find === "function") {
                        find(response)
                    } else {
                        for (const func of find) {
                            func(response)
                        }
                    }

                    return
                }

                if (typeof okFunc === "function") {
                    let data

                    if (rawResponse) {
                        data = response
                    } else {
                        try {
                            data = await response.json()
                        } catch (e) {
                            data = response.body
                        }
                    }

                    okFunc(data)
                }
            } catch (e) {
                console.error(`Fetch Invoker error: ${e}`)
                throw Error()
            }
        }

        try {
            await fetchInvoker()
            this._setConTrue()

            // console.log("Function Success")

        } catch (error) {
            this._setConFalse()
            this._requestQueue.push([0, fetchInvoker, !isStart ? 'base' : 'start'])

            // console.log(`Function Failed by reason: ${error}`)
        }
        if (!isStart) this._activeRequestsCount--
    }

    setLastID(key, value) {
        this.SSE._lastIDs[key] = value
    }

    async _runRecover() {
        this._recoverTimeout = setTimeout(() => {
            if (!this.CONNECTED) return

            if (this.CONNECTED
                && this.SSE
                && !this.SSE.stopped
                && !this.SSE.reconnecting
            ) {
                this.SSE._recoverData()
            }

            this._runRecover()
        }, this.recoverDelay * 1000)
    }

    async _runQueue() {
        // console.log(`New Queue run with CONNECTED: ${this.CONNECTED}`)
        // console.log(`Queue has functions: ${this._requestQueue.length}`)
        if (this.STOPPED) return

        try {
            if (!this.CONNECTED) {
                await this._connect()

                if (!this.CONNECTED) {
                    // console.log("Queue can't start")
                    return
                }
            }

            // console.log("Queue start")

            const remaining = []

            const copy = this._requestQueue.splice(0, this._requestQueue.length)

            for (const request of copy) {
                const [attempts, requestFunc] = request

                if (attempts > this.maxAttempts) continue

                try {
                    await requestFunc()
                } catch (e) {
                    console.log(`Request Container Func Error: ${e}`)
                    remaining.push([attempts + 1, requestFunc])
                }
            }

            // results.forEach((result, index) => {
            //     if (result.status === "rejected") {
            //         const item = batch[index]
            //         item[0]++
            //         if (item[0] < this.maxAttempts) {
            //             remaining.push(item)
            //         }
            //         createNotification("error", "Ошибка выполнения запроса")
            //         console.error("Error while request function!")
            //     }
            // })

            this._requestQueue = [...remaining, ...this._requestQueue]

            if (this.CONNECTED
                && this.SSE
                && this.SSE.stopped
                && !this.SSE.reconnecting
            ) {
                this.SSE.start()
            }
        } finally {
            this._setTimeout()
        }
    }

    _setTimeout() {
        this._removeTimeout()

        this._reconnectTimeout = setTimeout(
            () => { this._runQueue() },
            this.delay * 1000
        )
    }

    _removeTimeout() {
        if (this._reconnectTimeout === null) return

        clearTimeout(this._reconnectTimeout)
        this._reconnectTimeout = null
    }
    
    _setConTrue() {
        this.CONNECTED = true
        disconnectRemove()
    }
    
    _setConFalse() {
        this.CONNECTED = false
        if (this._recoverTimeout) clearTimeout(this._recoverTimeout)
        disconnectSet()
    }

    async _connect() {
        try {
            await fetch(
                `${API_PATH}/`,
                {
                    method: "HEAD",
                    signal: AbortSignal.timeout(4000),
                    cache: "no-store"
                }
            )

            this._setConTrue()
            // console.log("Connection Success")
        } catch (error) {
            this._setConFalse()
            // console.log("Connection Failed")
        }
    }

    stop() {
        if (this.SSE) {
            this.SSE.stop()
            this.SSE.unsubscribe()
        }

        this.STOPPED = true
    }

    queueLength() {
        const copy = [...this._requestQueue]

        let count = 0

        for (const item of copy) {
            if (item[2] !== 'start') count++
        }

        return count + this._activeRequestsCount
    }
}

const requestManager = new RequestContainer()
requestManager.run()


let startRequestsCount
const startFunctions = []


function doneStartRequest(changeName, info, func) {
    let data

    if (info.data !== undefined) {
        try {
            data = info["data"]
            const changeUUID = info["last_change_uuid"]

            requestManager.setLastID(changeName, changeUUID)
        } catch (e) {
            console.error(e)
        }

    } else {
        data = info
    }

    startRequestsCount--
    startFunctions.push([func, data])

    if (startRequestsCount !== 0) return

    for (const [func, data] of startFunctions) {
        func(data)
    }

    initEnd()
}


function setClosePage() {
    const blurs = Array.from(body.querySelectorAll(".background-blur"))

    for (const blur of blurs) {
        body.removeChild(blur)
    }

    const backgroundBlur = document.createElement("div")
    backgroundBlur.className = "background-blur fast"
    backgroundBlur.style.zIndex = 100

    const closePagePanel = document.createElement("div")
    closePagePanel.className = "close-page-panel"

    const closePageText = document.createElement("div")
    closePageText.className = "close-page-text"
    closePageText.textContent = "Связь до этой страницы была удалена или утеряна."

    const closePageButton = document.createElement("button")
    closePageButton.className = "close-page-button"
    closePageButton.textContent = "ОК"

    closePagePanel.append(closePageText, closePageButton)
    backgroundBlur.append(closePagePanel)

    closePageButton.addEventListener("click", () => {
        window.location.href = "first_page.html"
    })

    body.append(backgroundBlur)

    requestManager.stop()
}

const disconnectWarning = document.querySelector(".disconnect-warning")


function disconnectSet() {
    disconnectWarning.classList.add("show")
}

function disconnectRemove() {
    disconnectWarning.classList.remove("show")
}


function initEscapeButton(href) {
    const escapeButton = document.querySelector(".escape")

    escapeButton.addEventListener("click", () => {
        try {
            const len = requestManager.queueLength()
            console.log(len)

            if (len !== 0) {
                setEscapeNotification(len, href)
                return
            }
        } catch (error) {
            console.error(error)
        }

        window.location.href = href
    })
}


function setEscapeNotification(queueLength, href) {
    const backgroundBlur = document.createElement("div")
    backgroundBlur.className = "background-blur fast"
    backgroundBlur.style.zIndex = "1000"

    const escapeNotification = document.createElement("div")
    escapeNotification.className = "escape-notification"

    const escapeNotificationHead = document.createElement("div")
    escapeNotificationHead.className = "escape-notification-head"

    const escapeNotificationEscape = document.createElement("div")
    escapeNotificationEscape.className = "escape-notification-escape"
    escapeNotificationEscape.innerHTML = SVG.x

    const escapeNotificationBody = document.createElement("div")
    escapeNotificationBody.className = "escape-notification-body"

    const escapeNotificationWarning = document.createElement("div")
    escapeNotificationWarning.className = "escape-notification-warning"
    escapeNotificationWarning.innerHTML = "Вы уверены, что хотите покинуть страницу?"

    function pluralize(number, titles) {
        const lastTwoDigits = number % 100
        const lastDigit = number % 10

        let wordForm = titles[2]

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            wordForm = titles[2]
        } else if (lastDigit === 1) {
            wordForm = titles[0]
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            wordForm = titles[1]
        }

        return wordForm
    }

    const escapeNotificationText1 = document.createElement("div")
    escapeNotificationText1.className = "escape-notification-text1"
    escapeNotificationText1.innerHTML = `<strong>${queueLength}</strong> ${pluralize(queueLength, ['запрос', 'запроса', 'запросов'])} все ещё не ${pluralize(queueLength, ['дошёл', 'дошли', 'дошли'])} до сервера.`

    const escapeNotificationText2 = document.createElement("div")
    escapeNotificationText2.className = "escape-notification-text2"
    escapeNotificationText2.innerHTML = `Некоторые проделанные вами изменения могли не примениться и будут безвозвратно утеряны.`

    const escapeNotificationButtons = document.createElement("div")
    escapeNotificationButtons.className = "escape-notification-buttons"

    const escapeNotificationOk = document.createElement("div")
    escapeNotificationOk.className = "escape-notification-ok"

    const escapeNotificationOkText = document.createElement("span")
    escapeNotificationOkText.textContent = "Ок"

    const escapeNotificationCancel = document.createElement("div")
    escapeNotificationCancel.className = "escape-notification-cancel"

    const escapeNotificationCancelText = document.createElement("span")
    escapeNotificationCancelText.textContent = "Отмена"

    escapeNotificationHead.append(escapeNotificationEscape)

    escapeNotificationBody.append(escapeNotificationWarning,
                                  escapeNotificationText1,
                                  escapeNotificationText2)

    escapeNotificationOk.append(escapeNotificationOkText)
    escapeNotificationCancel.append(escapeNotificationCancelText)
    escapeNotificationButtons.append(escapeNotificationOk, escapeNotificationCancel)

    escapeNotification.append(escapeNotificationHead, escapeNotificationBody, escapeNotificationButtons)

    backgroundBlur.append(escapeNotification)

    body.append(backgroundBlur)

    function clear() {
        body.removeChild(backgroundBlur)
    }

    escapeNotificationOk.addEventListener("click", () => {
        clear()
        window.location.href = href
    })

    escapeNotificationEscape.addEventListener("click", clear)

    escapeNotificationCancel.addEventListener("click", clear)
}


function createPinFilesPanel(type, rowContent, viewOnly = false, sendLaterContainer = null) {
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

    pinFilesPanelHeader.append(pinFilesPanelName)

    if (!viewOnly && !sendLaterContainer) {
        const pinFilesCellUpdate = document.createElement("div")
        pinFilesCellUpdate.className = "pin-files-cell-update active-button"
        pinFilesCellUpdate.textContent = "Обновить"

        const pinFilesCellUpdateIcon = document.createElement("div")
        pinFilesCellUpdateIcon.className = "pin-files-cell-update-icon"
        pinFilesCellUpdateIcon.innerHTML = SVG.again

        pinFilesCellUpdate.append(pinFilesCellUpdateIcon)

        pinFilesPanelHeader.append(pinFilesCellUpdate)

        pinFilesCellUpdate.addEventListener("click", () => {
            if (pinFilesCellUpdate.classList.contains("clicked")) return

            pinFilesCellUpdate.classList.add("clicked")
            pinFilesCellUpdate.addEventListener("animationend", () => {
                pinFilesCellUpdate.classList.remove("clicked")
            }, { once: true })

            pinFilesCellFiles.update()
        })
    } else {
        pinFilesPanelEscape.style.marginLeft = "auto"
    }

    pinFilesPanelHeader.append(pinFilesPanelEscape)

    const pinFilesCellFiles = constructPinFilesCell("files", type, rowContent, viewOnly, sendLaterContainer)
    pinFilesPanelFooter.append(pinFilesCellFiles)

    if (!viewOnly) {
        const pinFilesCellAudio = constructPinFilesCell("audio")
        const pinFilesCellVideo = constructPinFilesCell("video")

        pinFilesPanelFooter.append(pinFilesCellAudio, pinFilesCellVideo)
    }

    pinFilesPanel.append(pinFilesPanelHeader, pinFilesPanelFooter)
    pinFilesPanelWrapper.append(pinFilesPanel)

    body.style.overflow = "hidden"
    body.append(pinFilesPanelWrapper)

    pinFilesPanelEscape.addEventListener("click", () => {
        body.style.overflow = "auto"
        body.removeChild(pinFilesPanelWrapper)
    })
}

function constructPinFilesCell(addClass, type, rowContent, viewOnly, sendLaterContainer) {
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

        const filePanelWrapper = document.createElement("div")
        filePanelWrapper.className = "files-panel-wrapper"

        const filePanel = document.createElement("div")
        filePanel.className = "files-panel"

        let firstFlag = true

        pinFilesDownloading.append(pinFilesDownloadingLine)

        editPanel.append(closeButton)

        if (!viewOnly) {
            const deleteButton = document.createElement("button")
            deleteButton.className = "delete-button"
            deleteButton.innerHTML = SVG.delete

            deleteButton.addEventListener("click", async () => {
                if (!canChange) {
                    cantChange()
                    return
                }

                if (isRemoveFiles) return true
                isRemoveFiles = true

                startDownload()

                if (!sendLaterContainer) {
                    const response = await removeFilesFromInput(findClicked(true))

                    if (!response) {
                        createNotification("error", "Ошибка отправки данных")
                    }
                } else {
                    const uuids = findClicked(true)
                    const indexes = findClicked(false)

                    for (const uuid of uuids) {
                        filesData.delete(
                            { uuid: uuid },
                            1
                        )

                        delete localFiles[uuid]
                    }

                    for (const index of indexes) {
                        sendLaterContainer.pop(index)
                    }
                }

                renderFiles()

                endDownload()

                isRemoveFiles = false
            })

            editPanel.append(deleteButton)
        }
        editPanel.append(downloadButton, playButton, clickedCounter)

        pinFilesCellHeader.append(editPanel, pinFilesDownloading, pinFilesCellCounter)

        const realInput = document.createElement("input")
        realInput.type = "file"
        realInput.style.display = "none"
        realInput.multiple = true

        // uuid, userName
        const filesData = new SmartContainer()
        const localFiles = {}

        let isGetFiles = false

        let downloadLevel = 0

        pinFilesCell.update = () => {
            getFiles(true)
        }
        getFiles()

        function startDownload() {
            downloadLevel++
            if (downloadLevel > 0) pinFilesDownloading.classList.add("active")
        }

        function endDownload() {
            downloadLevel--
            if (downloadLevel <= 0) pinFilesDownloading.classList.remove("active")
        }

        async function getFiles(clear) {
            if (isGetFiles) return
            isGetFiles = true

            startDownload()

            if (!sendLaterContainer) {
                const result = await getFilesFromBase(clear)

                if (!result) {
                    createNotification("error", "Файлы не были загружены")
                }
            } else {
                for (const file of sendLaterContainer) {
                    const uuid = crypto.randomUUID()

                    localFiles[uuid] = file
                    filesData.create({
                        uuid: uuid,
                        userName: file.name,
                    })
                }


                renderFiles()
            }

            endDownload()
            isGetFiles = false
        }

        async function getFilesFromBase(clear) {
            try {
                const info = {
                    zn_number: znNumber,
                }

                if (type === "rec") {
                    info.type = type
                } else if (type === "parts" || type === "jobs") {
                    info.type = type
                    info.identical_str = rowContent.dataset.uuid
                } else if (type === "tasks") {
                    info.type = type
                    info.identical_str = rowContent.dataset.uuid
                    delete info.zn_number
                }

                const response = await fetch(`${API_PATH}/files/get`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(info)
                })

                if (!response.ok) {
                    updateCounter()
                    return false
                }

                const {last_change_uuid, data} = await response.json()

                if (clear) {
                    filesData.replace([])
                }

                console.log(data)

                for (const file of data) {
                    filesData.create(file)
                }

                renderFiles()

                return true
            } catch (error) {
                updateCounter()
                console.error(`Get files error: ${error}`)
                createNotification("error", "Не удалось загрузить файлы")
                return false
            }
        }

        if (!viewOnly) {
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
        }

        filePanelWrapper.append(filePanel)
        pinFilesCellFooter.append(realInput, filePanelWrapper)

        realInput.addEventListener("change", async () => {
            if (!canChange) {
                cantChange()
                return
            }

            await fullUploadFiles(realInput.files)
        })

        let isUploadFiles = false

        async function fullUploadFiles(forUUIDS) {
            if (isUploadFiles) return
            isUploadFiles = true

            startDownload()

			try {
				if (forUUIDS && forUUIDS.length) {
                    if (!sendLaterContainer) {
                        const result = await updateUUIDS(forUUIDS)
                        if (!result) {
                            createNotification("error", "Ошибка отправки данных")
                        }


                    } else {
                        for (const file of forUUIDS) {
                            const uuid = crypto.randomUUID()

                            localFiles[uuid] = file
                            filesData.create({
                                uuid: uuid,
                                userName: file.name,
                            })

                            sendLaterContainer.push(file)
                        }
                    }
                    renderFiles()
				}
			} finally {
				endDownload()
				isUploadFiles = false
			}
        }

        closeButton.addEventListener("click", () => {
            unclickAll()
        })

        let isRemoveFiles = false

        downloadButton.addEventListener(("click"), () => {
            if (!canChange) {
                cantChange()
                return
            }

            startDownload()

            try {
                downloadFiles(findClicked(true))
            } finally {
                endDownload()
            }

            unclickAll()
        })

        function findClicked(uuids = false) {
            const indexes = []

            for (const file of Array.from(filePanel.children)) {
                if (file.classList.contains("clicked")) {
                    uuids
                        ? indexes.push(file.dataset.uuid)
                        : indexes.push(Number(file.dataset.index))
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

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const uuid = uuids[i]

                const fileData = {
                    uuid: uuid,
                    userName: file.name,
                }

                if (type === "zn") {
                    fileData.type = type
                    if (file.identicalStr) {
                        fileData.identicalStr = file.identicalStr
                    }
                }

                filesData.create(fileData)

                localFiles[uuid] = file
            }

            return true
        }

        function renderFiles() {
            filePanel.innerHTML = ""

            const currentData = filesData.data()

            for (let index = 0; index < currentData.length; index++) {
                const file = currentData[index]

                if (type !== "zn") file.type = undefined

                filePanel.append(
                    constructFile(
                        index,
                        file,
                    )
                )
            }

            updateCounter()
            resetClickedCounter()
        }

        function updateCounter() {
            const count = filePanel.children.length
            const func = count === 0 ? hasNotFiles : hasFiles
            let pinFiles

            if (type === "zn") {
                pinFiles = headerPinFiles
                znHasOwnFiles = filesData.select({ type: "zn" }, null, 1).length !== 0
            } else if (type === "rec")  {
                pinFiles = recPinFiles
            } else if (type === "tasks") {
                pinFiles = rowContent.querySelector(".pin-files")
            } else {
                pinFiles = rowContent.querySelector(".pin-files")

                const smartData = type === "jobs" ? jobsData : partsData

                smartData.update(
                    { hasFiles: count !== 0 },
                    { uuid: rowContent.dataset.uuid },
                    1
                )
            }

            func(pinFiles)

            pinFilesCellCounter.textContent = count
        }

        playButton.addEventListener("click", async () => {
            const clickedList = findClicked(true)

            if (clickedList.length !== 1) {
                createNotification("error", "Ошибка выбранных файлов")
                return
            }

            await recoverFiles(clickedList)

            const uuid = clickedList[0]
            const file = localFiles[uuid]
            const fileInfo = filesData.select(
                { uuid: uuid },
                null,
                1
            )[0]

            const extension = getFileExtension(fileInfo).toLowerCase()

            let type

            if (EXTENSIONS.audio.includes(extension)) {
                type = "audio"
            } else if (EXTENSIONS.video.includes(extension)) {
                type = "video"
            } else {
                createNotification("error", "Ошибка выбранных файлов")
                return
            }

            createRecordPanel(type, false, file, fileInfo)
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

        async function removeFilesFromInput(uuids) {
            if (!uuids) return false

            try {
                const response = await fetch(
                    `${API_PATH}/files/delete`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            uuids: uuids,
                            mechanic: mechanic,
                            post: post,
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client-ID': MY_UUID,
                            'X-Change-UUID': generateUUIDv7(),
                        },
                    }
                )

                if (!response) return false

                for (const uuid of uuids) {
                    if (type === "zn") {
                        filesData.delete(
                            { uuid: uuid },
                            1,
                            (value) => {
                                if (value.type === "zn") return

                                if (filesData.select(
                                    { type: value.type, identicalStr: value.identicalStr },
                                    ["uuid"],
                                    1,
                                ).length === 0) {
                                    if (value.type === "jobs" || value.type === "parts") {
                                        const smartData = value.type === "jobs"
                                            ? jobsData
                                            : partsData
                                        const updator = value.type === "jobs"
                                            ? updateJobsTable
                                            : updatePartsTable

                                        smartData.update(
                                            { hasFiles: false },
                                            { uuid: value.identicalStr },
                                            1
                                        )

                                        updator()
                                    } else {
                                        hasNotFiles(recPinFiles)
                                    }
                                }
                            }
                        )
                    } else {
                        filesData.delete(
                            { uuid: uuid },
                            1,
                        )
                    }

                    delete localFiles[uuid]
                }

                renderFiles()

                return true
            } catch (error) {
                console.error("Remove Files Error:", error)
                return false
            }
        }

        async function recoverFiles(uuids) {
            if (!uuids) return

            const forDownload = []
            const currentUUIDS = Object.keys(localFiles)

            for (const uuid of uuids) {
                if (currentUUIDS.indexOf(uuid) !== -1) continue

                forDownload.push(uuid)
            }

            if (forDownload.length) {
                const response = await fetch(`${API_PATH}/files/download`, {
                    method: "POST",
                    body: JSON.stringify({
                        uuids: forDownload,
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                const archiveBlob = await response.blob()

                const zip = await JSZip.loadAsync(archiveBlob)

                const fileEntries = Object.entries(zip.files)

                for (let i = 0; i < forDownload.length; i++) {
                    const uuid = forDownload[i]
                    const [pathInZip, zipEntry] = fileEntries[i]

                    const blob = await zipEntry.async("blob")

                    localFiles[uuid] = new File([blob], name, {
                        type: blob.type || "application/octet-stream",
                        lastModified: Date.now()
                    })
                }
            }
        }

        async function downloadFiles(uuids) {
            try {
                if (!uuids) return

                await recoverFiles(uuids)

                for (const uuid of uuids) {
                    const file = localFiles[uuid]
                    const fileInfo = filesData.select(
                        { uuid: uuid },
                        null,
                        1
                    )[0]

                    const link = document.createElement("a")
                    const url = URL.createObjectURL(file)

                    link.href = url
                    link.download = fileInfo.userName

                    filePanel.appendChild(link)
                    link.click()
                    filePanel.removeChild(link)

                    URL.revokeObjectURL(url)
                    await new Promise((resolve) => setTimeout(resolve, 300))
                }
            } catch (error) {
                console.error("Download files Error:", error)
                createNotification("error", "Ошибка загрузки")
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

function createRecordPanel(addClass, addButtons, appendFile, fileInfo) {
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

    if (!addButtons) {
        const recordFileName = document.createElement("span")
        recordFileName.className = "record-file-name"
        recordFileName.textContent = getFileName(fileInfo)

        recordDisplay.append(recordFileName)
    }

    const pinFilesCellEscape = document.createElement("button")
    pinFilesCellEscape.className = "pin-files-panel-escape"
    pinFilesCellEscape.innerHTML = SVG.x
    pinFilesCellEscape.style.marginLeft = "auto"

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
                console.error(`Error code: ${e.code}`)
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

function constructFile(index, realFile) {
    const file = document.createElement("div")
    file.className = "file"
    file.dataset.index = index
    file.dataset.uuid = realFile.uuid
    file.dataset.identicalStr = realFile.identicalStr

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

    // const fileWeight = document.createElement("span")
    // fileWeight.className = "file-weight"
    // fileWeight.innerHTML = constructFileSize(realFile)

    fileAddInfo.append(fileExtension) // fileWeight
    fileInfo.append(fileName, fileAddInfo)

    file.append(fileIcon)

    if (realFile.type) {
        file.style.gridTemplateColumns = "min-content min-content 1fr"
        file.append(constructFileTypeIcon(realFile.type))
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
            headers: {
                'X-Client-ID': MY_UUID,
                'X-Change-UUID': generateUUIDv7(),
            },
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
    const dotIndex = file.userName.lastIndexOf('.')
    if (dotIndex <= 0) return file.userName
    return file.userName.slice(0, dotIndex)
}

function getFileExtension(file) {
    const dotIndex = file.userName.lastIndexOf('.')
    if (dotIndex <= 0) return '?'
    return file.userName.slice(dotIndex + 1).toLowerCase()
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

function hasFiles(pinFiles) {
    if (!pinFiles.classList.contains("has-files")) {
        pinFiles.classList.add("has-files")
    }
    headerPinFiles.classList.add("has-files")
}

function checkHasFiles(pinFiles) {
    return pinFiles.classList.contains("has-files")
}

function snakeToCamelCase(text) {
    const massive = Array.from(text.toLowerCase())
    const newText = []

    let makeHigh = false

    for (let char of massive) {
        if (char === "_") {
            makeHigh = true
            continue
        }

        if (makeHigh) {
            makeHigh = false
            char = char.toUpperCase()
        }

        newText.push(char)
    }

    return newText.join("")
}