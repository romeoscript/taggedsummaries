# Environment Setup

## Required Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```bash
# Groq API Configuration
# Get your API key from: https://console.groq.com/keys
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## How to Get Your Groq API Key

1. Visit [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key and paste it in your `.env` file

## Example .env file

```bash
VITE_GROQ_API_KEY=gsk_1234567890abcdef1234567890abcdef1234567890abcdef
```

## Important Notes

- The `.env` file should be in the `frontend/` directory
- Never commit your `.env` file to version control
- The `VITE_` prefix is required for Vite to expose the variable to the frontend
- Restart your development server after adding environment variables
