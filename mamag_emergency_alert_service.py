"""
Mama-G Infobip Emergency Alert Dispatcher & Startup Environment Loader
--------------------------------------------------------------------------------
Targets Regional Hub (https://hub.mamag-health.org) and Edge Node deployments
(https://github.com/mamag/edge-node).

Dispatches Level 1 maternal and climate-health obstetric emergency SMS alerts
to on-call Akwa Ibom midwives (Uyo, Ibeno, Mbo) via the Infobip REST API
(/sms/2/text/advanced) with BOM-safe environment initialization, API-key masking,
dry-run support, timeout safety, and Ibibio (ibb) / Ibeno (ibn) / English context.
"""

from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import requests
except ImportError:
    requests = None  # type: ignore[assignment]

try:
    from dotenv import load_dotenv as _dotenv_load
except ImportError:
    _dotenv_load = None


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (MamaGAlertService): %(message)s",
)
logger = logging.getLogger("MamaGAlertService")


DEFAULT_HUB_URL = "https://hub.mamag-health.org"
DEFAULT_EDGE_REPO = "https://github.com/mamag/edge-node"
DEFAULT_SMS_FROM = "ServiceSMS"
DEFAULT_ENV_FILES: Tuple[str, ...] = (".env.infobip", ".env")
INFOBIP_SMS_ENDPOINT_PATH = "/sms/2/text/advanced"

# Localized emergency prompt cues for Akwa Ibom field deployments
DIALECT_EMERGENCY_TAGS: Dict[str, Dict[str, str]] = {
    "en": {
        "label": "EN",
        "urgent_cue": "Immediate midwife escalation required",
        "extreme_heat": "Extreme heat stress / preeclampsia danger",
        "vector_malaria": "Climate-triggered severe malaria fever",
        "waterborne_flood_risk": "Post-flood acute dehydration risk",
    },
    "ibb": {
        "label": "IBB (Ibibio)",
        "urgent_cue": "Ufan̄ mbọm mme eka: Nyene un̄wam idahaemi",
        "extreme_heat": "Idem kpon̄ ut / isọn̄ ke ubọk ye iso (Extreme heat preeclampsia)",
        "vector_malaria": "Utọdọn̄ ye usen ofụn̄ mîkpon̄ (Severe vector malaria)",
        "waterborne_flood_risk": "Udọn̄ọ mmọn̄ mbịt (Post-flood waterborne risk)",
    },
    "ibn": {
        "label": "IBN (Ibeno)",
        "urgent_cue": "Obio Ibeno mbọm eka: Koot midwife idahaemi",
        "extreme_heat": "Idem kpon̄ ut Ibeno / iso ye ubọk usụhọ (Coastal heat stress)",
        "vector_malaria": "Utọdọn̄ coastal malaria ye ofụn̄ (Vector malaria surge)",
        "waterborne_flood_risk": "Mmọn̄ udim coastal diarrhea risk (Flood waterborne)",
    },
}


def normalize_infobip_base_url(raw_url: Optional[str]) -> str:
    """
    Normalize INFOBIP_BASE_URL to bare hostname (e.g. '<your-subdomain>.api.infobip.com')
    by stripping whitespace, leading http:// or https://, and trailing slashes.
    """
    if not raw_url:
        return ""
    cleaned = raw_url.strip()
    cleaned = re.sub(r"^https?://", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.rstrip("/")
    # Keep host[:port] cleanly if a user pasted a trailing path like /sms/2/text/advanced
    if "/" in cleaned:
        cleaned = cleaned.split("/", 1)[0]
    return cleaned.strip()


def is_placeholder_value(value: Optional[str]) -> bool:
    """Detect template placeholder values so unconfigured templates do not trigger live HTTP calls."""
    if not value:
        return True
    v = value.strip().lower()
    return (
        v == ""
        or ("<" in v and ">" in v)
        or "your-subdomain" in v
        or "your-infobip" in v
        or "your_infobip" in v
        or "registered-phone" in v
        or "verified-test-recipient" in v
        or "xxxxx" in v
        or "replace_with" in v
        or v.startswith("my_")
        or v in {"changeme", "placeholder", "example"}
    )


def normalize_phone_destination(raw_phone: Optional[str]) -> Optional[str]:
    """
    Normalize E.164 / international phone numbers for Infobip 'destinations[].to':
    strips leading '+', whitespace, hyphens, and non-digit formatting characters.
    Returns None for placeholder strings.
    """
    if not raw_phone or is_placeholder_value(raw_phone):
        return None
    digits = re.sub(r"\D+", "", raw_phone.strip())
    return digits or None


def normalize_sms_sender(raw_sender: Optional[str], default: str = DEFAULT_SMS_FROM) -> str:
    """
    Normalize INFOBIP_SMS_FROM:
    - Placeholder/empty values safely fall back to DEFAULT_SMS_FROM ('ServiceSMS').
    - Numeric phone senders (e.g. '+234 803...' or '447860...') are stripped to bare digits without '+'.
    - Alphanumeric sender IDs (e.g. 'ServiceSMS', 'MamaGAlert') are preserved trimmed.
    """
    if not raw_sender or is_placeholder_value(raw_sender):
        return default
    cleaned = raw_sender.strip()
    # If sender looks like a phone number (only +, digits, spaces, hyphens, parens), strip non-digits
    if re.fullmatch(r"[\d\s+\-()]+", cleaned):
        digits = re.sub(r"\D+", "", cleaned)
        return digits or default
    return cleaned


def parse_bool_env(raw_val: Optional[str], default: bool = False) -> bool:
    """Parse boolean environment flags such as ALERT_DRY_RUN."""
    if raw_val is None or raw_val.strip() == "":
        return default
    lowered = raw_val.strip().lower()
    if lowered in {"1", "true", "yes", "y", "on"}:
        return True
    if lowered in {"0", "false", "no", "n", "off"}:
        return False
    return default


def mask_secret(value: Optional[str]) -> str:
    """Safely mask API keys for startup diagnostics without exposing credentials."""
    if not value or not value.strip():
        return "<not set>"
    v = value.strip()
    if is_placeholder_value(v):
        return "<placeholder>"
    if len(v) <= 8:
        return "****"
    return f"{v[:3]}****{v[-4:]}"


def _parse_env_file_bom_safe(path: Path) -> int:
    """
    BOM-safe UTF-8 (utf-8-sig) fallback parser for .env files.
    Never overwrites variables already present in os.environ (Docker/prod precedence).
    """
    loaded_count = 0
    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.lower().startswith("export "):
            line = line[7:].strip()
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip()
        if (val.startswith('"') and val.endswith('"')) or (
            val.startswith("'") and val.endswith("'")
        ):
            val = val[1:-1]
        if key and key not in os.environ:
            os.environ[key] = val
            loaded_count += 1
    return loaded_count


def load_environment(env_files: Iterable[str] = DEFAULT_ENV_FILES) -> List[str]:
    """
    Load local .env.infobip / .env files cleanly at startup without overriding
    standard OS / Docker environment variables. Uses python-dotenv when available
    with a BOM-safe utf-8-sig loader fallback.
    """
    loaded_files: List[str] = []
    for env_file in env_files:
        path = Path(env_file)
        if not path.is_file():
            continue
        try:
            if _dotenv_load is not None:
                _dotenv_load(dotenv_path=path, override=False, encoding="utf-8-sig")
            else:
                _parse_env_file_bom_safe(path)
            loaded_files.append(str(path))
        except OSError as exc:
            logger.warning("Could not read environment file %s: %s", env_file, exc)
    return loaded_files


class MamaGEmergencyConfig:
    """Centralized startup configuration for Infobip SMS & Akwa Ibom LGA routing."""

    MAMAG_HUB_URL: str = DEFAULT_HUB_URL
    MAMAG_EDGE_REPO: str = DEFAULT_EDGE_REPO
    INFOBIP_BASE_URL: str = ""
    INFOBIP_API_KEY: str = ""
    INFOBIP_SMS_FROM: str = DEFAULT_SMS_FROM
    INFOBIP_TEST_TO: Optional[str] = None
    ALERT_DRY_RUN: bool = False
    MIDWIFE_NUMBERS: Dict[str, Optional[str]] = {
        "Uyo": None,
        "Ibeno": None,
        "Mbo": None,
    }
    LOADED_ENV_FILES: List[str] = []

    @classmethod
    def refresh(cls, env_files: Iterable[str] = DEFAULT_ENV_FILES) -> None:
        cls.LOADED_ENV_FILES = load_environment(env_files)
        cls.MAMAG_HUB_URL = (os.getenv("MAMAG_HUB_URL") or DEFAULT_HUB_URL).strip()
        cls.MAMAG_EDGE_REPO = (os.getenv("MAMAG_EDGE_REPO") or DEFAULT_EDGE_REPO).strip()
        cls.INFOBIP_BASE_URL = normalize_infobip_base_url(os.getenv("INFOBIP_BASE_URL"))
        cls.INFOBIP_API_KEY = (os.getenv("INFOBIP_API_KEY") or "").strip()
        cls.INFOBIP_SMS_FROM = normalize_sms_sender(os.getenv("INFOBIP_SMS_FROM"), DEFAULT_SMS_FROM)
        cls.INFOBIP_TEST_TO = normalize_phone_destination(os.getenv("INFOBIP_TEST_TO"))
        cls.ALERT_DRY_RUN = parse_bool_env(os.getenv("ALERT_DRY_RUN"), default=False)
        cls.MIDWIFE_NUMBERS = {
            "Uyo": normalize_phone_destination(os.getenv("MIDWIFE_ONCALL_UYO")),
            "Ibeno": normalize_phone_destination(os.getenv("MIDWIFE_ONCALL_IBENO")),
            "Mbo": normalize_phone_destination(os.getenv("MIDWIFE_ONCALL_MBO")),
        }

    @classmethod
    def has_live_credentials(cls) -> bool:
        return (
            not is_placeholder_value(cls.INFOBIP_BASE_URL)
            and not is_placeholder_value(cls.INFOBIP_API_KEY)
        )

    @classmethod
    def missing_required_vars(cls) -> List[str]:
        missing: List[str] = []
        if is_placeholder_value(cls.INFOBIP_BASE_URL):
            missing.append("INFOBIP_BASE_URL")
        if is_placeholder_value(cls.INFOBIP_API_KEY):
            missing.append("INFOBIP_API_KEY")
        return missing

    @classmethod
    def get_midwife_for_lga(cls, lga: str) -> Optional[str]:
        normalized = (lga or "").strip().lower()
        for key, number in cls.MIDWIFE_NUMBERS.items():
            if key.lower() == normalized and number:
                return number
        return cls.MIDWIFE_NUMBERS.get("Uyo") or cls.INFOBIP_TEST_TO

    @classmethod
    def startup_summary(cls) -> Dict[str, Any]:
        missing = cls.missing_required_vars()
        return {
            "provider": "infobip",
            "hub_url": cls.MAMAG_HUB_URL,
            "edge_repo": cls.MAMAG_EDGE_REPO,
            "loaded_env_files": cls.LOADED_ENV_FILES,
            "infobip_base_url": cls.INFOBIP_BASE_URL or "<not set>",
            "infobip_api_key": mask_secret(cls.INFOBIP_API_KEY),
            "infobip_sms_from": cls.INFOBIP_SMS_FROM,
            "infobip_test_to": cls.INFOBIP_TEST_TO or "<not set>",
            "midwife_routes_configured": {
                lga: bool(num) for lga, num in cls.MIDWIFE_NUMBERS.items()
            },
            "alert_dry_run": cls.ALERT_DRY_RUN,
            "live_ready": cls.has_live_credentials() and not cls.ALERT_DRY_RUN,
            "missing_required": missing,
        }

    @classmethod
    def validate_and_log_startup(
        cls,
        fail_fast: bool = False,
        env_files: Iterable[str] = DEFAULT_ENV_FILES,
    ) -> Dict[str, Any]:
        """
        Load environment, log masked startup diagnostics, and warn or fail fast
        when required Infobip settings are absent.
        """
        cls.refresh(env_files=env_files)
        summary = cls.startup_summary()
        logger.info(
            "Startup Env Initialized | Hub=%s | EdgeRepo=%s | EnvFiles=%s | "
            "INFOBIP_BASE_URL=%s | INFOBIP_API_KEY=%s | INFOBIP_SMS_FROM=%s | "
            "INFOBIP_TEST_TO=%s | Midwives(Uyo=%s, Ibeno=%s, Mbo=%s) | ALERT_DRY_RUN=%s",
            summary["hub_url"],
            summary["edge_repo"],
            summary["loaded_env_files"] or ["<os.environ only>"],
            summary["infobip_base_url"],
            summary["infobip_api_key"],
            summary["infobip_sms_from"],
            summary["infobip_test_to"],
            summary["midwife_routes_configured"]["Uyo"],
            summary["midwife_routes_configured"]["Ibeno"],
            summary["midwife_routes_configured"]["Mbo"],
            summary["alert_dry_run"],
        )

        missing = summary["missing_required"]
        if missing:
            msg = (
                f"Missing or placeholder Infobip configuration: {', '.join(missing)}. "
                "Live SMS dispatch is disabled until real credentials are configured "
                "(or set ALERT_DRY_RUN=true for explicit dry-run testing)."
            )
            if fail_fast and not cls.ALERT_DRY_RUN:
                logger.error(msg)
                raise RuntimeError(msg)
            logger.warning(msg)

        if not any(cls.MIDWIFE_NUMBERS.values()) and not cls.INFOBIP_TEST_TO:
            logger.warning(
                "No midwife recipient numbers configured (MIDWIFE_ONCALL_UYO/IBENO/MBO or INFOBIP_TEST_TO)."
            )

        return summary


def initialize_emergency_env(
    fail_fast: bool = False,
    env_files: Iterable[str] = DEFAULT_ENV_FILES,
) -> Dict[str, Any]:
    """Convenience startup entrypoint for FastAPI hub, CLI tools, and workers."""
    return MamaGEmergencyConfig.validate_and_log_startup(
        fail_fast=fail_fast,
        env_files=env_files,
    )


class MamaGEmergencyAlertService:
    """
    Infobip REST API (/sms/2/text/advanced) emergency alert dispatcher for Level 1
    maternal and climate-health triage events across Akwa Ibom LGAs.
    """

    def __init__(
        self,
        secrets_override: Optional[Dict[str, str]] = None,
        timeout_seconds: float = 8.0,
        env_files: Iterable[str] = DEFAULT_ENV_FILES,
    ):
        MamaGEmergencyConfig.refresh(env_files=env_files)
        secrets = secrets_override or {}

        self.base_url = normalize_infobip_base_url(
            secrets.get("INFOBIP_BASE_URL") or MamaGEmergencyConfig.INFOBIP_BASE_URL
        )
        self.api_key = (
            secrets.get("INFOBIP_API_KEY") or MamaGEmergencyConfig.INFOBIP_API_KEY
        ).strip()
        self.sms_from = normalize_sms_sender(
            secrets.get("INFOBIP_SMS_FROM") or MamaGEmergencyConfig.INFOBIP_SMS_FROM,
            DEFAULT_SMS_FROM,
        )
        self.test_to = normalize_phone_destination(
            secrets.get("INFOBIP_TEST_TO") or MamaGEmergencyConfig.INFOBIP_TEST_TO
        )
        self.dry_run = (
            parse_bool_env(secrets.get("ALERT_DRY_RUN"), default=MamaGEmergencyConfig.ALERT_DRY_RUN)
            if "ALERT_DRY_RUN" in secrets
            else MamaGEmergencyConfig.ALERT_DRY_RUN
        )
        self.timeout_seconds = timeout_seconds

        self.midwife_directory: Dict[str, Optional[str]] = {
            "uyo": normalize_phone_destination(secrets.get("MIDWIFE_ONCALL_UYO"))
            or MamaGEmergencyConfig.MIDWIFE_NUMBERS.get("Uyo"),
            "ibeno": normalize_phone_destination(secrets.get("MIDWIFE_ONCALL_IBENO"))
            or MamaGEmergencyConfig.MIDWIFE_NUMBERS.get("Ibeno"),
            "mbo": normalize_phone_destination(secrets.get("MIDWIFE_ONCALL_MBO"))
            or MamaGEmergencyConfig.MIDWIFE_NUMBERS.get("Mbo"),
        }

    def _resolve_midwife_destination(
        self,
        location_lga: str,
        recipient_override: Optional[str] = None,
    ) -> Optional[str]:
        if recipient_override:
            return normalize_phone_destination(recipient_override)
        lga_key = (location_lga or "").strip().lower()
        return (
            self.midwife_directory.get(lga_key)
            or self.midwife_directory.get("uyo")
            or self.test_to
        )

    def _build_sms_text(
        self,
        encounter_id: str,
        device_id: str,
        location_lga: str,
        climate_risk: str,
        action_taken: str,
        language_code: str = "en",
    ) -> str:
        lang = (language_code or "en").strip().lower()
        if lang not in DIALECT_EMERGENCY_TAGS:
            lang = "en"
        dialect = DIALECT_EMERGENCY_TAGS[lang]

        risk_key = (climate_risk or "obstetric_red_flag").strip().lower()
        localized_risk = dialect.get(risk_key)
        if not localized_risk:
            if "heat" in risk_key or "preeclampsia" in risk_key:
                localized_risk = dialect["extreme_heat"]
            elif "malaria" in risk_key or "vector" in risk_key:
                localized_risk = dialect["vector_malaria"]
            elif "flood" in risk_key or "water" in risk_key:
                localized_risk = dialect["waterborne_flood_risk"]
            else:
                localized_risk = risk_key.replace("_", " ").upper()

        return (
            f"[MAMA-G L1 EMERGENCY | {location_lga.upper()} LGA | {dialect['label']}] "
            f"Device: {device_id} | Enc: {encounter_id} | "
            f"Risk: {localized_risk} | Action: {action_taken} | "
            f"{dialect['urgent_cue']}"
        )

    def _build_infobip_payload(self, destination: str, text: str) -> Dict[str, Any]:
        return {
            "messages": [
                {
                    "destinations": [{"to": destination}],
                    "from": self.sms_from,
                    "text": text,
                }
            ]
        }

    def dispatch_level1_emergency(
        self,
        encounter_id: str,
        device_id: str,
        location_lga: str,
        climate_risk: str,
        action_taken: str,
        language_code: str = "en",
        recipient_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Dispatch a Level 1 maternal/climate emergency SMS via Infobip REST API
        (/sms/2/text/advanced). Never raises unhandled exceptions so offline SQLite
        and FastAPI edge-sync batches remain completely resilient.
        """
        destination = self._resolve_midwife_destination(location_lga, recipient_override)
        sms_text = self._build_sms_text(
            encounter_id=encounter_id,
            device_id=device_id,
            location_lga=location_lga or "Uyo",
            climate_risk=climate_risk,
            action_taken=action_taken,
            language_code=language_code,
        )
        endpoint = (
            f"https://{self.base_url}{INFOBIP_SMS_ENDPOINT_PATH}"
            if self.base_url
            else f"https://<unconfigured-infobip-host>{INFOBIP_SMS_ENDPOINT_PATH}"
        )
        payload = self._build_infobip_payload(destination or "", sms_text)

        base_result: Dict[str, Any] = {
            "provider": "infobip",
            "encounter_id": encounter_id,
            "device_id": device_id,
            "location_lga": location_lga or "Uyo",
            "language_code": (language_code or "en").lower(),
            "routed_midwife": destination,
            "sender": self.sms_from,
            "endpoint": endpoint,
            "sms_sent": False,
            "message_id": None,
            "http_status": None,
            "dry_run": False,
            "errors": [],
        }

        if not destination:
            err_msg = (
                f"No midwife destination configured for LGA '{location_lga}' "
                "(set MIDWIFE_ONCALL_UYO/IBENO/MBO or INFOBIP_TEST_TO)."
            )
            logger.error("Infobip alert skipped for %s: %s", encounter_id, err_msg)
            return {**base_result, "status": "failed", "errors": [err_msg]}

        live_creds_ready = (
            not is_placeholder_value(self.base_url)
            and not is_placeholder_value(self.api_key)
        )

        if self.dry_run or not live_creds_ready:
            reason = (
                "ALERT_DRY_RUN=true"
                if self.dry_run
                else "missing/placeholder INFOBIP_BASE_URL or INFOBIP_API_KEY"
            )
            logger.info(
                "[INFOBIP DRY-RUN] Skipping live HTTP POST (%s) | Endpoint=%s | To=%s | Payload=%s",
                reason,
                endpoint,
                destination,
                json.dumps(payload, ensure_ascii=False),
            )
            return {
                **base_result,
                "dry_run": True,
                "dry_run_reason": reason,
                "status": "dry_run",
                "payload": payload,
            }

        if requests is None:
            err_msg = "Python 'requests' library is not installed (pip install -r requirements-hub.txt)."
            logger.error("Infobip dispatch failed for %s: %s", encounter_id, err_msg)
            return {**base_result, "status": "failed", "errors": [err_msg]}

        headers = {
            "Authorization": f"App {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=self.timeout_seconds,
            )
            base_result["http_status"] = response.status_code

            try:
                body = response.json()
            except ValueError:
                body = {"raw_text": response.text[:300]}

            if 200 <= response.status_code < 300:
                messages = body.get("messages") if isinstance(body, dict) else None
                first_msg = messages[0] if isinstance(messages, list) and messages else {}
                message_id = first_msg.get("messageId")
                status_info = first_msg.get("status", {})
                logger.info(
                    "Infobip Level 1 SMS dispatched | Enc=%s | LGA=%s | To=%s | MessageId=%s | Status=%s",
                    encounter_id,
                    location_lga,
                    destination,
                    message_id,
                    status_info.get("name") if isinstance(status_info, dict) else "ACCEPTED",
                )
                return {
                    **base_result,
                    "sms_sent": True,
                    "message_id": message_id,
                    "provider_status": status_info,
                    "status": "success",
                }

            err_detail = (
                f"Infobip HTTP {response.status_code}: "
                f"{json.dumps(body, ensure_ascii=False)[:400]}"
            )
            logger.error(
                "Infobip API error for Enc=%s (LGA=%s): %s",
                encounter_id,
                location_lga,
                err_detail,
            )
            return {
                **base_result,
                "status": "failed",
                "errors": [err_detail],
            }

        except requests.Timeout as exc:
            err_detail = f"Infobip request timed out after {self.timeout_seconds}s: {exc}"
            logger.error("Infobip timeout for Enc=%s (LGA=%s): %s", encounter_id, location_lga, err_detail)
            return {**base_result, "status": "failed", "errors": [err_detail]}
        except requests.RequestException as exc:
            err_detail = f"Infobip network/request error: {exc}"
            logger.error("Infobip request failed for Enc=%s (LGA=%s): %s", encounter_id, location_lga, err_detail)
            return {**base_result, "status": "failed", "errors": [err_detail]}
        except Exception as exc:  # pragma: no cover - defensive guard for edge sync safety
            err_detail = f"Unexpected Infobip dispatcher error: {exc}"
            logger.exception("Unexpected error during Infobip dispatch for Enc=%s", encounter_id)
            return {**base_result, "status": "failed", "errors": [err_detail]}


if __name__ == "__main__":
    initialize_emergency_env(fail_fast=False)
    print(f"Loaded LGA Route (Ibeno): {MamaGEmergencyConfig.get_midwife_for_lga('Ibeno')}")
    service = MamaGEmergencyAlertService()
    dispatch_result = service.dispatch_level1_emergency(
        encounter_id="enc-uuid-9991",
        device_id="TAB-IBENO-042",
        location_lga="Ibeno",
        climate_risk="extreme_heat",
        action_taken="Immediate cooling protocols and emergency referral transport initiated.",
        language_code="ibn",
    )
    print("\n--- Infobip Emergency Dispatch Result ---")
    print(json.dumps(dispatch_result, indent=2, ensure_ascii=False))
