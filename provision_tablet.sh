#!/bin/bash
set -euo pipefail

echo "[Mama-G Provisioning] Initializing secure secret vault on field tablet..."

# Prompt technician for master passphrase and regional hub sync token
read -rsp "Enter Device Master Passphrase: " MASTER_PASSPHRASE
echo
read -rsp "Enter Regional Hub Device Auth Token: " DEVICE_AUTH_TOKEN
echo

# Pass credentials via environment variables rather than shell-interpolated strings
export MASTER_PASSPHRASE
export DEVICE_AUTH_TOKEN

python3 - <<'EOF'
import os
from mamag_secret_vault import MamaGSecretVault

passphrase = os.environ["MASTER_PASSPHRASE"]
auth_token = os.environ["DEVICE_AUTH_TOKEN"]

vault = MamaGSecretVault(master_passphrase=passphrase)
vault.encrypt_vault(
    {
        "DEVICE_AUTH_TOKEN": auth_token,
        "ENCRYPTION_SALT_VERSION": "v1.0",
    },
    output_path="./data/secrets.enc",
)
print("[Mama-G Provisioning] Encrypted secret vault created successfully.")
EOF

unset MASTER_PASSPHRASE
unset DEVICE_AUTH_TOKEN

chmod 600 ./data/secrets.enc ./data/secret.salt 2>/dev/null || true

echo "[Mama-G Provisioning] Tablet is securely provisioned and ready for deployment."
