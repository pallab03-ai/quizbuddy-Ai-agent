// src/utils/validate.js
function validateRegisterInput({ username, password, role }) {
  if (!username || !password || !role) return false;
  if (role !== 'admin' && role !== 'user') return false;
  return true;
}

export { validateRegisterInput };
