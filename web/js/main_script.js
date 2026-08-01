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
    arrowRight: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Стрелка влево\"> <path d=\"M36 24H14\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/> <path d=\"M22 16L14 24L22 32\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',
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
    job: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 19 8.5-8.5"/><path d="M14.5 4.5a4 4 0 0 0-4.8 5.8L4.6 15.4a2.5 2.5 0 0 0 3.5 3.5l5.1-5.1a4 4 0 0 0 5.8-4.8l-2.7 2.7-2.5-.5-.5-2.5z"/><circle cx="6.4" cy="17.1" r=".6"/></svg>',
    part: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5H6a2 2 0 0 0-2 2v13h16V7a2 2 0 0 0-2-2h-2"/><rect x="8" y="3" width="8" height="4" rx="1.5"/><path d="M8 11h8M8 15h8"/></svg>',
    rec: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m8 11 2.5 2.5L16 8"/></svg>',
}

const $notification = document.createElement("div")
$notification.className = "notification"

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

$notificationText.append($notificationMainTextElement, $notificationAddTextElement)
$notification.append($notificationIcon, $notificationText, $notificationClose)

$notificationClose.addEventListener("click", () => {
    clearTimeout(hideTimer)
    clearTimeout(removeClassTimer)

    $notification.classList.remove('show')
})

body.append($notification)

let hideTimer
let removeClassTimer

// const baseUrl = window.location.origin;
//
// const API_PATH = baseUrl + ':8000/api/web';

const API_PATH = "http://192.168.50.95:8000/api/web";

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

    $notification.classList.add("show")
    $notification.classList.remove("hide")

    hideTimer = setTimeout(() => {
        $notification.classList.remove('show');
        $notification.classList.add('hide');
    }, 5000);

    removeClassTimer = setTimeout(() => {
        $notification.classList.remove('hide');
    }, 5800);
}


function setLoading() {
    body.append(createLoading())
}

function clearLoading() {
    body.removeChild(body.querySelector(".background-blur"))
}

function createLoading() {
    const backgroundBlur = document.createElement("div")
    backgroundBlur.className = "background-blur"

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
                    console.error(response.statusText)
                    createNotification("warning", "На сервере произошла ошибка")
                }
                break
            default:
                console.error(`Unexpected code: ${code}`)
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
        forFind=null,
        forSelect=null,
        limit=null
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
                    if (row[key] !== value) {
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

    update(
        forUpdate,
        forFind=null,
        limit=null,
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

    delete(
        forFind,
        limit=null,
    ) {
        let count = 0

        outerLoop:
        for (const row of this._data) {
            for (const [key, value] of Object.entries(forFind)) {
                    if (row[key] !== value) {
                        continue outerLoop
                    }
                }

            count++

            if (limit && limit === count)
                break
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
}


class Queue {
    constructor() {
        this._items = {}
        this._head = 0
        this._tail = 0
    }

    push(element) {
        this._items[this._tail] = element
        this._tail++
    }

    get() {
        if (this.isEmpty()) return undefined

        const item = this._items[this._head]
        delete this._items[this._head]
        this._head++

        return item
    }

    isEmpty() {
        return this._tail - this._head === 0
    }

    size () {
        return this._tail - this._head
    }
}


class SmartSSESource {
    constructor(type, uuid) {
        this._type = type
        this._uuid = uuid

        this._controller = null

        this._sseEvents = {}
        this._serverEvents = {}

        this._lastId = null
        this._retry = 3000

        this._stopped = true
        this._reconnecting = false

        this.STOPPED = {}
        this.LOST_CONNECTION = {}

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
            const headers = {
                'Content-Type': 'application/json',
            }

            if (this._lastId !== null) {
                headers["Last-Event-ID"] = this._lastId
            }

            const response = await fetch(
                `${API_PATH}/sse/connect/${this._type}/${this._uuid}`,
                {
                    method: 'GET',
                    signal: this._controller.signal,
                    headers: headers
                }
            )

            if (Object.keys(this._serverEvents).length) {
                await smartSendRequest(
                    `sse/subscribe/events/${this._uuid}`,
                    "POST",
                    this._serverEvents
                )
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            console.log("SSE connected")

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
            if (this._stopped) return this.STOPPED
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

    _handleEvent({ event, data, id, retry }) {
        console.log(event)

        if (this._sseEvents[event] !== undefined) {
            for (const func of this._sseEvents[event]) {
                try {
                    func(data)
                } catch (error) {
                    console.error(`SSE Function ${func} on Event: ${event} Error: ${error}`)
                }
            }
        }

        if (id != null) this._lastId = id
        if (retry != null) this._retry = retry
    }

    async start() {
        try {
            console.log("SSE starting...")

            this._stopped = false

            await this._connect()

            // if (result === this.STOPPED) {
            //     return this.STOPPED
            // } else if (result === this.LOST_CONNECTION) {
            //     this._stopped = false
            //     this._reconnecting = true
            //
            //     console.log("SSE reconnecting...")
            //
            //     setTimeout(() => {
            //         this.start()
            //     }, this.delay * 1000)
            // }
        } catch (e) {
            console.error(`Error while starting SSE connection: ${e}`)
        }
    }

    stop() {
        this._stopped = true
        this._controller.abort()

        console.log("SSE stopped")
    }

    addSSEEvent(name, func) {
        if (this._stopped) return

        function eventReact(data) {
            func(data)
        }

        if (this._sseEvents[name] === undefined) {
            this._sseEvents[name] = []
        }

        this._sseEvents[name].push(eventReact)
    }

    removeSSEEvent(name) {
         if (this._stopped) return

        if (this._sseEvents[name] === undefined) return

        delete this._sseEvents[name]
    }

    // data format: dict[str, null | str | list[str]]
    async subServerEvents(data) {
        try {
            const result = await smartSendRequest(
                `sse/subscribe/events/${this._uuid}`,
                "POST",
                data
            )

            if (result !== true) {
                console.error(`SSE subscribe events Error`)
            }

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

                this._serverEvents = [...this._serverEvents[event], ...addInfo]
            }
        } catch (error) {
            console.error(`SSE subscribe events Error: ${error}`)
        }
    }

    // data format: dict[str, null | str | list[str]]
    async unsubServerEvents(data) {
        try {
            const result = await smartSendRequest(
                `sse/unsubscribe/events/${this._uuid}`,
                "POST",
                data
            )

            if (result !== true) {
                console.error(`SSE unsubscribe events Error`)
            }

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
        this._requestQueue = new Queue()

        this._reconnectTimeout = null
        this.delay = 10

        this.CONNECTED = true

        this.SSE = null
    }

    async send({
            addURL,
            method,
            data = null,
            headers = {},
            credentials = "omit",
            timeout = 3,
            func = null,
            onErrorsFuncs = null,
            changeUUID = false,
       }) {
        let body
        if (typeof data === 'string') {
            body = data
        } else if (data != null) {
            body = JSON.stringify(data)
        } else {
            body = null
        }

        if (changeUUID) {
            headers['Change-UUID'] = generateUUIDv7()
        }

        async function fetchInvoker() {
            const response = await fetch(
                `${API_PATH}/${addURL.replace(/^\/+/, "")}`,
                {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Client-Id': MY_UUID,
                        ...headers
                    },
                    body: body,
                    credentials: credentials,
                    signal: AbortController.timeout(timeout * 1000)
                }
            )

            if (!response.ok) {
                if (!onErrorsFuncs
                    || Object.keys(onErrorsFuncs).indexOf(response.status) === -1) return

                const find = onErrorsFuncs[response.status]

                if (typeof find === "function") {
                    find(response)
                } else {
                    for (const func of find) {
                        func(response)
                    }
                }

                return
            }

            if (typeof func === "function") {
                let data
                try {
                    data = await response.json()
                } catch (e) {
                    data = response.body
                }

                func(data)
            }
        }

        try {
            await fetchInvoker()

            this.CONNECTED = true
            if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout)

            this._runQueue()

        } catch (error) {
            this._requestQueue.push(fetchInvoker)

            this.CONNECTED = false
            if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout)

            this._setTimeout()
        }
    }

    async _runQueue() {
        if (!this.CONNECTED) {
            await this._connect()

            if (!this.CONNECTED) {
                this._setTimeout()
                return
            }
        }

        while (!this._requestQueue.isEmpty()) {
            const requestInvoker = this._requestQueue.get()

            try {
                await requestInvoker()
            } catch (e) {
                this.CONNECTED = false
                this._setTimeout()
            }
        }

        if (this.SSE && this.CONNECTED) this.SSE.start()
    }

    _setTimeout() {
        this._reconnectTimeout = setTimeout(
            this._runQueue(),
            this.delay * 1000
        )
    }

    async _connect() {
        try {
            await fetch(
                API_PATH,
                {
                    method: "HEAD",
                    signal: AbortSignal.timeout(4000),
                    cache: "no-store"
                }
            )

            this.CONNECTED = true
        } catch (error) {
            this.CONNECTED = false
        }
    }
}