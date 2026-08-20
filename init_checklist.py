import asyncio
from uuid import uuid4

from core.models import db_helper
from core.models.real_info import ChecklistRow, ChecklistField
from crud import add_objects

checklist = {
    "pos1": {
        "Контроль внешних осветительных приборов/ext_lights": None,
        "Контроль стеклоочистителей, омывателей стекол и фар/wipers_washers": None,
        "Проверка педали тормоза/brake_pedal": None,
        "Проверка фиксации коврика водителя/driver_mat": None,
        "Проверка стояночного тормоза: работоспособность, количество щелчков:/parking_brake_clicks": None,
        "Проверка люфта рулевого колеса/steering_wheel_play": None,
        "Проверка работы системы кондиционирования и уровня хладагента (визуально) (если предусмотрено по регламенту)/ac_system": None,
        "Проверка рычага переключения передач (для МКПП)/gear_lever_manual": None,
        "Проверка пробки топливного бака/fuel_cap": None,
        "Проверка фильтра системы кондиционирования (замена по регламенту или при необходимости)/cabin_filter": None,
        "Проверка уровня эксплуатационных жидкостей (ДВС, ТЖ, ОЖ, ГУР, масло в КПП (включит в моторном отсеке))/fluid_levels_engine": None,
        "Проверка АКБ, состояние клемм/battery_terminals": [
            [
                "Остаточная ёмкость",
                "residual_capacity",
                "integer",
                False,
                "%",
            ],
            [
                "Напряжение",
                "voltage",
                "numeric",
                False,
                "В",
            ],
        ],
        "Проверка топливного фильтра (замена по регламенту или при необходимости) - для дизельных ДВС/fuel_filter_diesel": None,
        "Проверка воздушного фильтра (замена по регламенту или при необходимости)/air_filter": None,
        "Проверка состояния приводных ремней и роликов/drive_belts_rollers": None,
        "Проверка радиатора, трубок и соединений системы охлаждения (очистка при необходимости)/cooling_radiator_hoses": None,
        "Проверка угольного адсорбера - для бензиновых ДВС/charcoal_canister": None,
        "Визуальная проверка дымности выхлопных газов - для дизельных ДВС/exhaust_smoke_diesel": None,
        "Свечи зажигания (замена по регламенту или при необходимости) - для бензиновых ДВС/spark_plugs": None,
        "Замена DPR-шлангов для проверки давления выхлопных газов - для дизельных ДВС (каждые 36 месяцев)/dpr_hoses_diesel": None,
        "Замена жидкости системы контроля уровня подвески, с регулируемой гидроподвеской (каждые 100 тыс. км)/ahc_fluid_change": None,
    },

    "pos2": {
        "Проверка подшипников ступиц колес/wheel_bearings": None,
        "Проверка состояния колес и шин, глубина протектора, мм/tyres_tread": [
            [
                "Запасное колесо",
                "spare_wheel",
                "boolean",
                False,
                None,
            ],
            [
                "Заднее левое",
                "rear_left",
                "integer",
                False,
                None,
            ],
            [
                "Заднее правое",
                "rear_right",
                "integer",
                False,
                None,
            ],
            [
                "Переднее левое",
                "front_left",
                "integer",
                False,
                None,
            ],
            [
                "Переднее правое",
                "front_right",
                "integer",
                False,
                None,
            ],
        ],
        "Проверка давления в шинах/tyres_pressure": [
            [
                "Установлено давление по осям",
                "pressure_set_by_axle",
                "boolean",
                False,
                None,
            ],
            [
                "Перед",
                "front",
                "numeric",  # 1.8–3.0
                False,
                "бар",
            ],
            [
                "Зад",
                "rear",
                "numeric",  # 1.8–3.0
                False,
                "бар",
            ],
        ],
        "Снятие колес/wheels_removal": None,  # Без тройного выбора: boolean
        "Проверка передних тормозных механизмов/front_brakes": [
            [
                "Диски/барабаны факт",
                "front_discs_drums_actual",
                "integer",
                False,
                None,
            ],
            [
                "Колодки факт",
                "front_pads_actual",
                "integer",
                False,
                None,
            ],
        ],
        "Проверка задних тормозных механизмов/rear_brakes": [
            [
                "Диски/барабаны факт",
                "rear_discs_drums_actual",
                "integer",
                False,
                None,
            ],
            [
                "Колодки факт",
                "rear_pads_actual",
                "integer",
                False,
                None,
            ],
        ],
        "Контроль и регулировка колодок стояночного тормоза*/parking_brake_shoes": [
            [
                "Диски/барабаны факт",
                "parking_discs_drums_actual",
                "integer",
                False,
                None,
            ],
            [
                "Колодки факт",
                "parking_pads_actual",
                "integer",
                False,
                None,
            ],
        ],
        "Установка колес (при отсутствии доп.работ или замене ТЖ)/wheels_installation": None,
    },

    "pos3": {
        "Снятие защиты картера (пластиковой защиты) (при наличии)/skid_plate_removal": None,
        "Проверка утечек из двигателя и агрегатов трансмиссии/engine_trans_leaks": None,
        "Проверка герметичности ГУРа (при наличии)/power_steering_leak": None,
        "Проверка уровня жидкостей трансмиссии (кроме АКПП и CVT)/trans_fluid_level": None,
        "Проверка радиатора, трубок и соединений системы охлаждения (очистка при необходимости)/cooling_system_bottom": None,
        "Слив эксплуатационных жидкостей (замена по регламенту или при необходимости)/fluid_drainage": None,
        "Проверка элементов рулевого управления (проверка люфтов, состояния пыльников)/steering_linkage": None,
        "Проверка передней и задней подвесок (шарниры и их пыльники, сайлентблоки, втулки и пр.)/suspension_joints": None,
        "Проверка состояния приводных валов и их пыльников/drive_shafts_boots": None,
        "Проверка тормозных трубок и топливопровода/brake_fuel_lines": None,
        "Проверка выпускных труб и их креплений/exhaust_pipes_mounts": None,
        "Проверка газовых камер системы контроля уровня подвески - для автомобилей, с регулируемой гидроподвеской/ahc_gas_chambers": None,
    },
}

checklist_rows: list[ChecklistRow] = [

]

checklist_fields: list[ChecklistField] = [

]

for group, rows in checklist.items():
    row_order = 0

    for row, fields in rows.items():
        row_uuid = uuid4()
        row_name, row_code = row.split("/")

        checklist_rows.append(
            ChecklistRow(
                uuid=row_uuid,
                group=group,
                code=row_code,
                name=row_name,
                order=row_order,
            )
        )

        row_order += 1

        if fields is not None:
            field_order = 0

            for field in fields:
                field_uuid = uuid4()
                field_name, field_code, field_type, field_required, field_unit = field

                checklist_fields.append(
                    ChecklistField(
                        uuid=field_uuid,
                        row_uuid=row_uuid,
                        name=field_name,
                        code=field_code,
                        order=field_order,
                        value_type=field_type,
                        is_required=field_required,
                        unit=field_unit,
                    )
                )

                field_order += 1

async def main():
    async with db_helper.session_factory() as session:
        await add_objects(session, checklist_rows)
        await add_objects(session, checklist_fields)

if __name__ == "__main__":
    asyncio.run(main())