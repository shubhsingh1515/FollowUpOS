import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

class EncryptionService {
  constructor() {
    const rawKey = process.env.ENCRYPTION_KEY || 'followupos_secret_encryption_key_32_bytes!';
    // Ensure key is exactly 32 bytes
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(text) {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      // Return iv:tag:encrypted
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (err) {
      console.error('Encryption error:', err);
      return text;
    }
  }

  decrypt(ciphertext) {
    if (!ciphertext || !ciphertext.includes(':')) return ciphertext;
    try {
      const [ivHex, tagHex, encryptedHex] = ciphertext.split(':');
      if (!ivHex || !tagHex || !encryptedHex) return ciphertext;

      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Decryption error:', err);
      return ciphertext;
    }
  }
}

export const encryptionService = new EncryptionService();
export const encryptToken = (text) => encryptionService.encrypt(text);
export const decryptToken = (ciphertext) => encryptionService.decrypt(ciphertext);
export default encryptionService;
