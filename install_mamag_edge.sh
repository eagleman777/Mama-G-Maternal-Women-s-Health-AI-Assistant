#!/bin/bash
set -euo pipefail

# ============================================================================
# Mama-G Edge Tablet Master Installation & Provisioning Script
# ============================================================================

echo "============================================================================"
echo "          MAMA-G FIELD TABLET AUTOMATED PROVISIONING UTILITY                "
echo "============================================================================"

# 1. Check for Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "[-] Error: This script must be run as root (use sudo)." >&2
  exit 1
fi

INSTALL_DIR="/app/mamag-edge"
echo "[+] Target installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR/data"
cd "$INSTALL_DIR"

# 2. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "[+] Docker not found. Installing Docker engine..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable --now docker
    echo "[+] Docker installed successfully."
else
    echo "[+] Docker is already installed."
fi

# 3. Interactive Configuration Prompts
echo ""
echo "--- Field Node Configuration ---"
read -rp "Enter Assigned Device ID (e.g., TAB-IBENO-042): " DEVICE_ID
read -rp "Enter Operational LGA (e.g., Ibeno, Mbo, Uyo): " LOCATION_LGA
read -rp "Enter Central Hub URL (e.g., https://hub.mamag-health.org): " CENTRAL_HUB_URL
read -rsp "Enter Secure Device Master Passphrase for Vault Encryption: " MASTER_PASSPHRASE
echo ""
read -rsp "Enter Assigned Regional Hub Device Auth Token: " DEVICE_AUTH_TOKEN
echo ""

# 4. Write Non-Sensitive Environment Config (.env.production)
echo "[+] Writing non-sensitive operational environment config..."
cat << EOF > .env.production
DEVICE_ID=${DEVICE_ID}
CENTRAL_HUB_URL=${CENTRAL_HUB_URL}
LOCATION_LGA=${LOCATION_LGA}
DB_PATH=/app/data/mamag_field_node.db
POLL_INTERVAL_SECONDS=120
LOG_LEVEL=INFO
LOCAL_LANGUAGE_DEFAULT=ibb
EOF

# 5. Write Python Secret Vault Utility & Encrypt Secrets
echo "[+] Generating encrypted cryptographic secret vault (AES-GCM)..."
cat << 'EOF' > mamag_secret_vault.py
import os
import json
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class MamaGSecretVault:
    def __init__(self, master_passphrase: str, salt_path: str = "./data/secret.salt"):
        self.master_passphrase = master_passphrase.encode("utf-8")
        self.salt_path = salt_path
        self._key = self._derive_key()

    def _derive_key(self) -> bytes:
        if os.path.exists(self.salt_path):
            with open(self.salt_path, "rb") as f:
                salt = f.read()
        else:
            salt = os.urandom(16)
            os.makedirs(os.path.dirname(os.path.abspath(self.salt_path)), exist_ok=True)
            with open(self.salt_path, "wb") as f:
                f.write(salt)
        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100_000)
        return kdf.derive(self.master_passphrase)

    def encrypt_vault(self, secrets_dict: dict, output_path: str = "./data/secrets.enc"):
        aesgcm = AESGCM(self._key)
        nonce = os.urandom(12)
        plaintext = json.dumps(secrets_dict).encode("utf-8")
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        payload = {
            "algorithm": "AES-256-GCM",
            "kdf": "PBKDF2-HMAC-SHA256-100000",
            "nonce": base64.b64encode(nonce).decode("utf-8"),
            "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
        }
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=4)
EOF

export MASTER_PASSPHRASE
export DEVICE_AUTH_TOKEN

python3 - <<'EOF'
import os
from mamag_secret_vault import MamaGSecretVault

vault = MamaGSecretVault(master_passphrase=os.environ["MASTER_PASSPHRASE"])
vault.encrypt_vault(
    {
        "DEVICE_AUTH_TOKEN": os.environ["DEVICE_AUTH_TOKEN"],
        "ENCRYPTION_SALT_VERSION": "v1.0",
    },
    output_path="./data/secrets.enc",
)
print("[+] Secret vault successfully encrypted and stored.")
EOF

unset MASTER_PASSPHRASE
unset DEVICE_AUTH_TOKEN

chmod 600 ./data/secrets.enc ./data/secret.salt 2>/dev/null || true

# Remove plain-text vault helper for security
rm -f mamag_secret_vault.py

# 6. Write Production Docker Compose File
echo "[+] Writing secure Docker compose blueprint..."
cat << 'EOF' > docker-compose.secure.yml
version: "3.8"

services:
  mamag-edge-node:
    image: ghcr.io/mamag/edge-node:latest
    container_name: mamag_field_tablet_secure
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - DB_PATH=/app/data/mamag_field_node.db
      - SECRETS_RUNTIME_DIR=/dev/shm/mamag_runtime_secrets
    volumes:
      - mamag_edge_data:/app/data
    tmpfs:
      - /dev/shm:size=16M
    networks:
      - edge_secure_internal
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "python3", "-c", "import sqlite3; conn = sqlite3.connect('/app/data/mamag_field_node.db'); conn.execute('SELECT 1'); conn.close()"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

volumes:
  mamag_edge_data:
    driver: local

networks:
  edge_secure_internal:
    driver: bridge
EOF

# 7. Start Edge Stack
echo "[+] Pulling and launching Mama-G edge stack..."
docker compose -f docker-compose.secure.yml pull
docker compose -f docker-compose.secure.yml up -d

echo ""
echo "============================================================================"
echo "          PROVISIONING COMPLETE: TABLET READY FOR FIELD DEPLOYMENT          "
echo "============================================================================"
echo "Device ID:     ${DEVICE_ID}"
echo "Location LGA:  ${LOCATION_LGA}"
echo "Container:     mamag_field_tablet_secure"
echo "Status:        Running with encrypted secrets in RAM tmpfs."
echo "============================================================================"
