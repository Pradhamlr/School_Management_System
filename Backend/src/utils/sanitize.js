function stripPasswords(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripPasswords);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'password') continue;
    out[k] = stripPasswords(v);
  }
  return out;
}

module.exports = { stripPasswords };
