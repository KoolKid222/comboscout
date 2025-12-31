# ComboScout - CS2 Skin Combo Finder

A production-ready Next.js application that finds the perfect CS2 knife and glove combinations within your budget using live market data from the Skinport API.

## Features

- 🎯 **Live Market Data**: Fetches real-time prices from Skinport API (no mock data)
- 🎨 **Aesthetic Matching Algorithm**: Ranks combinations by style compatibility
- 💰 **Budget Filtering**: Find all valid combinations under your budget
- 🌙 **Dark Mode UI**: Beautiful, modern dark-themed interface
- ⚡ **Server-Side Caching**: 5-minute cache to optimize API calls

## How It Works

1. **Server-Side Proxy**: The Next.js API route (`app/api/prices/route.js`) fetches data from Skinport API server-side to avoid CORS issues
2. **Combinatorial Logic**: Generates all valid knife + glove combinations under your budget
3. **Aesthetic Scoring**: Each combination is scored based on:
   - **Perfect Match (100)**: Same finish name (e.g., "Fade" + "Fade")
   - **Color Match (80)**: Same color category (e.g., "Slaughter" + "Crimson Web")
   - **Complementary (60)**: Complementary colors (e.g., "Blue Steel" + "Charred")
   - **Partial Match (40)**: One item has a finish, other doesn't
   - **Basic Match (20)**: Default score

4. **Smart Sorting**: Results sorted by style score (descending), then by total price (descending)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
comboscout2/
├── app/
│   ├── api/
│   │   └── prices/
│   │       └── route.js      # Server-side API proxy
│   ├── globals.css           # Global styles
│   ├── layout.jsx            # Root layout
│   └── page.jsx              # Main frontend page
├── lib/
│   └── styleMatcher.js       # Aesthetic matching algorithm
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## API Details

The application uses the [Skinport Public API](https://api.skinport.com/v1/items):
- Endpoint: `https://api.skinport.com/v1/items?currency=USD`
- No authentication required
- Returns `suggested_price` and `market_hash_name` for all items
- Server-side caching: 5 minutes (300 seconds)

## Technologies

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **TypeScript** (config ready)

## License

MIT

