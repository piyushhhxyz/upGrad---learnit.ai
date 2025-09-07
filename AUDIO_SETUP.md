# AI Audio Integration Setup

## Overview
This application now includes AI-powered audio generation using OpenAI's GPT-4o mini audio preview model. The system generates Python micro-lessons based on user interactions.

## Setup Instructions

### 1. Configure OpenAI API Key
Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Features Implemented

#### Audio Generation API (`/api/generate-audio`)
- Uses OpenAI's `gpt-4o-mini-audio-preview-2024-12-17` model
- Generates audio responses in PCM16 format
- Converts to WAV for browser compatibility
- Supports conversation history for context

#### Audio Utilities (`src/lib/audio.ts`)
- `createAudioFromBase64()` - Converts base64 audio to playable HTMLAudioElement
- `playAudio()` - Promise-based audio playback
- `generateAudio()` - Calls the audio generation API
- `createUserInteractionMessage()` - Formats user interactions for the AI

#### User Interaction Tracking
- **Like**: Generates new audio based on user liking content
- **Save**: Generates new audio based on user saving content
- **Swipe**: Ready for swipe gesture integration
- **Watch Time**: Tracks how long user watched (ready for implementation)

### 3. How It Works

1. **Page Load**: Automatically generates and plays the first Python lesson
2. **User Interactions**: When user likes/saves a card, new audio is generated based on their behavior
3. **Conversation History**: Maintains context across interactions
4. **Adaptive Learning**: AI adjusts content based on user behavior patterns

### 4. Audio Format Conversion

The system automatically converts OpenAI's PCM16 audio format to WAV for browser compatibility:
- Sample Rate: 24kHz
- Channels: Mono
- Bit Depth: 16-bit
- Format: WAV

### 5. Error Handling

- Graceful fallback when API key is not configured
- Loading indicators during audio generation
- Error logging for debugging

### 6. Next Steps

To complete the integration:
1. Add swipe gesture detection
2. Implement watch time tracking
3. Add user notes/feedback system
4. Implement quiz functionality
5. Add progress tracking

## Testing

1. Set up your OpenAI API key
2. Start the development server: `npm run dev`
3. Open the home page - first audio should auto-play
4. Like or save a card to generate new audio
5. Check browser console for any errors

## API Endpoints

- `POST /api/generate-audio` - Generate AI audio based on conversation history
- Expects: `{ messages: Array }`
- Returns: `{ audio: { id, data, format }, text: string }`
