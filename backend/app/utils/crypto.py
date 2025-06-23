from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from base64 import b64encode, b64decode
import os

def generate_encryption_key() -> str:
    """Generate a new encryption key."""
    key = AESGCM.generate_key(bit_length=256)
    return b64encode(key).decode()

def encrypt_password(password: str, key: str) -> tuple[str, str]:
    """
    Encrypt a password using AES-GCM.
    Returns (encrypted_password, iv) both as base64 strings.
    """
    if not key:
        raise ValueError("Encryption key not set")
    
    # Convert key from base64
    key_bytes = b64decode(key)
    
    # Generate a random IV
    iv = os.urandom(12)
    
    # Create cipher
    cipher = AESGCM(key_bytes)
    
    # Encrypt
    ciphertext = cipher.encrypt(iv, password.encode(), None)
    
    # Return base64 encoded values
    return (
        b64encode(ciphertext).decode(),
        b64encode(iv).decode()
    )

def decrypt_password(encrypted_password: str, iv: str, key: str) -> str:
    """
    Decrypt a password using AES-GCM.
    Takes base64 encoded encrypted_password, iv, and key.
    """
    if not key:
        raise ValueError("Encryption key not set")
    
    # Convert from base64
    key_bytes = b64decode(key)
    iv_bytes = b64decode(iv)
    ciphertext = b64decode(encrypted_password)
    
    # Create cipher
    cipher = AESGCM(key_bytes)
    
    # Decrypt
    plaintext = cipher.decrypt(iv_bytes, ciphertext, None)
    return plaintext.decode() 