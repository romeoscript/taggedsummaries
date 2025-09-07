# Required Dependencies

To run this frontend, you'll need to install the following dependencies:

## Core Dependencies
```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @coral-xyz/anchor
```

## Development Dependencies
```bash
npm install -D tailwindcss postcss autoprefixer
```

## Setup Commands
```bash
# Initialize Tailwind CSS
npx tailwindcss init -p

# Start development server
npm run dev
```

## Environment Setup

1. **Groq API Key**: Get your API key from https://console.groq.com/keys
2. **Phantom Wallet**: Install the Phantom wallet browser extension
3. **Solana Devnet**: The app is configured to work with Solana devnet

## Features

- ✅ Wallet connection with Phantom
- ✅ Groq AI integration for transaction analysis
- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Local storage for API key
- 🔄 Blockchain integration (placeholder for now)

## Usage

1. Connect your Phantom wallet
2. Enter your Groq API key
3. Describe a campus transaction
4. AI will extract metadata (summary, tags, category)
5. Store the result on Solana blockchain (simulated for now)
