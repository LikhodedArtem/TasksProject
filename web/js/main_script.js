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
    job: '<svg viewBox="1 1 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.12 20.75C5.36 20.75 4.64 20.45 4.09 19.91C2.97 18.79 2.97 16.98 4.09 15.86L9.6 10.35C9.1 8.40997 9.64 6.31997 11.06 4.89997C12.49 3.46997 14.59 2.90997 16.54 3.43997C16.8 3.50997 17 3.70997 17.07 3.96997C17.14 4.22997 17.07 4.49997 16.88 4.68997L14.43 7.13997L14.95 9.04997L16.86 9.56997L19.31 7.11997C19.5 6.92997 19.78 6.85997 20.03 6.92997C20.29 6.99997 20.49 7.19997 20.56 7.45997C21.09 9.40997 20.54 11.51 19.1 12.94C17.68 14.36 15.59 14.9 13.65 14.4L8.14 19.91C7.6 20.45 6.88 20.75 6.12 20.75ZM14.68 4.76997C13.72 4.84997 12.81 5.26997 12.11 5.96997C10.97 7.10997 10.6 8.77997 11.15 10.32C11.25 10.59 11.18 10.9 10.97 11.1L5.14 16.93C4.61 17.46 4.61 18.33 5.14 18.86C5.4 19.12 5.74 19.26 6.11 19.26C6.47 19.26 6.82 19.12 7.07 18.86L12.9 13.03C13.11 12.82 13.41 12.76 13.68 12.85C15.22 13.39 16.89 13.03 18.03 11.89C18.73 11.19 19.14 10.28 19.23 9.31997L17.6 10.95C17.41 11.14 17.13 11.21 16.87 11.14L14.13 10.39C13.87 10.32 13.67 10.12 13.6 9.85997L12.85 7.11997C12.78 6.85997 12.85 6.57997 13.04 6.38997L14.67 4.75997L14.68 4.76997Z" fill="currentColor"/></svg>',
    part: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://w3.org"><circle cx="12" cy="12" r="4" /><path d="M10.5 2h3l.5 2.5c.6.2 1.1.5 1.6.9l2.4-1 2.1 2.1-1 2.4c.4.5.7 1 1 1.6l2.5.5v3l-2.5.5c-.2.6-.5 1.1-.9 1.6l1 2.4-2.1 2.1-2.4-1c-.5.4-1 .7-1.6 1l-.5 2.5h-3l-.5-2.5c-.6-.2-1.1-.5-1.6-.9l-2.4 1-2.1-2.1 1-2.4c-.4-.5-.7-1-1-1.6l-2.5-.5v-3l2.5-.5c.2-.6.5-1.1.9-1.6l-1-2.4 2.1-2.1 2.4 1c.5-.4 1-.7 1.6-1z" /></svg>',
    rec: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m8 11 2.5 2.5L16 8"/></svg>',
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
                    if (id !== "skip") this._lastIDs[idName] = id
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
            func(data)
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
    }

    run() {
        this._runQueue()
    }

    async send(
        addURL,
        method,
        {
            data = null,
            headers = {},
            credentials = "omit",
            timeout = 3,
            okFunc = null,
            anywayFunc = null,
            errorsFuncs = null,
            changeUUID = false,
            rawResponse = false,
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
            headers['X-Change-UUID'] = generateUUIDv7()
        }

        async function fetchInvoker() {
            try {
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
            this._requestQueue.push([0, fetchInvoker])

            // console.log(`Function Failed by reason: ${error}`)
        }
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
    if (!disconnectWarning) return
    disconnectWarning.style.transition = "none"
    disconnectWarning.style.display = "flex"

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            disconnectWarning.style.transition = "opacity var(--transition-slow)"
            disconnectWarning.style.opacity = "1"
        })
    })
}

function disconnectRemove() {
    if (!disconnectWarning) return
    disconnectWarning.style.opacity = "0"

    disconnectWarning.addEventListener(
        "transitionend",
        () => { disconnectWarning.style.display = "none" },
        { once: true }
    )
}


function initEscapeButton(href) {
    const escapeButton = document.querySelector(".escape")

    escapeButton.addEventListener("click", () => {
        window.location.href = href
    })
}