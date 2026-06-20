from database import SessionLocal, engine, Base
from models import Program

Base.metadata.create_all(bind=engine)

db = SessionLocal()

programs = [
    {
        "name": "Семейная ипотека",
        "description": "Ставка до 6% годовых. Доступна семьям с детьми (до 6 лет, инвалид до 18 лет или 2+ несовершеннолетних). С февраля 2026: один кредит на семью, оба супруга - созаёмщики. Покупка новостройки, строительство дома или вторичное жильё.",
        "conditions": {
            "maxRate": 6.0,
            "maxAmount": 12000000,
            "requiresChildren": True,
            "requiresIT": False,
            "regions": ["all"]
        },
        "is_active": True
    },
    {
        "name": "IT-ипотека",
        "description": "Ставка 6% для сотрудников аккредитованных IT-компаний. Требования к доходу: 150 тыс. руб/мес в городах-миллионниках, 90 тыс. руб/мес в остальных регионах. Льготная ставка на весь срок кредита.",
        "conditions": {
            "maxRate": 6.0,
            "maxAmount": 15000000,
            "requiresChildren": False,
            "requiresIT": True,
            "regions": ["all"]
        },
        "is_active": True
    },
    {
        "name": "Дальневосточная ипотека",
        "description": "Ставка около 2% для жителей ДФО. Для молодых семей, участников программ 'Гектар', педагогов, медиков, работников ОПК, участников СВО. Обязательна регистрация в регионе после получения права собственности.",
        "conditions": {
            "maxRate": 2.5,
            "maxAmount": 10000000,
            "requiresChildren": False,
            "requiresIT": False,
            "regions": ["far_east"]
        },
        "is_active": True
    },
    {
        "name": "Арктическая ипотека",
        "description": "Ставка около 2% для жителей Арктической зоны. Для молодых семей, участников программ 'Гектар', педагогов, медиков, работников ОПК, участников СВО. Обязательна регистрация в регионе.",
        "conditions": {
            "maxRate": 2.5,
            "maxAmount": 8000000,
            "requiresChildren": False,
            "requiresIT": False,
            "regions": ["arctic"]
        },
        "is_active": True
    },
    {
        "name": "Сельская ипотека",
        "description": "Ставка около 3% для работников АПК, социальной сферы в сёлах, предпринимателей в сельском хозяйстве и участников СВО. Приоритет для развития сельских территорий.",
        "conditions": {
            "maxRate": 3.5,
            "maxAmount": 6000000,
            "requiresChildren": False,
            "requiresIT": False,
            "regions": ["rural"]
        },
        "is_active": True
    },
    {
        "name": "Ипотека для участников СВО",
        "description": "Специальные условия для участников СВО и их семей. Помимо других программ, есть защита от ареста счетов при просрочках (при подаче заявления в банк и ФССП). Доступны общие программы (семейная, дальневосточная) с особыми условиями.",
        "conditions": {
            "maxRate": 5.0,
            "maxAmount": 20000000,
            "requiresChildren": False,
            "requiresIT": False,
            "regions": ["all"]
        },
        "is_active": True
    },
    {
        "name": "Молодая семья",
        "description": "Программа государственной поддержки для молодых семей (оба супруга до 35 лет). Возможны субсидии на первоначальный взнос от государства. Условия и размер субсидии зависят от региона.",
        "conditions": {
            "maxRate": 7.0,
            "maxAmount": 5000000,
            "requiresChildren": False,
            "requiresIT": False,
            "regions": ["all"]
        },
        "is_active": True
    },
    {
        "name": "Льготная ипотека для многодетных",
        "description": "Специальные условия для семей с 3+ детьми. Возможны льготы по процентной ставке, кэшбэк или помощь с первоначальным взносом. Требования различаются по регионам.",
        "conditions": {
            "maxRate": 5.5,
            "maxAmount": 18000000,
            "requiresChildren": True,
            "requiresIT": False,
            "regions": ["all"]
        },
        "is_active": True
    },
]

for prog in programs:
    existing = db.query(Program).filter(Program.name == prog["name"]).first()
    if not existing:
        program = Program(**prog)
        db.add(program)
    else:
        # Обновить существующую программу
        existing.description = prog["description"]
        existing.conditions = prog["conditions"]

db.commit()
db.close()
print("✅ Programs seeded successfully!")
