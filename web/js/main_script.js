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
    picture: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-4 4-2-2-5 5"/></svg>',
    video: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3z"/><path d="M9 9l4 3-4 3z"/></svg>',
    audio: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/></svg>',
    archive: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v4h6V3"/><path d="M12 10h.01"/><path d="M12 13h.01"/><path d="M12 16h.01"/><path d="M10 19h4"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none"><path d=\"M8 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19V5A1.5 1.5 0 0 1 8.5 3.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M14 3.5V8h4\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M9 12.5h6M9 16h6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>',

    war: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.5L13.7 4.2a2 2 0 0 0-3.4 0Z\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/></svg>",
    ok: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">\n <path d="M7 12.5L10.2 15.7L17.5 8.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>',
    x: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19" /><line x1="5" y1="19" x2="19" y2="5" /></svg>',
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
// const API_PATH = baseUrl + ':8000';

const API_PATH = "http://192.168.50.95:8000";

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

async function sendRequestToServer(url, method, data, notJson) {
    try {
        const response = await fetch(`${API_PATH}/` + url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data != null ? JSON.stringify(data) : null
        })

        if (!response.ok) return undefined
        if (!notJson) {
            return await response.json()
        } else {
             return response
        }

    } catch (error) {
        console.error("Ошибка:", error)
        return null
    }
}


async function getSmth(
    url,
    method,
    on200,
    on404,
    on500,
    onError
) {
    try {
        let newContent = null
        let cycles = 0
        
        while (!newContent) {
            if (cycles === 3) {
                createNotification("error", "Нет связи с сервером")
                deleteLoading()
                return false
            }
            if (cycles > 1) {
                createNotification("error", "Нет ответа от сервера")
            }

            newContent = await sendRequestToServer(url, method)
            cycles++
        }

        const code = newContent.code
        const data = newContent.data

        switch (code) {
            case 200:
                if (on200) on200(data)
                break
            case 404:
                if (on404) on404()
                // (on404)
                //     ? on404()
                //     : createNotification("error", "Сервер не нашёл данные")
                break
            case 500:
                (on500)
                    ? on500()
                    : createNotification("error", "Ошибка обработки данных")
                break
            default:
                console.error(`Unexpected code: ${code}`)
        }
        return true
    } catch (e) {
        console.error(`Get Error: ${e}`)

        (onError)
            ? onError()
            : createNotification("error", "Неизвестная ошибка")

        return true
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