const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_SIZE = 32; // 256 bits
const IV_SIZE = 16;  // 128 bits

// Generate random 256-bit key
const generateKey = () => {
  return crypto.randomBytes(KEY_SIZE);
};

// Generate random 128-bit IV
const generateIV = () => {
  return crypto.randomBytes(IV_SIZE);
};

// Encrypt a Buffer (e.g., a file)
const encryptFile = (buffer, key, iv) => {
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAutoPadding(true);

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);

  return encrypted;
};

// Decrypt an encrypted Buffer (e.g., a file)
const decryptFile = (encryptedBuffer, key, iv) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAutoPadding(true);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final()
  ]);

  return decrypted;
};

// Encrypt a UTF-8 string and return hex output and iv
const encryptData = (data, key) => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex') // Export IV so it can be reused for decryption
  };
};

// Decrypt a hex string using key and iv
const decryptData = (encryptedData, key, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = {
  generateKey,
  generateIV,
  encryptFile,
  decryptFile,
  encryptData,
  decryptData
};
