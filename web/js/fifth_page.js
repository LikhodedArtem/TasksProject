initEscapeButton("third_page.html")


const checklist = {
    "pos1": {
        "Контроль внешних осветительных приборов/ext_lights/3": null,
        "Контроль стеклоочистителей, омывателей стекол и фар/wipers_washers/3": null,
        "Проверка педали тормоза/brake_pedal/3": null,
        "Проверка фиксации коврика водителя/driver_mat/3": null,
        "Проверка стояночного тормоза: работоспособность, количество щелчков:/parking_brake_clicks/3": null,
        "Проверка люфта рулевого колеса/steering_wheel_play/3": null,
        "Проверка работы системы кондиционирования и уровня хладагента (визуально) (если предусмотрено по регламенту)/ac_system/3": null,
        "Проверка рычага переключения передач (для МКПП)/gear_lever_manual/3": null,
        "Проверка пробки топливного бака/fuel_cap/3": null,
        "Проверка фильтра системы кондиционирования (замена по регламенту или при необходимости)/cabin_filter/3": null,
        "Проверка уровня эксплуатационных жидкостей (ДВС, ТЖ, ОЖ, ГУР, масло в КПП (включит в моторном отсеке))/fluid_levels_engine/3": null,
        "Проверка АКБ, состояние клемм/battery_terminals/3": [
            [
                "Остаточная ёмкость",
                "residual_capacity",
                "integer",
                false,
                "%",
            ],
            [
                "Напряжение",
                "voltage",
                "numeric",
                false,
                "В",
            ],
        ],
        "Проверка топливного фильтра (замена по регламенту или при необходимости) - для дизельных ДВС/fuel_filter_diesel/3": null,
        "Проверка воздушного фильтра (замена по регламенту или при необходимости)/air_filter/3": null,
        "Проверка состояния приводных ремней и роликов/drive_belts_rollers/3": null,
        "Проверка радиатора, трубок и соединений системы охлаждения (очистка при необходимости)/cooling_radiator_hoses/3": null,
        "Проверка угольного адсорбера - для бензиновых ДВС/charcoal_canister/3": null,
        "Визуальная проверка дымности выхлопных газов - для дизельных ДВС/exaust_smoke_diesel/3": null,
        "Свечи зажигания (замена по регламенту или при необходимости) - для бензиновых ДВС/spark_plugs/3": null,
        "Замена DPR-шлангов для проверки давления выхлопных газов - для дизельных ДВС (каждые 36 месяцев)/dpr_hoses_diesel/3": null,
        "Замена жидкости системы контроля уровня подвески, с регулируемой гидроподвеской (каждые 100 тыс. км)/ahc_fluid_change/3": null,
    },

    "pos2": {
        "Проверка подшипников ступиц колес/wheel_bearings/3": null,
        "Проверка состояния колес и шин, глубина протектора, мм/tyres_tread/3": [
            [
                "Запасное колесо",
                "spare_wheel",
                "boolean",
                false,
                null,
            ],
            [
                "Заднее левое",
                "rear_left",
                "integer",
                false,
                null,
            ],
            [
                "Заднее правое",
                "rear_right",
                "integer",
                false,
                null,
            ],
            [
                "Переднее левое",
                "front_left",
                "integer",
                false,
                null,
            ],
            [
                "Переднее правое",
                "front_right",
                "integer",
                false,
                null,
            ],
        ],
        "Проверка давления в шинах/tyres_pressure/3": [
            [
                "Установлено давление по осям",
                "pressure_set_by_axle",
                "boolean",
                false,
                null,
            ],
            [
                "Перед",
                "front",
                "numeric",  // 1.8–3.0
                false,
                "бар",
            ],
            [
                "Зад",
                "rear",
                "numeric",  // 1.8–3.0
                false,
                "бар",
            ],
        ],
        "Снятие колес/wheels_removal/2": null,  // Без тройного выбора: boolean
        "Проверка передних тормозных механизмов/front_brakes/3": [
            [
                "Диски/барабаны факт",
                "front_discs_drums_actual",
                "integer",
                false,
                null,
            ],
            [
                "Колодки факт",
                "front_pads_actual",
                "integer",
                false,
                null,
            ],
        ],
        "Проверка задних тормозных механизмов/rear_brakes/3": [
            [
                "Диски/барабаны факт",
                "rear_discs_drums_actual",
                "integer",
                false,
                null,
            ],
            [
                "Колодки факт",
                "rear_pads_actual",
                "integer",
                false,
                null,
            ],
        ],
        "Контроль и регулировка колодок стояночного тормоза*/parking_brake_shoes/3": [
            [
                "Диски/барабаны факт",
                "parking_discs_drums_actual",
                "integer",
                false,
                null,
            ],
            [
                "Колодки факт",
                "parking_pads_actual",
                "integer",
                false,
                null,
            ],
        ],
        "Установка колес (при отсутствии доп.работ или замене ТЖ)/wheels_installation/3": null,
    },

    "pos3": {
        "Снятие защиты картера (пластиковой защиты) (при наличии)/skid_plate_removal/2": null,
        "Проверка утечек из двигателя и агрегатов трансмиссии/engine_trans_leaks/3": null,
        "Проверка герметичности ГУРа (при наличии)/power_steering_leak/3": null,
        "Проверка уровня жидкостей трансмиссии (кроме АКПП и CVT)/trans_fluid_level/3": null,
        "Проверка радиатора, трубок и соединений системы охлаждения (очистка при необходимости)/cooling_system_bottom/3": null,
        "Слив эксплуатационных жидкостей (замена по регламенту или при необходимости)/fluid_drainage/2": null,
        "Проверка элементов рулевого управления (проверка люфтов, состояния пыльников)/steering_linkage/3": null,
        "Проверка передней и задней подвесок (шарниры и их пыльники, сайлентблоки, втулки и пр.)/suspension_joints/3": null,
        "Проверка состояния приводных валов и их пыльников/drive_shafts_boots/3": null,
        "Проверка тормозных трубок и топливопровода/brake_fuel_lines/3": null,
        "Проверка выпускных труб и их креплений/exaust_pipes_mounts/3": null,
        "Проверка газовых камер системы контроля уровня подвески - для автомобилей, с регулируемой гидроподвеской/ahc_gas_chambers/3": null,
    },
}


class FieldConstructor {
    constructor() {
        this._smartInfo = {}
    }

    addSmartInfo(
        codes = [],
        fieldType = "boolean", // boolean/keyboard/choose
        text = null,
        addInfo ={
            // boolean: {
            //
            // },
            keyboard: {
                min: 0,
                max: Infinity,
            },
            choose: {
                options: []
            }
        }
    ) {
        const info = {
            fieldType: fieldType
        }

        if (text) info[text] = text

        if (fieldType === "keyboard") {
            info[addInfo] = addInfo.keyboard
        } else if (fieldType === "choose") {
            info[addInfo] = addInfo.choose
        }

        for (const code of codes) {
            this._smartInfo[code] = info
        }
    }

    create(
        name,
        code,
        type,
        isRequired,
        unit,
    ) {
        if (!this._smartInfo[code]) return null

        const info = {
            name: name,
            code: code,
            type: type,
            isRequired: isRequired,
            unit: unit,
        }

        for (const [key, value] of Object.entries(this._smartInfo[code])) {
            info[key] = value
        }

        return this._smartCreate(info)
    }

    _smartCreate(
    {
        code,
        text = "",
        infoType,
        isRequired,
        unit,

        fieldType = "boolean", // boolean/keyboard/choose
        addInfo = {},
    }) {
        fieldType = fieldType.toLowerCase()
        let field = this._constructBasicField({
            code: code,
            text: text,
            infoType: infoType,
            isRequired: isRequired,
            unit: unit,
        })

        if (fieldType === "boolean") {
            field = this._boolean(field, addInfo)
        } else if (fieldType === "keyboard") {
            field = this._keyboard(field, addInfo)
        } else if (fieldType === "choose") {
            field = this._choose(field, addInfo)
        } else {
            throw Error("Unexpected field type")
        }

        return field
    }

    _constructBasicField(
        {
            code,
            text,
            infoType,
            isRequired,
            unit,
        }
    ) {
        const field = document.createElement("div")

        field.id = snakeToCamelCase(code)
        field.className = "field"

        field.infoType = infoType
        field.isRequired = isRequired

        const fieldTextArea = document.createElement("div")
        fieldTextArea.className = "field-text-area"

        const fieldText = document.createElement("div")
        fieldText.className = "field-text"
        fieldText.textContent = text

        field.set = (value) => {}
        field.get = () => {}

        field.textArea = fieldTextArea
        field.text = fieldText

        if (unit !== null) {
            const fieldUnitArea = document.createElement("div")
            fieldUnitArea.className = "field-unit-area"

            const fieldUnit = document.createElement("div")
            fieldUnit.className = "field-unit"
            fieldUnit.textContent = unit

            field.unitArea = fieldUnitArea
            field.unit = fieldUnit

        } else {
            field.unitArea = null
            field.unit = null
        }

        return field
    }

    _boolean(field, {}) {

    }

    _keyboard(field, { min, max }) {

    }

    _choose(field, { options }) {

    }
}


let znNumber
let post
let mechanic

let carReg = null
let znDate = null

startRequestsCount = 1

const positions = document.querySelector(".positions")

const headCounter = constructChecklistCounter()

const fieldConstructor = new FieldConstructor()


async function start() {
    znNumber = Cookie.get("znNumber")
    post = Cookie.get("post")
    mechanic = Cookie.get("mechanic")

    initHeadCounter()
    initPositions()
    initRowClicks()

    if (!znNumber || !post || !mechanic) {
        createNotification("error", "Ошибка загрузки страницы")
        return
    }

    // const test = document.querySelector(".test")
    // test.style.display = 'flex'
    // test.style.gap = "var(--space-4)"
    //
    // test.append(
    //     constructNumInput(null, {
    //         type: "float",
    //         tenth: [true, true],
    //         max: 50,
    //         basic: 0.5,
    //     } ),
    // )

    await init()
}

async function init() {
    await initSSE()

    await getZnInfo()
}

function initInfo() {
    document.querySelector("#znNumber span").textContent = znNumber
    document.querySelector("#date span").textContent = znDate
    document.querySelector("#post span").textContent = post

    const reg = document.querySelector("#reg span")
    reg.parentNode.replaceChildren(document.querySelector("#reg label"), beautyReg(carReg))
}


function initPositions() {
    let positionNumber = 1

    for (const [positionClass, rows] of Object.entries(checklist)) {
        const position = constructPosition(positionNumber, positionClass)

        for (const [rowInfo, fields] of Object.entries(rows)) {
            const [rowName, rowCode, rowType] = rowInfo.split("/")

            const row = constructRow(rowName, rowCode, rowType === "2")

            if (fields) {
                for (const fieldInfo of fields) {
                    row.addField(fieldInfo)
                }
            }

            position.add(row)
        }

        position.counter.gray.set(position.value.children.length)
        headCounter.gray.set(headCounter.gray.get() + position.counter.gray.get())

        positions.append(position)

        positionNumber++
    }
}


function initRowClicks() {
    positions.addEventListener("click", (event) => {
        const doubleButton = event.target.closest(".double-button")
        const tripleButton = event.target.closest(".triple-button")

        if (doubleButton) handleMultipleButton(doubleButton, event)
        if (tripleButton) handleMultipleButton(tripleButton, event)
    })
}

function initHeadCounter() {
    const oldCounter = document.querySelector('.checklist-counter')
    oldCounter.parentNode.appendChild(headCounter)
    oldCounter.parentNode.removeChild(oldCounter)
}


function constructPosition(number, addClass) {
    const positionWrapper = document.createElement("div")
    positionWrapper.className = `position-wrapper ${addClass}`

    const position = document.createElement("div")
    position.className = "position"

    const positionName = document.createElement("span")
    positionName.className = `position-name`
    positionName.textContent = `Положение подъёмника #${number}`

    const positionArrow = document.createElement("div")
    positionArrow.className = 'position-arrow'
    positionArrow.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

    const positionValueWrapper = document.createElement("div")
    positionValueWrapper.className = "position-value-wrapper"

    const positionValue = document.createElement("div")
    positionValue.className = "position-value"

    const checklistCounter = constructChecklistCounter()
    checklistCounter.style.marginLeft = "auto"

    const pinPackage = constructPinPackage()

    position.append(positionArrow, positionName, checklistCounter, pinPackage)
    positionValueWrapper.append(positionValue)

    positionWrapper.append(position, positionValueWrapper)

    positionWrapper.clear = () => {
        positionValue.innerHTML = ""
    }

    positionWrapper.add = (el) => {
        positionValue.append(el)
    }

    positionWrapper.close = () => {
        if (!positionWrapper.classList.contains("opened")) return

        positionValueWrapper.style.height = "0"
        positionWrapper.classList.remove("opened")
    }

    positionWrapper.open = () => {
        if (positionWrapper.classList.contains("opened")) return

        positionValueWrapper.style.height = `${pxToRem(positionValue.offsetHeight)}rem`
        positionWrapper.classList.add("opened")

        if (pinPackage.isClicked()) {
            Array.from(positions.children).forEach((pos) => {
                if (pos !== position && !pos.pin.isClicked()) pos.close()
            })
        }

    }

    position.addEventListener("click", (event) => {
        const findChecklistCounter = event.target.closest(".checklist-counter")
        const findPinPackage = event.target.closest(".pin-package")

        if (findChecklistCounter) {
            return
        }

        if (findPinPackage) {
            if (!pinPackage.toggleClick()) positionWrapper.close()
            return
        }

        positionWrapper.classList.contains("opened")
            ? positionWrapper.close()
            : positionWrapper.open()
    })

    positionWrapper.counter = checklistCounter
    positionWrapper.value = positionValue
    positionWrapper.pin = pinPackage

    return positionWrapper
}


function constructPinPackage() {
    const pinPackage = document.createElement("div")
    pinPackage.className = "pin-package"
    pinPackage.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4a1 1 0 0 1 1 1z"></path></svg>'
    pinPackage.style.height = "2.5rem"
    pinPackage.style.marginInline = "var(--space-4)"

    pinPackage.isClicked = () => {
        return pinPackage.classList.contains("clicked")
    }

    pinPackage.toggleClick = () => {
        pinPackage.classList.toggle("clicked")
        return pinPackage.isClicked()
    }

    return pinPackage
}


function constructRow(name, code, double = false) {
    const row = document.createElement("div")
    row.className = "row"
    row.dataset.code = code

    const multipleButton = double ? constructDoubleButton() : constructTripleButton()

    const rowText = document.createElement("div")
    rowText.textContent = name

    row.append(multipleButton, rowText)

    row.fields = []
    row.addField = (fieldInfo) => {
        row.fields.push(fieldInfo)

        const fieldEl = fieldConstructor.create(...fieldInfo)

        if (!fieldEl) {
            console.warn(`Row '${code}' can't find field '${fieldInfo[1]}'`)
        } else {
            row.append(fieldEl)
        }
    }

    return row
}


function constructChecklistCounter(bases = [0, 0, 0, 0]) {
    const checklistCounter = document.createElement("div")
    checklistCounter.className = "checklist-counter"

    const checklistCounterCellRed = constructChecklistCounterCell("red", bases[0])
    const checklistCounterCellYellow = constructChecklistCounterCell("yellow", bases[1])
    const checklistCounterCellGreen = constructChecklistCounterCell("green", bases[2])
    const checklistCounterCellGray = constructChecklistCounterCell("gray", bases[3])

    function constructChecklistCounterCell(addClass, base = 0) {
        const checklistCounterCell = document.createElement("div")
        checklistCounterCell.className = `checklist-cell-counter ${addClass}`

        const checklistCounterCellText = document.createElement("span")
        checklistCounterCellText.textContent = base

        checklistCounterCell.append(checklistCounterCellText)

        checklistCounterCell.get = () => {
            return Number(checklistCounterCellText.textContent)
        }

        checklistCounterCell.set = (newValue) => {
            checklistCounterCellText.textContent = newValue
        }

        checklistCounterCell.add = () => {
            checklistCounterCellText.textContent = checklistCounterCell.get() + 1
        }

        checklistCounterCell.sub = () => {
            checklistCounterCellText.textContent = checklistCounterCell.get() - 1
        }

        return checklistCounterCell
    }

    checklistCounter.append(
        checklistCounterCellRed,
        checklistCounterCellYellow,
        checklistCounterCellGreen,
        checklistCounterCellGray,
    )

    checklistCounter.red = checklistCounterCellRed
    checklistCounter.yellow = checklistCounterCellYellow
    checklistCounter.green = checklistCounterCellGreen
    checklistCounter.gray = checklistCounterCellGray

    return checklistCounter
}


function getInt(num) {
    return Math.floor(num)
}

function getFloat(num) {
    return (Math.round(num * 100) - Math.floor(num) * 100) % 100
}


function constructNumInput(
    value = null,
    {
        min = 0,
        max = Infinity,
        type = "integer", // integer, float
        tenth = [],
        basic = null
    }) {
    if (
        !(
            type === "float"
            || type === "integer"
        )
    ) {
        throw Error("Wrong NumInput type")
    }

    const numInput = document.createElement("div")
    numInput.className = "num-input"

    const numInputValue = document.createElement("div")
    numInputValue.className = "num-input-value"

    const numInputValueText = document.createElement("span")
    numInputValueText.className = "num-input-value-text"
    numInputValueText.textContent = value ? value : '?'

    numInputValue.append(numInputValueText)
    numInput.append(numInputValue)

    function getTenth(id) {
        return tenth[id] === undefined || tenth[id] === null ? false : tenth[id]
    }

    function getBasic() {
        return basic === undefined || basic === null ? min : basic
    }

    function constructPanel() {
        const numInputPanel = document.createElement("div")
        numInputPanel.className = `num-input-panel ${type}`

        const numInputPanelBody = document.createElement("div")
        numInputPanelBody.className = "num-input-panel-body"

        const numInputPanelClose = document.createElement("div")
        numInputPanelClose.className = "num-input-panel-close"
        numInputPanelClose.innerHTML = SVG.x

        const numInputPanelApply = document.createElement("div")
        numInputPanelApply.className = "num-input-panel-apply"
        numInputPanelApply.innerHTML = `<div>${SVG.load}</div>`

        numInputPanelClose.addEventListener("click", closeNumInput)
        numInputPanelApply.addEventListener("click", apply)

        numInputPanelBody.append(numInputPanelClose, numInputPanelApply)

        if (type === "integer") {
            const numInteger = constructInteger(
                getTenth(0),
                numInputValueText.textContent !== "?"
                    ? numInputValueText.textContent
                    : getBasic(),
                min,
                max
            )

            numInputPanelBody.append(
                numInteger
            )

            numInteger.addEventListener("click", (event) => {
                const arrow = event.target.closest(".num-arrow")
                if (!arrow) return

                const value = arrow.classList.contains("tenth") ? 10 : 1
                const operation = arrow.classList.contains("add")
                const check = operation
                    ? numInteger.get() !== max
                    : numInteger.get() !== min

                if (!check) {
                    if (!arrow.classList.contains("bad-click")) {
                        arrow.classList.add("bad-click")
                        arrow.addEventListener("animationend", () => {
                            arrow.classList.remove("bad-click")
                        }, { once: true })
                    }
                    return
                }

                numInteger.set(
                    operation
                        ? Math.min(numInteger.get() + value, max)
                        : Math.max(numInteger.get() - value, min)
                )
            })

            numInput.apply = () => {
                return numInteger.get().toString()
            }

        } else if (type === "float") {
            const dot = document.createElement("div")
            dot.className = 'num-input-dot'

            const currentValue = numInputValueText.textContent !== "?"
                ? Number(numInputValueText.textContent)
                : getBasic()

            const intNumInput = constructInteger(
                getTenth(0),
                getInt(currentValue)
            )
            intNumInput.classList.add("int")

            const floatNumInput = constructInteger(
                getTenth(1),
                getFloat(currentValue)
            )
            intNumInput.classList.add("float")

            numInputPanelBody.append(
                intNumInput,
                dot,
                floatNumInput,
            )

            function getCurrent() {
                return intNumInput.get() + floatNumInput.get() * 0.01
            }

            numInputPanelBody.addEventListener("click", (event) => {
                const arrow = event.target.closest(".num-arrow")
                if (!arrow) return

                const multiplier = arrow.closest(".num-integer").classList.contains("int") ? 1 : 0.01
                const value = arrow.classList.contains("tenth") ? 10 : 1
                const operation = arrow.classList.contains("add")

                const currentValue = getCurrent()

                const check = operation
                    ? currentValue !== max
                    : currentValue !== min

                if (!check) {
                    if (!arrow.classList.contains("bad-click")) {
                        arrow.classList.add("bad-click")
                        arrow.addEventListener("animationend", () => {
                            arrow.classList.remove("bad-click")
                        }, { once: true })
                    }
                    return
                }

                const newValue = operation
                    ? Math.min(currentValue + value * multiplier, max)
                    : Math.max(currentValue - value * multiplier, min)

                intNumInput.set(getInt(newValue))
                floatNumInput.set(getFloat(newValue))
            })

            numInput.apply = () => {
                return getCurrent()
            }
        }

        numInputPanel.append(numInputPanelBody)

        return numInputPanel
    }

    function openNumInput() {
        if (numInput.classList.contains("opened")) return

        numInput.classList.add("opened")

        const panel = constructPanel()

        numInput.append(panel)

        panel.style.opacity = "0"

        void panel.offsetHeight

        panel.style.opacity = "1"

        setTimeout(setAnotherClickHandler, 10)
    }

    function closeNumInput() {
        if (!numInput.classList.contains("opened")) return

        numInput.classList.remove("opened")

        numInput.removeChild(numInput.querySelector(".num-input-panel"))
    }

    numInput.addEventListener("click", (event) => {
        if (event.target.closest(".num-input-panel") !== null) return
        openNumInput()
    })

    function setAnotherClickHandler() {
        window.addEventListener("click", (event) => {
            const findNumInputPanel = event.target.closest(".num-input-panel")

            findNumInputPanel === numInput.querySelector(".num-input-panel")
                ? setAnotherClickHandler()
                : closeNumInput()
        }, {
            once: true
        })
    }

    function apply() {
        numInputValueText.textContent = numInput.apply()
        closeNumInput()
    }

    return numInput
}

function constructInteger(tenth, basic) {
    const numInteger= document.createElement("div")
    numInteger.className = "num-integer"

    numInteger.append(constructNumArrow(true, false))
    if (tenth) numInteger.append(constructNumArrow(true, true))

    const field = constructNumField(basic)

    numInteger.append(field)

    if (tenth) numInteger.append(constructNumArrow(false, true))
    numInteger.append(constructNumArrow(false, false))

    numInteger.get = field.get
    numInteger.set = field.set

    return numInteger
}

function constructNumArrow(add = true, tenth = false) {
    const numArrow = document.createElement("div")
    numArrow.className = `num-arrow ${add ? "add" : "sub"}${tenth ? " tenth" : ""}`
    if (!tenth) numArrow.innerHTML = '<svg viewBox="0 0 24 24" overflow="visible" fill="currentColor" stroke="var(--color-border)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M10.66,2.68 L1.34,21.32 Q0,24 3,24 L21,24 Q24,24 22.66,21.32 L13.34,2.68 Q12,0 10.66,2.68 Z" vector-effect="non-scaling-stroke"/></svg>'

    return numArrow
}

function constructNumField(value) {
    const numField = document.createElement("div")
    numField.className = "num-field"

    const numFieldValue = document.createElement("span")
    numFieldValue.className = "num-field-value"
    numFieldValue.textContent = value

    numField.append(numFieldValue)

    numField.get = () => {
        return numFieldValue.length !== 0 ? Number(numFieldValue.textContent) : null
    }

    numField.set = (newNum) => {
        numFieldValue.textContent = newNum
    }

    return numField
}


function constructDoubleButton() {
    const doubleButton = document.createElement("div")
    doubleButton.className = "double-button"
    doubleButton.isActive = false

    const doubleButtonPointRed = document.createElement("div")
    doubleButtonPointRed.className = "double-button-point red inactive"

    const doubleButtonPointGreen = document.createElement("div")
    doubleButtonPointGreen.className = "double-button-point green inactive"

    doubleButton.append(
        doubleButtonPointRed,
        doubleButtonPointGreen
    )

    return doubleButton
}


function constructTripleButton() {
    const tripleButton = document.createElement("button")
    tripleButton.className = "triple-button"
    tripleButton.isActive = false

    const tripleButtonPointRed = document.createElement("div")
    tripleButtonPointRed.className = "triple-button-point red inactive"

    const tripleButtonPointYellow = document.createElement("div")
    tripleButtonPointYellow.className = "triple-button-point yellow inactive"

    const tripleButtonPointGreen = document.createElement("div")
    tripleButtonPointGreen.className = "triple-button-point green inactive"

    tripleButton.append(
        tripleButtonPointRed,
        tripleButtonPointYellow,
        tripleButtonPointGreen
    )

    return tripleButton
}


function handleMultipleButton(button, event) {
    let closest
    let minDistance = Infinity

    const points = Array.from(button.children)
    const localCounter = button.closest(".position-wrapper").querySelector(".checklist-counter")

    const clickX = event.clientX
    const clickY = event.clientY

    points.forEach((tripleButtonPoint) => {
        const rect = tripleButtonPoint.getBoundingClientRect()

        const centerX = rect.left  + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distance = Math.hypot(clickX - centerX, clickY - centerY)

        if (distance < minDistance) {
            minDistance = distance
            closest = tripleButtonPoint
        }
    })

    if (!closest.classList.contains("active")) {
        points.forEach((point) => {
            const active = point.classList.contains("active")
            const clicked = point === closest

            if (active || clicked) {
                const funcName = active ? "sub" : "add"

                const type = Array.from(point.classList)[1]

                headCounter[type][funcName]()
                localCounter[type][funcName]()
            }

            if (clicked) {
                point.classList.add("active")
            } else {
                point.classList.remove("active")
            }
        })

        if (!button.isActive) {
            button.isActive = true
            points.forEach((point) => {
                point.classList.remove("inactive")
            })
            headCounter.gray.sub()
            localCounter.gray.sub()
        }
    }
}

async function initEnd() {
    clearLoading()
}


async function getZnInfo() {
    await requestManager.send(
        "/info/checklist/get",
        "POST",
        {
            data: {
                zn_number: znNumber,
            },
            okFunc: (data) => {
                doneStartRequest("changelist", data, (data) => {
                    znDate = createReadableDate(data.date)
                    carReg = data.car_reg
                    initInfo()
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

    await sseSource.subServerEvents({"zn": znNumber})

    sseSource.requests = requestManager
    sseSource.start()

    requestManager.SSE = sseSource
}


start()