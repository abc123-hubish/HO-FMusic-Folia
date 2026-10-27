const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// deploy/qq-api/start.cjs: start the upstream service with a persistent, private encryption key.
const port = Number(process.env.PORT || 3200);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const stateDirectory = path.resolve(process.env.QQ_STATE_DIR || path.join(__dirname, '.auth-state'));
fs.mkdirSync(stateDirectory, { recursive: true, mode: 0o700 });
const sessionPath = path.resolve(process.env.QQ_AUTH_SESSION_PATH || path.join(stateDirectory, 'qq-session.enc'));
const secretPath = path.join(stateDirectory, 'session-secret');

// Keep the generated key across restarts; refuse to replace a missing key for an existing session.
if (!process.env.QQ_SESSION_SECRET?.trim()) {
  if (!fs.existsSync(secretPath)) {
    if (fs.existsSync(sessionPath)) {
      throw new Error('Session encryption key is missing; restore it before starting the service');
    }
    fs.writeFileSync(secretPath, crypto.randomBytes(32).toString('base64'), { mode: 0o600, flag: 'wx' });
  }
  process.env.QQ_SESSION_SECRET = fs.readFileSync(secretPath, 'utf8').trim();
}
if (Buffer.byteLength(process.env.QQ_SESSION_SECRET, 'utf8') < 32) {
  throw new Error('QQ_SESSION_SECRET must contain at least 32 bytes');
}
process.env.PORT = String(port);
process.env.QQ_AUTH_STATE_PATH ||= path.join(stateDirectory, 'qq-device.json');
process.env.QQ_AUTH_SESSION_PATH = sessionPath;
process.env.QQ_DISABLE_UPDATE_CHECK = 'true';
process.env.LOG_LEVEL ||= 'warn';

const { server } = require('@yakult-green-tea/qq-music-api');
if (!server) throw new Error('QQ API did not create an HTTP server');
server.on('error', error => {
  console.error(`QQ API failed to listen: ${error.code || error.name}`);
  process.exit(1);
});
server.on('listening', () => console.log(`QQ API listening on port ${port}; encrypted session persistence enabled`));
const stop = () => {
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.close(() => process.exit(0));
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
