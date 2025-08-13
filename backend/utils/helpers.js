export const generateUsername = (fullName) => {
  const base = fullName.toLowerCase().replace(/\s+/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
};

export const generatePassword = () => {
  return Math.random().toString(36).slice(-8); // simple 8-char random password
};
