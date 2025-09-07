# Upgrad AI - YouTube Shorts Clone

A Next.js application that mimics YouTube Shorts with a vertical scrollable feed interface.

## Features

- **Vertical Scrollable Feed**: Full-screen height cards that snap to view
- **Smooth Scrolling**: CSS scroll-snap for smooth transitions between cards
- **Modern UI**: Built with shadcn/ui components using the "new-york" style preset
- **Responsive Design**: Optimized for mobile and desktop viewing
- **Clean Interface**: Simple, distraction-free design focused on content

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React 19** for the frontend

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- **Scroll down** to navigate through the shorts feed
- Each card represents a full-screen video placeholder
- The interface uses CSS scroll-snap for smooth transitions
- Cards are designed to be swipeable on mobile devices

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and scroll behavior
│   └── page.tsx         # Main shorts feed component
├── components/
│   └── ui/
│       └── card.tsx     # shadcn/ui Card component
└── lib/
    └── utils.ts         # Utility functions
```

## Customization

The shorts data is defined in `src/app/page.tsx`. You can easily modify:
- Card titles and content
- Color gradients for each card
- Number of cards in the feed
- Card layout and styling

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint