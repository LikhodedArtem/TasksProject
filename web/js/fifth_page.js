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
                "%",
            ],
            [
                "Колодки факт",
                "front_pads_actual",
                "integer",
                false,
                "%",
            ],
        ],
        "Проверка задних тормозных механизмов/rear_brakes/3": [
            [
                "Диски/барабаны факт",
                "rear_discs_drums_actual",
                "integer",
                false,
                "%",
            ],
            [
                "Колодки факт",
                "rear_pads_actual",
                "integer",
                false,
                "%",
            ],
        ],
        "Контроль и регулировка колодок стояночного тормоза*/parking_brake_shoes/3": [
            [
                "Диски/барабаны факт",
                "parking_discs_drums_actual",
                "integer",
                false,
                "%",
            ],
            [
                "Колодки факт",
                "parking_pads_actual",
                "integer",
                false,
                "%",
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
        text = undefined,
        addInfo = {
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
            info.addInfo = addInfo.keyboard
        } else if (fieldType === "choose") {
            info.addInfo = addInfo.choose
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
            text: name,
            code: code,
            type: type,
            isRequired: isRequired,
            unit: unit,
        }

        for (const [key, value] of Object.entries(this._smartInfo[code])) {
            if (value === undefined) continue

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

        field.dataset.code = code

        field.infoType = infoType
        field.isRequired = isRequired

        const fieldTextArea = document.createElement("div")
        fieldTextArea.className = "field-text-area"

        const fieldText = document.createElement("span")
        fieldText.className = "field-text"
        fieldText.textContent = text

        field.get = () => {}
        field.set = (value) => {}

        fieldTextArea.append(fieldText)

        field.textArea = fieldTextArea
        field.textArea.text = fieldText

        if (unit !== null) {
            const fieldUnitArea = document.createElement("div")
            fieldUnitArea.className = "field-unit-area"

            const fieldUnit = document.createElement("div")
            fieldUnit.className = "field-unit"
            fieldUnit.textContent = unit

            fieldUnitArea.append(fieldUnit)

            field.unitArea = fieldUnitArea
            field.unitArea.unit = fieldUnit

        } else {
            field.unitArea = null
            field.unit = null
        }

        return field
    }

    _boolean(field) {
        field.classList.add("boolean")

        const fieldCheckbox = document.createElement("div")
        fieldCheckbox.className = "field-checkbox hide"

        const fieldCheckboxBox = document.createElement("div")
        fieldCheckboxBox.className = "field-checkbox-box"

        const check = document.createElement("div")
        check.className = "check"
        check.innerHTML = '<svg viewBox="0 0 30 30" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" stroke="currentColor"><path class="check-path" fill="none" d="M4.1 19.2l7.1 7.2 16.7-16.8"/></svg>'

        fieldCheckboxBox.className = "field-checkbox-box"

        fieldCheckbox.append(fieldCheckboxBox, check)

        field.append(fieldCheckbox, field.textArea)

        function show() {
            fieldCheckbox.classList.add("show")
            fieldCheckbox.classList.remove("hide")
        }

        function hide() {
            fieldCheckbox.classList.add("hide")
            fieldCheckbox.classList.remove("show")
        }

        fieldCheckbox.addEventListener('click', () => {
            if (field.classList.contains("disabled")) return

            fieldCheckbox.classList.contains("show")
                ? hide()
                : show()
        })

        field.get = () => {
            return fieldCheckbox.classList.contains("show")
        }

        field.set = (value) => {
            value
                ? show()
                : hide()
        }

        return field
    }

    _keyboard(field, { min, max }) {
        field.classList.add("keyboard")

        const inputContainer = document.createElement("div")
        inputContainer.className = "input-container"

        const inputValue = document.createElement("div")
        inputValue.className = "input-value unstated"

        const inputValueText = document.createElement("div")
        inputValueText.className = "input-value-text"
        inputValueText.textContent = "?"

        const inputPanel = document.createElement("div")
        inputPanel.className = "input-panel"

        const inputPanelInput = document.createElement("input")
        inputPanelInput.className = "input-panel-input"
        inputPanelInput.setAttribute("type", "text")
        inputPanelInput.setAttribute("inputmode", "numeric")

        const applyButton = document.createElement("div")
        applyButton.className = "apply-button"
        applyButton.innerHTML = SVG.load

        inputPanel.append(inputPanelInput, applyButton)
        inputValue.append(inputValueText)

        inputContainer.append(inputValue, inputPanel)

        field.get = () => {
            return inputValueText.textContent !== "?"
                ? inputValueText.textContent
                : null
        }

        field.set = (value) => {
            baseSet(value)
        }

        function baseSet(value) {
            inputValue.classList.remove("unstated")
            inputValueText.textContent = value

            inputPanelInput.value = ""
            inputContainer.classList.remove("show")
        }

        inputValue.addEventListener("click", () => {
            if (inputContainer.classList.contains("show")) {
                inputContainer.classList.remove("show")
            } else {
                inputContainer.classList.add("show")
            }
        })

        applyButton.addEventListener("click", () => {
            const forParse = inputPanelInput.value.replaceAll(" ", "").replaceAll(",", ".").replace(/\.{2,}/g, '.')

            const numValue = Number(forParse)
            if (Number.isNaN(numValue)) {
                createNotification("error", "Введено нечисловое значение")
                return;
            }

            if (numValue < min) {
                createNotification("error", `Введено значение меньше ${min}`)
                return
            }

            if (numValue > max) {
                createNotification("error", `Введено значение больше ${max}`)
                return
            }

            field.set(numValue)
        })

        field.append(inputContainer)
        if (field.unitArea) field.append(field.unitArea)
        field.append(field.textArea)

        return field
    }

    _choose(field, { options }) {
        field.classList.add("choose")

        field.options = options

        const chooseContainer = document.createElement("div")
        chooseContainer.className = "choose-container"

        const chooseBox = document.createElement("div")
        chooseBox.className = "choose-box unstated"

        const chooseBoxValue = document.createElement("div")
        chooseBoxValue.className = "choose-box-value"
        chooseBoxValue.textContent = "?"

        const fieldOptions = document.createElement("div")
        fieldOptions.className = "field-options"

        chooseBox.get = () => {
            return chooseBoxValue.textContent !== "?"
                ? chooseBoxValue.textContent
                : null
        }

        chooseBox.set = (value) => {
            chooseBox.classList.remove("unstated")
            chooseBoxValue.textContent = value
        }

        const gap = 0.6 // rem

        function findX(elColumnIndex, rowLength) {
            return `${Math.round((Math.floor(rowLength / 2) - elColumnIndex) * (2.2 + gap) * 100 * -1) / 100}rem`
        }

        function findY(elRowIndex, columnLength) {
            return `${Math.round((columnLength - elRowIndex) * (2.2 + gap) * 100) / 100 * -1}rem`
        }

        const lastRow = Math.ceil(options.length / 3)
        const lastRowLength = 3 - options.length % 3

        options.forEach((option, index) => {
            const myColumn = index % 3
            const myRow = index % lastRow

            const myX = findX(myColumn, myRow === lastRow - 1 ? lastRowLength : 3)
            const myY = findY(myRow, lastRow)

            fieldOptions.append(constructOption(option, myX, myY))
        })

        fieldOptions.go = () => {
            fieldOptions.classList.add("show")
            Array.from(fieldOptions.children).forEach((option) => { option.go() })
        }

        fieldOptions.back = () => {
            fieldOptions.classList.remove("show")
            Array.from(fieldOptions.children).forEach((option) => { option.back() })
        }

        function constructOption(text, moveX, moveY) {
            const fieldOption = document.createElement("div")
            fieldOption.className = "field-option"

            const fieldOptionText = document.createElement("div")
            fieldOptionText.className = "field-option-text"
            fieldOptionText.textContent = text

            fieldOption.append(fieldOptionText)

            fieldOption.go = () => {
                fieldOption.style.top = moveY
                fieldOption.style.left = moveX
            }

            fieldOption.back = () => {
                fieldOption.style.top = "0"
                fieldOption.style.left = "0"
            }

            fieldOption.get = () => {
                return fieldOptionText.textContent
            }

            return fieldOption
        }

        chooseBox.addEventListener("click", () => {
            if (fieldOptions.classList.contains("show")) {
                fieldOptions.back()
            } else {
                fieldOptions.go()
            }
        })

        fieldOptions.addEventListener("click", (event) => {
            const option = event.target.closest(".field-option")
            if (!option) return

            chooseBox.set(option.get())
            fieldOptions.back()
        })

        chooseBox.append(chooseBoxValue)
        chooseContainer.append(chooseBox, fieldOptions)

        field.append(chooseContainer)
        if (field.unitArea) field.append(field.unitArea)
        field.append(field.textArea)

        return field
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

    if (!znNumber || !post || !mechanic) {
        window.location.href = "first_page.html"
    }

    initFields()

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


function initFields() {
    fieldConstructor.addSmartInfo(
        [
            "spare_wheel",
            "pressure_set_by_axle",
        ],
        "boolean",
        undefined,
        {},
    )

    fieldConstructor.addSmartInfo(
        [
            "rear_left",
            "rear_right",
            "front_left",
            "front_right",
        ],
        "choose",
        undefined,
        {
            choose: {
                options: [1, 3, 6]
            }
        },
    )

    fieldConstructor.addSmartInfo(
        [
            "front_discs_drums_actual",
            "front_pads_actual",
            "rear_discs_drums_actual",
            "rear_pads_actual",
            "parking_discs_drums_actual",
            "parking_pads_actual",
        ],
        "choose",
        undefined,
        {
            choose: {
                options: [25, 50, 75]
            }
        },
    )

    fieldConstructor.addSmartInfo(
        [
            "residual_capacity",
        ],
        "keyboard",
        undefined,
        {
            keyboard: {
                min: 0,
                max: 100,
            }
        }
    )

    fieldConstructor.addSmartInfo(
        [
            "voltage",
        ],
        "keyboard",
        undefined,
        {
            keyboard: {
                min: 0,
                max: Infinity,
            }
        }
    )

    fieldConstructor.addSmartInfo(
        [
            "front",
            "rear",
        ],
        "keyboard",
        undefined,
        {
            keyboard: {
                min: 1.8,
                max: 3.0,
            }
        }
    )
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

        Array.from(positions.children).forEach((posWrapper) => {
            if (posWrapper !== positionWrapper && !posWrapper.pin.isClicked()) posWrapper.close()
        })
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
    row.id = snakeToCamelCase(code)
    row.className = "row"

    row.dataset.code = code

    const multipleButton = double ? constructDoubleButton() : constructTripleButton()

    const rowValue = document.createElement("div")
    rowValue.className = "row-value"

    const rowText = document.createElement("div")
    rowText.textContent = name

    rowValue.append(rowText)

    row.append(multipleButton, rowValue)

    row.fields = []

    row.addField = (fieldInfo) => {
        const fieldEl = fieldConstructor.create(...fieldInfo)

        if (!fieldEl) {
            console.warn(`Row '${code}' can't find field '${fieldInfo[1]}'`)
        } else {
            rowValue.append(fieldEl)
        }

        row.fields.push(fieldEl)
    }

    row.red = multipleButton.red
    row.yellow = multipleButton.yellow
    row.green = multipleButton.green
    row.get = multipleButton.get
    row.fieldsGet = () => {
        const answer = {}

        for (const field of row.fields) {
            if (field == null) continue

            answer[field.dataset.code] = field.get()
        }

        return answer
    }

    return row
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

    function clear() {
        Array.from(doubleButton.children).forEach((point) => {
            point.classList.remove("inactive")
        })
    }

    doubleButton.red = () => {
        clear()
        doubleButtonPointRed.classList.add("active")
    }

    doubleButton.green = () => {
        clear()
        doubleButtonPointGreen.classList.add("active")
    }

    doubleButton.get = () => {
        for (const point of Array.from(doubleButton.children)) {
            if (point.classList.contains("active")) {
                return Array.from(point.classList)[1]
            }
        }

        return "unstated"
    }

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

    function clear() {
        Array.from(tripleButton.children).forEach((point) => {
            point.classList.remove("inactive")
        })
    }

    tripleButton.red = () => {
        clear()
        tripleButtonPointRed.classList.add("active")
    }

    tripleButton.yellow = () => {
        clear()
        tripleButtonPointYellow.classList.add("active")
    }

    tripleButton.green = () => {
        clear()
        tripleButtonPointGreen.classList.add("active")
    }

    tripleButton.get = () => {
        for (const point of Array.from(tripleButton.children)) {
            if (point.classList.contains("active")) {
                return Array.from(point.classList)[1]
            }
        }

        return "unstated"
    }

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