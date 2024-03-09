import crypto from 'crypto';

const getToken = (encoding = 'hex') => {
  return crypto.randomBytes(20).toString(encoding);
};

const getDigestHash = (updateString = '', hashAlgorithm = 'sha256', encoding = 'hex') => {
  return crypto.createHash(hashAlgorithm).update(updateString).digest(encoding);
};

const getDigestHmac = (key, updateString = '', hashAlgorithm = 'sha256', encoding = 'hex') => {
  return crypto.createHmac(hashAlgorithm, key).update(updateString).digest(encoding);
};

const encrypt = (message, key, iv, cipherAlgorithm = 'aes256', inputEncoding = 'utf-8', outputEncoding = 'hex') => {
  const cipher = crypto.createCipheriv(cipherAlgorithm, key, iv);
  const encrypted = cipher.update(message, inputEncoding, outputEncoding);

  return encrypted + cipher.final(outputEncoding);
};

const decrypt = (
  encryptedMessage,
  key,
  iv,
  cipherAlgorithm = 'aes256',
  inputEncoding = 'hex',
  outputEncoding = 'utf-8'
) => {
  const decipher = crypto.createDecipheriv(cipherAlgorithm, key, iv);
  const decrypted = decipher.update(encryptedMessage, inputEncoding, outputEncoding);

  return decrypted + decipher.final(outputEncoding);
};

export default { crypto, getToken, getDigestHash, getDigestHmac, encrypt, decrypt };
