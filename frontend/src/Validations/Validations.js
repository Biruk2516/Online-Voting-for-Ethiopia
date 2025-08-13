// class Validations {
//     constructor()
//     {
  
//     }
  
//     //Validating user name function
//       static validateuserName(userName)
//       {
//         const checkName= /^[A-za-z][A-za-z0-9]{4,}$/
//         if(userName.length < 5){
//           return 'length is too short'
//         }
//         if(!checkName.test(userName))
//         {
//           return 'must start with alphabets'
//         }
//         return ''
  
//       }
  
//       //validating the length of long inputs 
//       static validateInputLength(input)
//       {
//         if(input.length < 100)
//         {
//           return 'minimum 100 character'
//         }
//         if(input.length > 300)
//         {
//           return 'maximum 300 character'
//         }
//         return ''
//       }
  
  
//       //Validationg email inputs
//       static  validateEmail(email) {
//         const checkReg = /^[a-zA-Z0-9]{3,}@[a-zA-Z]{3,}\.[a-zA-Z]{2,}$/;
      
//         if(!email){
//           return 'email is required';
//         }
//         if (!email.includes('@')) {
//             return "Missing '@' symbol.";
//         }
        
//         const parts = email.split('@');
        
//         if (parts[0].length < 3) {
//             return "The part before '@' should have at least 3 characters.";
//         }
        
//         if (!parts[1].includes('.')) {
//             return "Missing '.' symbol after '@'.";
//         }
        
//         const domainParts = parts[1].split('.');
        
//         if (domainParts[0].length < 3) {
//             return "The part after '@' and before '.' should have at least 3 characters.";
//         }
        
//         if (domainParts[1].length < 2) {
//             return "The part after '.' should have at least 2 characters.";
//         }
        
//         if (!checkReg.test(email)) {
//             return "Invalid email format.";
//         }
        
//         return "";
//     }
      
//         //Validating password inputs
//         static validatePassword(password) {
//           const minLength = 8;
//           if (!password) {
//             return "Password is required.";
//           } else if (password.length < minLength) {
//             return `Password must be at least ${minLength} characters long.`;
//           } else if (!/[A-Z]/.test(password)) {
//             return "Password must contain at least one uppercase letter.";
//           } else if (!/[a-z]/.test(password)) {
//             return "Password must contain at least one lowercase letter.";
//           } else if (!/[0-9]/.test(password)) {
//             return "Password must contain at least one number.";
//           } else if (!/[!@#$%^&*]/.test(password)) {
//             return "Password must contain at least one special character.";
//           }
//           return "";
//         }
//   }
  
//   export default Validations;

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