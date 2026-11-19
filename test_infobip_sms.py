"""
Mama-G Infobip SMS Integration Test Script
--------------------------------------------------------------------------------
Loads credentials cleanly from .env.infobip / .env (BOM-safe) or OS environment
variables, validates configuration at startup with masked API keys, and sends a
test emergency SMS via the Infobip REST API (/sms/2/text/advanced).
"""

import argparse
import json
import sys

from mamag_emergency_alert_service import (
    MamaGEmergencyAlertService,
    MamaGEmergencyConfig,
    initialize_emergency_env,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Mama-G Infobip SMS integration test")
    parser.add_argument(
        "--env",
        default=".env.infobip",
        help="Primary environment file to load (default: .env.infobip, falls back to .env)",
    )
    parser.add_argument(
        "--lga",
        default="Uyo",
        choices=["Uyo", "Ibeno", "Mbo", "uyo", "ibeno", "mbo"],
        help="Target Akwa Ibom LGA on-call midwife route (default: Uyo)",
    )
    parser.add_argument(
        "--lang",
        default="en",
        choices=["en", "ibb", "ibn"],
        help="Dialect context for alert note: en, ibb (Ibibio), or ibn (Ibeno)",
    )
    parser.add_argument(
        "--to",
        default=None,
        help="Optional recipient override (E.164 or international digits without '+')",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Force ALERT_DRY_RUN=true to log the Infobip payload without sending live HTTP requests",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Exit non-zero immediately at startup if required Infobip variables are missing",
    )
    args = parser.parse_args()

    try:
        initialize_emergency_env(
            fail_fast=args.fail_fast,
            env_files=(args.env, ".env"),
        )
    except RuntimeError as exc:
        print(f"[-] Startup configuration check failed: {exc}")
        return 1

    overrides = {"ALERT_DRY_RUN": "true"} if args.dry_run else None
    service = MamaGEmergencyAlertService(
        secrets_override=overrides,
        env_files=(args.env, ".env"),
    )

    print(
        f"[*] Target LGA: {args.lga} | Resolved Midwife: "
        f"{args.to or MamaGEmergencyConfig.get_midwife_for_lga(args.lga)} | "
        f"Sender: {service.sms_from}"
    )

    result = service.dispatch_level1_emergency(
        encounter_id="ENC-INFOBIP-TEST-001",
        device_id="TAB-EDGE-VERIFY-01",
        location_lga=args.lga,
        climate_risk="extreme_heat",
        action_taken="Test emergency SMS dispatch verification for Akwa Ibom outposts.",
        language_code=args.lang,
        recipient_override=args.to,
    )

    print("\n--- Infobip Test Result ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("status") in {"success", "dry_run"} else 1


if __name__ == "__main__":
    sys.exit(main())
