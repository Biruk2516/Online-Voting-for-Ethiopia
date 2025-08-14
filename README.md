# Online Voting System for Ethiopia

A secure online voting system designed specifically for Ethiopia, supporting multiple languages including Amharic, Tigrinya, and Oromo.

## Features

- Multi-language support (English, Amharic, Tigrinya, Oromo)
- Secure voting mechanism
- Real-time translation using Hugging Face API
- Modern React frontend
- Node.js backend

## Environment Setup

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create a `.env` file in the frontend directory:
   ```bash
   touch .env
   ```

3. Add your Hugging Face API token to the `.env` file:
   ```
   VITE_HUGGINGFACE_API_TOKEN=your_huggingface_token_here
   ```

   **Note:** Get your Hugging Face API token from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

## Security Notes

- Never commit API tokens or sensitive credentials to version control
- The `.env` file is automatically ignored by git
- Always use environment variables for sensitive configuration

## Contributing

Please ensure that any API tokens or sensitive information are properly configured using environment variables and not hardcoded in the source code.