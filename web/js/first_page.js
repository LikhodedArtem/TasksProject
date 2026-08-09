const selects = document.querySelectorAll(".select");

const territorySelect = document.querySelector("#territorySelect")
const postInput = document.querySelector("#postInput")
const nameInput = document.querySelector("#nameInput")
const time = document.querySelector("#time")

const postsData = new SmartContainer()
let postsDataM = null
let postsDataK = null
const mechanicsData = new SmartContainer()

let sseSource = null


async function start() {
    initEscapeButton("index.html")
    initTime()

    setLoading()

    initStart()
}


startRequestsCount = 2


async function initStart() {
    await initSSE()

    await getPosts()
    await getMechanics()
}

async function initEnd() {
    initSuggestsPanels()
    updatePosts()

    returnCookieData()

    clearLoading()
}


function returnCookieData() {
    const data = Cookie.getGroup([
        "mechanic", "territory", "post"
    ], true)

    if (data.territory) {
        if (data.territory === "Мысхако") {
            territorySelect.selectedIndex = 0
        } else {
            territorySelect.selectedIndex = 1
        }

        territorySelect.updateOptions()
        updatePosts()
    }
    if (data.mechanic) { nameInput.value = data.mechanic }
    if (data.post) { postInput.value = data.post }
}


function initTime() {
    function updateTime() {
        time.textContent = createReadableDate(Math.floor(Date.now() / 1000))
    }

    updateTime()
    setInterval(updateTime, 1000)
}


async function getPosts() {
    await getPostsMechanicsData(false)
}


async function getMechanics() {
    await getPostsMechanicsData(true)
}


async function getPostsMechanicsData(mechanics) {
    let type
    let func

    if (mechanics) {
        type = "mechanics"
        func = updateMechanicsData
    } else {
        type = "posts"
        func = updatePostsData
    }

    await requestManager.send(
        `info/${type}`,
        "GET",
        {
            okFunc: (data) => {
                doneStartRequest(type, data, (data) => {
                    func(data)
                })
            },
            errorsFuncs: {
                404: (data) => {
                    doneStartRequest(type, data, (data) => {
                        func([])
                    })
                }
            }
        }
    )
}

function updatePosts() {
    if (territorySelect.value === "Кирилловка") {
        postSuggestPanel.changeData(postsDataK)
    } else if (territorySelect.value === "Мысхако") {
        postSuggestPanel.changeData(postsDataM)
    } else {
        postSuggestPanel.changeData([])
    }
}


function updatePostsData(newData) {
    postsData.replace(newData)
    postsDataM = postsData.select({ territory: "Мысхако" }, ["name"])
    postsDataK = postsData.select({ territory: "Кирилловка" }, ["name"])
}


function updateMechanics() {
    nameInput.changeData(mechanicsData.select(null, ["name"]))
    nameInput.updateOptions()
}


function updateMechanicsData(newData) {
    mechanicsData.replace(newData)
}


selects.forEach((select) => {
    const realSelect = select.querySelector("select")
    realSelect.style.display = "none"

    const selectPanel = document.createElement("div")
    selectPanel.className = "select-panel closed"

    const selectHeader = document.createElement("header")
    selectHeader.className = "select-part head"

    const selectHeaderValue = document.createElement("div")
    selectHeaderValue.className = "select-header-value"

    const selectHeaderIcon = document.createElement("div")
    selectHeaderIcon.className = "select-header-icon"
    selectHeaderIcon.innerHTML = SVG.open

    const selectFooter = document.createElement("footer")
    selectFooter.className = "select-part bottom"

    selectHeaderValue.append(constructSelectOption(realSelect.value))
    selectHeader.append(selectHeaderValue, selectHeaderIcon)

    function updateSelectHeaderValue(text) {
        selectHeaderValue.innerHTML = ""
        selectHeaderValue.append(constructSelectOption(text))
    }

    let firstTime = true

    function updateOptions() {
        selectFooter.innerHTML = ""

        if (firstTime) {
            realSelect.selectedIndex = -1

            updateSelectHeaderValue("Не выбрано...")

            for (const option of realSelect.options) {
                selectFooter.append(
                    constructSelectOption(
                        option.value,
                        false
                    )
                )
            }
            firstTime = false
        } else {
            updateSelectHeaderValue(realSelect.value)

            for (const option of realSelect.options) {
                selectFooter.append(
                    constructSelectOption(
                        option.value,
                        option === realSelect.options[realSelect.selectedIndex]
                    )
                )
            }
        }

        setFooterState()
        syncPanelWidth()
    }

    realSelect.updateOptions = updateOptions

    selectPanel.append(selectHeader, selectFooter);
    select.append(selectPanel);

    function setFooterState() {
        selectFooter.style.height = "";
        selectFooter.classList.remove("scrollable");

        if (realSelect.options.length > 4) {
            selectFooter.classList.add("scrollable");
        } else {
            selectFooter.style.height = `${realSelect.options.length * 3.3 + 0.8}rem`;
        }
    }

    function syncPanelWidth() {
        requestAnimationFrame(() => {
            const width = selectFooter.offsetWidth
            if (width > 0) {
                selectPanel.style.width = `${width}px`
            }
        })
    }

    function updateSelectPanel(choose) {
        updateSelectHeaderValue(realSelect.value)

        for (const option of selectFooter.children) {
            option.classList.toggle("selected", option === choose)
        }

        syncPanelWidth()

        if (realSelect === territorySelect) {
            updatePosts()
        }
    }

    updateOptions()

    selectHeader.addEventListener("click", () => {
        const isOpened = selectPanel.classList.contains("opened");
        selectPanel.classList.toggle("opened", !isOpened);
        selectPanel.classList.toggle("closed", isOpened);

        syncPanelWidth()
    });

    selectFooter.addEventListener("click", (event) => {
        const choose = event.target.closest(".select-option")
        if (!choose) return

        realSelect.value = choose.querySelector(".select-option-text").textContent
        updateSelectPanel(choose)

        closeSelect(selectPanel, selectFooter)
    })

    const observer = new ResizeObserver(() => {
        syncPanelWidth()
    })
    observer.observe(selectFooter)

    select.close = () => { closeSelect(selectPanel, selectFooter) }
})




function closeSelect(selectPanel, selectFooter) {
    selectFooter.classList.add("no-transition");
    selectPanel.classList.remove("opened");
    selectPanel.classList.add("closed");

    void selectPanel.offsetWidth;

    selectFooter.classList.remove("no-transition");
}


function constructSelectOption(text, isChoose) {
    const selectOption = document.createElement("div")
    selectOption.className = "select-option"

    const selectOptionText = document.createElement("span")
    selectOptionText.className = "select-option-text"
    selectOptionText.innerHTML = text
    if (text === "Не выбрано...") selectOptionText.style.color = "var(--color-text-contrast)"

    const selectOptionIcon = document.createElement("div")
    selectOptionIcon.className = "select-option-icon"
    selectOptionIcon.innerHTML = SVG.ok

    if (isChoose) {
        selectOption.classList.add("selected")
    }

    selectOption.append(selectOptionText, selectOptionIcon)
    return selectOption
}

const applyButton = document.querySelector(".active-button");

applyButton.addEventListener("click", () => {
    if (!applyButton.classList.contains("clicked")) {
        if (!nameSuggestPanel.isInData(nameInput.value)
            || !postSuggestPanel.isInData(postInput.value)
            || territorySelect.value === "Не выбрано...") return

        applyButton.classList.add("clicked")

        Cookie.set("mechanic", nameInput.value, { hours: 24 })
        Cookie.set("post", postInput.value, { hours: 24 })
        Cookie.set("territory", territorySelect.value, { hours: 24 })

        setTimeout(() => {
            window.location.href = "second_page.html"
            setTimeout(() => {
                applyButton.classList.remove("clicked")
            }, 100)
        }, 500)
    }
})

const postSuggestPanel = document.querySelector("#postTextInput .suggests-panel")
const nameSuggestPanel = document.querySelector("#nameTextInput .suggests-panel")

const suggestPanels = document.querySelectorAll(".suggests-panel")


function initSuggestsPanels() {
    function initSuggestsPanel(suggestsPanel, data) {
        const textInput = suggestsPanel.closest(".text-input")
        const realInput = textInput.querySelector("input[type=text]")

        function setSuggestPanelState() {
            suggestsPanel.style.height = "";
            suggestsPanel.classList.remove("scrollable");

            const currentLength = Array.from(suggestsPanel.children).length

            if (currentLength > 4) {
                suggestsPanel.classList.add("scrollable");
            }
            else {
                suggestsPanel.style.height = `${currentLength * 3.3 + 0.5}rem`;
            }
        }

        realInput.addEventListener("focus", () => {
            open()
        })

        function open() {
            renderSuggests(data)
            textInput.classList.add("active")
        }

        function close() {
            suggestsPanel.classList.add("no-transition")
            textInput.classList.remove("active")

            void suggestsPanel.offsetWidth

            suggestsPanel.classList.remove("no-transition")
        }

        function markSuggest(realText, realFormat) {
            const text = realText.trim()
            const format = realFormat.trim()

            const startIndex = text.toLowerCase().indexOf(format.toLowerCase())
            const before = text.slice(0, startIndex)
            const formatted = text.slice(startIndex, startIndex + format.length)
            const after = text.slice(startIndex + format.length)
            return `${before}<mark>${formatted}</mark>${after}`
        }

        function renderSuggests(suggests) {
            suggestsPanel.classList.remove("zero")
            suggestsPanel.innerHTML = ""

            suggestsPanel.classList.remove("too-little")

            const currentSuggests = suggests.filter(item => item.toLowerCase().includes(realInput.value.trim().toLowerCase()))

            if (currentSuggests.length) {
                currentSuggests.forEach((item, indx) => {
                    suggestsPanel.append(constructSelectOption(markSuggest(item, realInput.value), false))
                })
            } else {
                suggestsPanel.classList.add("zero")
            }

            setSuggestPanelState()
        }

        realInput.addEventListener("focus", () => {
            renderSuggests(data)
        })

        realInput.addEventListener("input", () => {
            renderSuggests(data)
        })

        suggestsPanel.addEventListener("click", (event) => {
            const suggest = event.target.closest(".select-option")
            if (!suggest) return

            realInput.value = suggest.querySelector(".select-option-text").textContent
            close()
        })

        suggestsPanel.close = close

        function changeData(newData) {
            data = newData
            renderSuggests(newData)
        }

        function isInData(object) {
            return data.indexOf(object) !== -1
        }

        suggestsPanel.changeData = changeData
        suggestsPanel.isInData = isInData
    }

    initSuggestsPanel(nameSuggestPanel, mechanicsData.select(null, ["name"]))
    initSuggestsPanel(postSuggestPanel, [])

    body.addEventListener("click", (event) => {
        const select = event.target.closest(".select")
        const suggest = event.target.closest(".suggests-panel")
        const textInput = event.target.closest(".text-input")

        selects.forEach((s) => { if (s !== select) s.close() })
        suggestPanels.forEach((s) => {
            if (s !== suggest && s.closest(".text-input") !== textInput) s.close()
        })
    })
}


async function initSSE() {
    sseSource = new SmartSSESource("first_page", MY_UUID)
    sseSource.reconnectAddInfo = {}

    function handleUpdate(mechanics, info) {

        const smartData = mechanics ? mechanicsData : postsData
        const primaryKey = mechanics ? "key" : "name"

        for (const row of info) {
            const { type, data } = row
            if (type === "create") {
                smartData.create(data)
            } else if (type === "update") {
                const primary = data[primaryKey]
                delete data[primaryKey]

                smartData.update(
                    data,
                    { primaryKey: primary },
                    1,
                )
            } else {
                smartData.delete(
                    { primaryKey: data[primaryKey] },
                    1
                )
            }
        }
    }

    function handlePosts(info) {
        handleUpdate(false, info["data"])
        postsDataM = postsData.select({ territory: "Мысхако" }, ["name"])
        postsDataK = postsData.select({ territory: "Кирилловка" }, ["name"])
        updatePosts()
    }

    function handleMechanics(info) {
        handleUpdate(true, info["data"])
        updateMechanics()
    }

    sseSource.addRecoverHandler("posts", handlePosts)
    sseSource.addSSEEvent("posts", handlePosts)

    sseSource.addRecoverHandler("mechanics", handleMechanics)
    sseSource.addSSEEvent("mechanics", handleMechanics)

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}


start()