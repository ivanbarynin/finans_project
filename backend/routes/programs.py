from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Program
from schemas import ProgramResponse
from typing import List, Optional

router = APIRouter(prefix="/api/programs", tags=["programs"])

@router.get("", response_model=List[ProgramResponse])
def get_programs(
    db: Session = Depends(get_db),
    has_children: Optional[bool] = Query(None),
    is_it: Optional[bool] = Query(None),
    region: Optional[str] = Query(None),
    is_young_family: Optional[bool] = Query(None),
    is_svo_participant: Optional[bool] = Query(None),
    is_multi_child: Optional[bool] = Query(None),
    is_apk_worker: Optional[bool] = Query(None)
):
    programs = db.query(Program).filter(Program.is_active == True).all()

    # Если фильтры не установлены, вернуть все программы
    if not any([has_children, is_it, region, is_young_family, is_svo_participant, is_multi_child, is_apk_worker]):
        return programs

    filtered = []
    for program in programs:
        name = program.name.lower()
        conditions = program.conditions

        # Проверка по детям
        if has_children and "семейн" not in name and "многодетн" not in name:
            continue

        # Проверка по IT
        if is_it and "it" not in name.lower():
            continue

        # Проверка по молодой семье
        if is_young_family and "молодая семья" not in name:
            continue

        # Проверка по участникам СВО
        if is_svo_participant and "сво" not in name:
            continue

        # Проверка по многодетности
        if is_multi_child and "многодетн" not in name:
            continue

        # Проверка по работникам АПК
        if is_apk_worker and ("сельск" not in name and "апк" not in name):
            continue

        # Проверка по региону
        if region:
            regions = conditions.get("regions", ["all"])
            if region not in regions and "all" not in regions:
                continue

        filtered.append(program)

    return filtered
