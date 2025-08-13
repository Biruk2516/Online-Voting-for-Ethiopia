//export const mongoDBURL = 'mongodb+srv://Brook:Biruk2516@bookstore.yigfg.mongodb.net/books-collection?retryWrites=true&w=majority&appName=Bookstore'
export const PORT = process.env.PORT || 5560;
export const mongoDBURL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookstore';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system';
export const SYSTEM_ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || 'systemadmin@voting.gov.et';
export const SYSTEM_ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD || 'admin123';
export const REGION_ADMIN_KEYS = {
  addis_ababa: 'addisSecret2024',
  afar: 'afarSecret2024',
  amhara: 'amharaSecret2024',
  oromia: 'oromiaSecret2024',
  somali: 'somaliSecret2024',
  tigray: 'tigraySecret2024',
  sidama: 'sidamaSecret2024',
  beni_shangul: 'bsgSecret2024',
  gambela: 'gambelaSecret2024',
  harari: 'harariSecret2024',
  snnp: 'snnpSecret2024',
  diredawa: 'diredawaSecret2024',
  sw_ethiopia: 'sw_ethiopiaSecret2024'
};

// Fayda Configuration
export const FAYDA_CONFIG = {
  CLIENT_ID: process.env.FAYDA_CLIENT_ID,
  CLIENT_SECRET: process.env.FAYDA_CLIENT_SECRET,
  REDIRECT_URI: process.env.FAYDA_REDIRECT_URI || 'http://localhost:3000/fayda-callback',
  AUTH_ENDPOINT: 'https://auth.verifayda.gov.et/authorize',
  TOKEN_ENDPOINT: 'https://auth.verifayda.gov.et/token',
  USERINFO_ENDPOINT: 'https://auth.verifayda.gov.et/userinfo',
  PUBLIC_KEY: process.env.FAYDA_PUBLIC_KEY
};
