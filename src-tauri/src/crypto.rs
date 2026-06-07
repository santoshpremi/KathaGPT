use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use anyhow::{anyhow, Context};
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use rand::RngCore;

const SERVICE: &str = "com.kathagpt.local";
const USER: &str = "master-key";

fn try_keyring_key() -> anyhow::Result<[u8; 32]> {
    let entry = keyring::Entry::new(SERVICE, USER)?;
    match entry.get_password() {
        Ok(existing) => {
            let decoded = B64
                .decode(existing.trim())
                .context("decode master key from keychain")?;
            if decoded.len() != 32 {
                return Err(anyhow!("invalid master key length"));
            }
            let mut key = [0u8; 32];
            key.copy_from_slice(&decoded);
            Ok(key)
        }
        Err(keyring::Error::NoEntry) => {
            let mut key = [0u8; 32];
            rand::rngs::OsRng.fill_bytes(&mut key);
            entry.set_password(&B64.encode(key))?;
            Ok(key)
        }
        Err(err) => Err(err.into()),
    }
}

fn file_fallback_key() -> anyhow::Result<[u8; 32]> {
    let path = crate::config::app_data_dir()?.join(".master-key");
    if path.exists() {
        let raw = std::fs::read(&path)?;
        if raw.len() == 32 {
            let mut key = [0u8; 32];
            key.copy_from_slice(&raw);
            return Ok(key);
        }
    }
    let mut key = [0u8; 32];
    rand::rngs::OsRng.fill_bytes(&mut key);
    std::fs::write(&path, key)?;
    Ok(key)
}

fn master_key_bytes() -> anyhow::Result<[u8; 32]> {
    try_keyring_key().or_else(|_| file_fallback_key())
}

pub fn encrypt(plaintext: &str) -> anyhow::Result<String> {
    let key = master_key_bytes()?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| anyhow!("{e}"))?;
    let mut nonce_bytes = [0u8; 12];
    rand::rngs::OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| anyhow!("encrypt failed: {e}"))?;
    let mut out = nonce_bytes.to_vec();
    out.extend(ciphertext);
    Ok(B64.encode(out))
}

pub fn decrypt(encoded: &str) -> anyhow::Result<String> {
    let key = master_key_bytes()?;
    let data = B64.decode(encoded.trim()).context("decode ciphertext")?;
    if data.len() < 13 {
        return Err(anyhow!("ciphertext too short"));
    }
    let (nonce_bytes, ciphertext) = data.split_at(12);
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| anyhow!("{e}"))?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let plain = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| anyhow!("decrypt failed: {e}"))?;
    String::from_utf8(plain).context("utf8 plaintext")
}

/// Legacy plaintext keys (pre-encryption) pass through unchanged.
pub fn decrypt_key(stored: &str) -> anyhow::Result<String> {
    if stored.starts_with("enc:") {
        decrypt(&stored[4..])
    } else {
        Ok(stored.to_string())
    }
}

pub fn encrypt_key(plaintext: &str) -> anyhow::Result<String> {
    Ok(format!("enc:{}", encrypt(plaintext)?))
}
