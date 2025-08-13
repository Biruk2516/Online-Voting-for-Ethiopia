export default {
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Please enter a valid email';
    return '';
  },
  
  validatePassword: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return '';
  },
  
  validateFullName: (name) => {
    if (!name) return 'Full name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    return '';
  },
  
  validateIdNumber: (idNumber) => {
    if (!idNumber) return 'ID number is required';
    if (!/^[A-Za-z0-9]{6,20}$/.test(idNumber)) return 'Please enter a valid ID number';
    return '';
  },
  
  validateInputLength: (text) => {
    if (!text) return 'This field is required';
    if (text.length < 10) return 'Must be at least 10 characters';
    return '';
  }
};