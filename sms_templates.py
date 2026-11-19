"""
Mama-G GSM-7 Friendly Level 1 Emergency SMS Templates (Python)
--------------------------------------------------------------------------------
Produces single-segment (<=160 char) ASCII/GSM-friendly maternal emergency SMS
messages in English (en), Ibibio (ibb), and Ibeno (ibn) for Infobip dispatch.
"""

from typing import Optional

TEMPLATES = {
    "en": {
        "heat_stress": "MAMA-G L1 [{lga}] ID:{enc_id} Heat stress + maternal risk. Cool/hydrate now; urgent midwife review needed.",
        "vector_malaria": "MAMA-G L1 [{lga}] ID:{enc_id} Fever/malaria risk in pregnancy. Urgent midwife triage & check needed now.",
        "post_flood_waterborne": "MAMA-G L1 [{lga}] ID:{enc_id} Post-flood illness/vomiting in pregnancy. Safe water + midwife care now.",
    },
    "ibb": {
        "heat_stress": "MAMA-G L1 [{lga}] ID:{enc_id} Ufiop eyo ye afina idibi. Nwon mmon, du ke mbiet; kot midwife usop usop.",
        "vector_malaria": "MAMA-G L1 [{lga}] ID:{enc_id} Ufiop utok ye ekpok ke idibi. Se usop usop; midwife oyom ndise idahaemi.",
        "post_flood_waterborne": "MAMA-G L1 [{lga}] ID:{enc_id} Mbia mmon ukwo ke idibi. Da eti mmon; kot midwife usop usop idahaemi.",
    },
    "ibn": {
        "heat_stress": "MAMA-G L1 [{lga}] ID:{enc_id} Okok ofum ye afina eyen-owuo. Nwon mmon, dok ke mbiet; tot midwife usop.",
        "vector_malaria": "MAMA-G L1 [{lga}] ID:{enc_id} Utom utok ye ekpok ke idibi. Se usop usop; tot midwife edieke ufiop odokde.",
        "post_flood_waterborne": "MAMA-G L1 [{lga}] ID:{enc_id} Mbia mmon ukwo ke idibi. Da mmon emi asanade; tot midwife usop idahaemi.",
    },
}

RISK_ALIASES = {
    "extreme_ambient_heat": "heat_stress",
    "peak_mosquito_vector_season": "vector_malaria",
    "post_flood_water_contamination": "post_flood_waterborne",
}


def format_level1_sms(
    lga: Optional[str],
    encounter_id: str,
    risk: Optional[str] = "heat_stress",
    locale: Optional[str] = "en",
) -> str:
    norm_lga = (lga or "UYO").strip().upper()
    norm_locale = (locale or "en").strip().lower()
    raw_risk = (risk or "heat_stress").strip().lower()
    norm_risk = RISK_ALIASES.get(raw_risk, raw_risk)

    locale_map = TEMPLATES.get(norm_locale, TEMPLATES["en"])
    pattern = locale_map.get(norm_risk, TEMPLATES["en"]["heat_stress"])
    message = pattern.format(lga=norm_lga, enc_id=(encounter_id or "ENC-00").strip())
    return message if len(message) <= 160 else f"{message[:157]}..."
