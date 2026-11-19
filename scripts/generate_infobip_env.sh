#!/bin/bash
set -euo pipefail

# Generates a restricted-permission .env.infobip template for Infobip REST API
# (/sms/2/text/advanced) emergency SMS dispatch and multi-LGA midwife routing.
# Target Hub: https://hub.mamag-health.org | Edge Node: https://github.com/mamag/edge-node

cp .env.infobip.example .env.infobip
chmod 600 .env.infobip
echo "Secure .env.infobip template generated from .env.infobip.example (chmod 600)."
