"""
Mama-G Edge Cryptographic Secret Vault
--------------------------------------------------------------------------------
Provides AES-GCM authenticated encryption for field tablet secrets, protecting
credentials against physical extraction if a device is misplaced in the field.
"""

import os
import json
import base64
import logging
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (SecretVault): %(message)s",
)
logger = logging.getLogger("SecretVault")


class MamaGSecretVault:
    def __init__(self, master_passphrase: str, salt_path: str = "./data/secret.salt"):
        if not master_passphrase:
            raise ValueError("Master passphrase must not be empty.")
        self.master_passphrase = master_passphrase.encode("utf-8")
        self.salt_path = salt_path
        self._key = self._derive_key()

    def _derive_key(self) -> bytes:
        """Derive a 256-bit AES key using PBKDF2-HMAC-SHA256 with a persistent salt."""
        if os.path.exists(self.salt_path):
            with open(self.salt_path, "rb") as f:
                salt = f.read()
        else:
            salt = os.urandom(16)
            os.makedirs(os.path.dirname(os.path.abspath(self.salt_path)), exist_ok=True)
            with open(self.salt_path, "wb") as f:
                f.write(salt)

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        return kdf.derive(self.master_passphrase)

    def encrypt_vault(self, secrets_dict: dict, output_path: str = "./data/secrets.enc"):
        """Encrypt sensitive configuration keys into an authenticated AES-GCM vault file."""
        aesgcm = AESGCM(self._key)
        nonce = os.urandom(12)  # 96-bit nonce for GCM

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
        logger.info(f"Secret vault successfully encrypted and stored at {output_path}")

    def decrypt_vault(self, input_path: str = "./data/secrets.enc") -> dict:
        """Decrypt the secure vault payload into volatile RAM memory."""
        if not os.path.exists(input_path):
            logger.error(f"Encrypted secret vault not found at {input_path}")
            return {}

        with open(input_path, "r", encoding="utf-8") as f:
            payload = json.load(f)

        nonce = base64.b64decode(payload["nonce"])
        ciphertext = base64.b64decode(payload["ciphertext"])

        aesgcm = AESGCM(self._key)
        try:
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return json.loads(plaintext.decode("utf-8"))
        except Exception as e:
            logger.critical(f"Decryption failed! Integrity check or passphrase invalid: {e}")
            raise
