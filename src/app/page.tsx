"use client";

import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { Snackbar } from "@/components/snackbar";
import { Progress } from "@/components/ui/progress";
import { Heart, Bookmark, Share2, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { callOpenAI } from "@/lib/api";
import { AudioManager, AudioState } from "@/lib/audio-utils";
import QuizCard from "@/components/quiz-card";
import { pythonQuizData } from "@/lib/quiz-data";

// Sample data for the shorts feed
const shortsData = [
  {
    id: 1,
    gradient: "linear-gradient(135deg, #8b6f47, #a05252, #6b5b95, #4a4a8a)",
    animation: "gradient-1"
  },
  {
    id: 2,
    gradient: "linear-gradient(135deg, #d63384, #e83e8c, #fd7e14, #dc3545)",
    animation: "gradient-2"
  },
  {
    id: 3,
    gradient: "linear-gradient(135deg, #20c997, #fd7e14, #6f42c1, #e83e8c)",
    animation: "gradient-3"
  },
  {
    id: 4,
    gradient: "linear-gradient(135deg, #fd7e14, #dc3545, #6f42c1, #20c997)",
    animation: "gradient-4"
  },
  {
    id: 5,
    gradient: "linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)",
    animation: "gradient-5",
    isQuiz: true
  },
  {
    id: 6,
    gradient: "linear-gradient(135deg, #0d6efd, #6f42c1, #d63384, #fd7e14)",
    animation: "gradient-6"
  }
];

export default function Home() {
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [savedCards, setSavedCards] = useState<Set<number>>(new Set());
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Saved to collection");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<number | null>(null);
  const [cardProgress, setCardProgress] = useState<Record<number, number>>({});
  const [visibleCardId, setVisibleCardId] = useState<number | null>(null);
  const currentVisibleCardRef = useRef<number | null>(null);
  const [userManuallyPaused, setUserManuallyPaused] = useState(false);
  const [hasFirstClick, setHasFirstClick] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number; cardId: number } | null>(null);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [isSwipeDetected, setIsSwipeDetected] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingCardId, setLoadingCardId] = useState<number | null>(null);
  const [audioManager, setAudioManager] = useState<AudioManager | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentAudioId: null,
    isMuted: false,
    volume: 0.7
  });

  // Store current audio source for Web Audio API
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Global progress bar state
  const [progressBarProgress, setProgressBarProgress] = useState(0);
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);
  const globalProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Global progress bar animation functions
  const startGlobalProgressAnimation = () => {
    if (globalProgressIntervalRef.current) {
      clearInterval(globalProgressIntervalRef.current);
    }

    setIsProgressAnimating(true);
    setProgressBarProgress(0);

    const duration = 25000; // 25 seconds
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;

    globalProgressIntervalRef.current = setInterval(() => {
      setProgressBarProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          setIsProgressAnimating(false);
          if (globalProgressIntervalRef.current) {
            clearInterval(globalProgressIntervalRef.current);
            globalProgressIntervalRef.current = null;
          }
          return 100;
        }
        return newProgress;
      });
    }, interval);
  };

  const stopGlobalProgressAnimation = () => {
    if (globalProgressIntervalRef.current) {
      clearInterval(globalProgressIntervalRef.current);
      globalProgressIntervalRef.current = null;
    }
    setIsProgressAnimating(false);
  };

  const resumeGlobalProgressAnimation = () => {
    if (progressBarProgress < 100) {
      startGlobalProgressAnimation();
    }
  };

  // Quiz interaction handlers
  const handleQuizCorrectAnswer = () => {
    console.log('Quiz answered correctly! Auto-swiping to next card...');
    setQuizCompleted(true);
    setQuizAnswered(true);
    // Show success snackbar
    setSnackbarMessage("Congrats! It's correct");
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);

    // Auto-swipe to next card after a short delay
    setTimeout(() => {
      const nextCardId = 6; // Swipe to 6th card (after quiz)
      const nextCardElement = cardRefs.current[nextCardId];
      if (nextCardElement) {
        nextCardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 1500);
  };

  const handleQuizWrongAnswer = () => {
    console.log('Quiz answered incorrectly!');
    setQuizAnswered(true);
    // Allow swiping to next card even if wrong
  };

  // Global click handler for first click and mute/unmute
  const handleGlobalClick = () => {
    // First click - unblock browser audio
    if (!hasFirstClick) {
      setHasFirstClick(true);
      console.log('First click detected - browser audio unblocked');
      return;
    }

    // Subsequent clicks - toggle mute/unmute
    if (audioState.isPlaying && gainNode) {
      const newMutedState = !audioState.isMuted;
      console.log('Global click - current muted:', audioState.isMuted, 'new muted:', newMutedState);
      gainNode.gain.value = newMutedState ? 0 : 1;
      setAudioState(prev => ({
        ...prev,
        isMuted: newMutedState,
        // Keep isPlaying and currentAudioId intact when muting/unmuting
        isPlaying: true,
        currentAudioId: prev.currentAudioId
      }));

      // Show mute/unmute icon with fade effect
      setShowAudioIcon(true);
      setTimeout(() => setShowAudioIcon(false), 2000);

      // Control progress bar animation
      if (newMutedState) {
        stopGlobalProgressAnimation();
      } else {
        resumeGlobalProgressAnimation();
      }

      console.log('Audio', newMutedState ? 'muted' : 'unmuted');
    }
  };

  // Simple audio playing function for OpenAI audio content
  const playOpenAIAudio = async (audioId: string, audioContent?: string, cardId?: number) => {
    try {
      if (!audioRef.current) {
        console.error('Audio ref not available');
        return false;
      }

      console.log('Playing OpenAI audio with ID:', audioId);
      console.log('Audio content available:', !!audioContent);

      if (audioContent) {
        try {
          // Use the actual AI-generated audio content
          console.log('Creating audio blob from base64 content...');
          console.log('Base64 content length:', audioContent.length);
          console.log('First 100 chars of base64:', audioContent.substring(0, 100));

          const binaryString = atob(audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          console.log('Binary data length:', bytes.length);
          console.log('First 20 bytes:', Array.from(bytes.slice(0, 20)));

          // Use Web Audio API to play raw PCM16 data directly
          let ctx = audioContext;
          if (!ctx) {
            ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(ctx);
          }
          const sampleRate = 24000; // OpenAI audio sample rate

          // Convert bytes to 16-bit PCM samples
          const samples = new Int16Array(bytes.length / 2);
          for (let i = 0; i < samples.length; i++) {
            samples[i] = (bytes[i * 2] | (bytes[i * 2 + 1] << 8));
          }

          console.log('Converted to PCM samples:', samples.length);
          console.log('First 10 samples:', Array.from(samples.slice(0, 10)));

          // Create audio buffer
          const audioBuffer = ctx.createBuffer(1, samples.length, sampleRate);
          const channelData = audioBuffer.getChannelData(0);

          // Convert 16-bit PCM to float32
          for (let i = 0; i < samples.length; i++) {
            channelData[i] = samples[i] / 32768.0; // Convert to -1.0 to 1.0 range
          }

          // Stop any currently playing audio
          if (currentAudioSource) {
            currentAudioSource.stop();
          }

          // Create gain node for muting if it doesn't exist
          let gain = gainNode;
          if (!gain) {
            gain = ctx.createGain();
            gain.connect(ctx.destination);
            setGainNode(gain);
          }

          // Create buffer source and play
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gain);

          // Store the source for stopping later
          setCurrentAudioSource(source);

          console.log('Playing audio with Web Audio API...');
          source.start();

          // Update audio state
          setAudioState(prev => ({
            ...prev,
            isPlaying: true,
            currentAudioId: audioId
          }));

          // Start progress bar animation for the current card
          if (cardId) {
            startProgressAnimation(cardId);
          }

          // Handle when audio ends
          source.onended = () => {
            setAudioState(prev => ({
              ...prev,
              isPlaying: false,
              currentAudioId: null
            }));
            setCurrentAudioSource(null);
            stopGlobalProgressAnimation();
          };

        } catch (blobError) {
          console.error('Error creating audio blob:', blobError);
          throw blobError;
        }
      } else {
        console.error('No audio content provided for audio ID:', audioId);
        return false;
      }

      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume;

      await audioRef.current.play();

      // Update state manually
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        currentAudioId: audioId
      }));

      console.log('AI-generated audio started playing successfully');
      return true;
    } catch (error) {
      console.error('Failed to play AI audio:', error);
      return false;
    }
  };

  // Handle API call when card is swiped
  const handleCardSwipe = async (cardId: number, autoPlay: boolean = true) => {
    console.log('handleCardSwipe called for card:', cardId, 'autoPlay:', autoPlay);

    // Stop any currently playing audio when switching cards
    if (currentAudioSource) {
      console.log('Stopping previous audio for new card');
      currentAudioSource.stop();
      setCurrentAudioSource(null);
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentAudioId: null
      }));
      stopGlobalProgressAnimation();

      // Show brief notification that audio was stopped
      setShowAudioIcon(true);
      setTimeout(() => setShowAudioIcon(false), 1500);
    }

    try {
      console.log('Setting loading state for card:', cardId);
      setLoadingCardId(cardId);
      setApiError(null);

      console.log('Calling OpenAI API with contentId:', cardId, 'conversationHistory:', conversationHistory);

      // Pass current conversation history to maintain context
      const response = await callOpenAI(cardId, conversationHistory);

      console.log('API response:', response);

      if (response.success && response.audioId) {
        console.log('API call successful, audioId:', response.audioId);
        console.log('Audio content available:', !!response.audioContent);

        // Clear loading state immediately after successful API call
        console.log('Clearing loading state for card:', cardId);
        setLoadingCardId(null);

        // Update conversation history with the response
        // Remove any existing entry for this card first, then add new one
        setConversationHistory(prev => {
          const filtered = prev.filter(entry => entry.cardId !== cardId);
          return [...filtered, {
            cardId,
            audioId: response.audioId,
            audioContent: response.audioContent,
            timestamp: Date.now()
          }];
        });

        // Auto-play audio if user has interacted (first click)
        if (hasFirstClick) {
          console.log('Auto-playing AI-generated audio');
          await playOpenAIAudio(response.audioId, response.audioContent, cardId);
        } else {
          console.log('Audio ready but waiting for first user interaction');
        }

        // No annoying feedback
      } else {
        console.log('API call failed:', response.error);
        setApiError(response.error || "Failed to generate audio");
        // Clear loading state on failure too
        setLoadingCardId(null);
      }
    } catch (error) {
      console.error("API call failed:", error);
      setApiError("Network error occurred");
    } finally {
      setLoadingCardId(null);
    }
  };

  // Handle swipe gestures
  const handleSwipeStart = (e: React.TouchEvent, cardId: number) => {
    console.log('Swipe start detected for card:', cardId);
    const touch = e.touches[0];
    setSwipeStart({ x: touch.clientX, y: touch.clientY, cardId });
    setWatchStartTime(Date.now());
  };

  const handleSwipeEnd = async (e: React.TouchEvent, cardId: number) => {
    console.log('Swipe end detected for card:', cardId);

    if (!swipeStart || swipeStart.cardId !== cardId) {
      console.log('No valid swipe start or card mismatch');
      return;
    }

    // Prevent swiping on quiz card until answered
    if (cardId === 5 && !quizAnswered) {
      console.log('Quiz not answered, preventing swipe');
      setSwipeStart(null);
      setWatchStartTime(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const watchTime = watchStartTime ? Math.floor((Date.now() - watchStartTime) / 1000) : 0;

    console.log('Swipe distance:', distance, 'Direction:', Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical');

    // Check if it's a significant swipe (more than 20px - reduced threshold)
    if (distance > 20) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
      console.log('Significant swipe detected! Calling API for card:', cardId);

      // Call API with card ID and auto-play
      await handleCardSwipe(cardId, true);
    } else {
      console.log('Swipe distance too small:', distance);
    }

    setSwipeStart(null);
    setWatchStartTime(null);
  };

  // Handle mouse swipe for desktop
  const handleMouseDown = (e: React.MouseEvent, cardId: number) => {
    console.log('Mouse down detected for card:', cardId);
    setSwipeStart({ x: e.clientX, y: e.clientY, cardId });
    setWatchStartTime(Date.now());
  };

  const handleMouseUp = async (e: React.MouseEvent, cardId: number) => {
    console.log('Mouse up detected for card:', cardId);

    if (!swipeStart || swipeStart.cardId !== cardId) {
      console.log('No valid mouse swipe start or card mismatch');
      return;
    }

    // Prevent swiping on quiz card until answered
    if (cardId === 5 && !quizAnswered) {
      console.log('Quiz not answered, preventing mouse swipe');
      setSwipeStart(null);
      setWatchStartTime(null);
      return;
    }

    const deltaX = e.clientX - swipeStart.x;
    const deltaY = e.clientY - swipeStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const watchTime = watchStartTime ? Math.floor((Date.now() - watchStartTime) / 1000) : 0;

    console.log('Mouse swipe distance:', distance);

    // Check if it's a significant swipe (more than 20px - reduced threshold)
    if (distance > 20) {
      console.log('Significant mouse swipe detected! Calling API for card:', cardId);
      // Call API with card ID and auto-play
      await handleCardSwipe(cardId, true);
    } else {
      console.log('Mouse swipe distance too small:', distance);
    }

    setSwipeStart(null);
    setWatchStartTime(null);
  };

  const handleLike = async (cardId: number) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });

  };

  const handleSave = async (cardId: number) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setSavedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
        setSnackbarVisible(false);
      } else {
        newSet.add(cardId);
        setSnackbarMessage("Saved to collection");
        setSnackbarVisible(true);
      }
      return newSet;
    });

  };

  const handleShare = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Check out this amazing content!',
        text: 'Look at this cool video I found!',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Start progress animation for a card
  const startProgressAnimation = (cardId: number) => {
    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Only reset progress if it's a new card or progress is 0
    if (!cardProgress[cardId] || cardProgress[cardId] === 0) {
      setCardProgress(prev => ({ ...prev, [cardId]: 0 }));
    }

    // Mock duration (in milliseconds) - different for each card
    const duration = 10000 + (cardId * 2000); // 10s, 12s, 14s, etc.
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;

    let currentProgress = cardProgress[cardId] || 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressIntervalRef.current!);
        // Auto-pause when progress completes
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setCurrentCardId(null);
        }
      }
      setCardProgress(prev => ({ ...prev, [cardId]: currentProgress }));
    }, interval);
  };

  // Play AI audio for a card
  const playCardAudio = async (cardId: number) => {
    if (audioRef.current && currentAudio) {
      try {
        // Stop current audio immediately
        if (isPlaying) {
          audioRef.current.pause();
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }

        // Play AI audio
        await audioRef.current.play();
        setIsPlaying(true);
        setCurrentCardId(cardId);

        // Start progress animation
        startProgressAnimation(cardId);

        // Show audio icon briefly
        setShowAudioIcon(true);
        setTimeout(() => setShowAudioIcon(false), 2000);
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }
  };

  // Audio control functions
  const toggleAudio = async (cardId: number) => {
    try {
      // Mark first click for browser audio permission
      if (!hasFirstClick) {
        setHasFirstClick(true);
      }

      // Check if there's audio for this card in conversation history
      const cardAudio = conversationHistory.find(entry => entry.cardId === cardId);

      if (cardAudio && cardAudio.audioId) {
        // Check if this card's audio is currently playing (even if muted)
        const isThisCardPlaying = audioState.isPlaying && audioState.currentAudioId === cardAudio.audioId;
        console.log('toggleAudio - cardId:', cardId, 'isPlaying:', audioState.isPlaying, 'currentAudioId:', audioState.currentAudioId, 'cardAudioId:', cardAudio.audioId, 'isThisCardPlaying:', isThisCardPlaying, 'isMuted:', audioState.isMuted);

        if (isThisCardPlaying) {
          // Audio is playing - toggle mute/unmute
          if (gainNode) {
            const newMutedState = !audioState.isMuted;
            gainNode.gain.value = newMutedState ? 0 : 1;
            setAudioState(prev => ({
              ...prev,
              isMuted: newMutedState,
              // Keep isPlaying and currentAudioId intact when muting/unmuting
              isPlaying: true,
              currentAudioId: prev.currentAudioId
            }));
            console.log('Audio', newMutedState ? 'muted' : 'unmuted');

            // Control progress bar animation
            if (newMutedState) {
              stopGlobalProgressAnimation();
            } else {
              resumeGlobalProgressAnimation();
            }

            // Show mute/unmute icon
            setShowAudioIcon(true);
            setTimeout(() => setShowAudioIcon(false), 2000);
          }
        } else {
          // Audio is not playing - start playing this card's audio
          setUserManuallyPaused(false);
          await playOpenAIAudio(cardAudio.audioId, cardAudio.audioContent, cardId);
          // Show audio icon when playing
          setShowAudioIcon(true);
          setTimeout(() => setShowAudioIcon(false), 2000);
        }
      } else {
        // No audio available for this card yet
        console.log('No audio available for card:', cardId);
      }
    } catch (error) {
      console.log('Audio toggle failed:', error);
    }
  };

  // Initialize audio manager
  useEffect(() => {
    console.log('Initializing audio manager...');
    const manager = new AudioManager(audioRef, setAudioState);
    setAudioManager(manager);
    console.log('Audio manager created:', manager);

    if (audioRef.current) {
      audioRef.current.volume = 0.7; // Set volume to 70% for AI audio
      audioRef.current.loop = false; // Don't loop AI audio
      console.log('Audio ref configured');
    } else {
      console.log('Audio ref not available during initialization');
    }
  }, []);

  // Update audio state when it changes
  useEffect(() => {
    setIsPlaying(audioState.isPlaying);
    setCurrentCardId(audioState.currentAudioId ? parseInt(audioState.currentAudioId) : null);
  }, [audioState]);

  // Handle scroll-based swipe detection
  useEffect(() => {
    const handleScroll = () => {
      // This will be triggered when user scrolls between cards
      // We can add logic here to detect when user moves to next card
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle audio events
  const handleAudioPlay = () => {
    if (audioManager) {
      audioManager.onAudioPlay();
    }
  };

  const handleAudioPause = () => {
    if (audioManager) {
      audioManager.onAudioPause();
    }
    // Don't clear progress animation when paused - keep progress bar
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleAudioEnded = () => {
    if (audioManager) {
      audioManager.onAudioEnded();
    }
    // Clear progress animation when ended
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Intersection Observer for auto-play and API calls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(entry.target.getAttribute('data-card-id') || '0');
            setVisibleCardId(cardId);

            // Only call API if this is a different card from the current one
            if (cardId !== currentVisibleCardRef.current) {
              console.log('Card', cardId, 'became visible, calling API automatically');
              currentVisibleCardRef.current = cardId;
              // Call API - will auto-play if user has interacted
              handleCardSwipe(cardId, true);
            }

            // Auto-play only if user has clicked once (browser permission), hasn't manually paused, and AI audio is available
            if (hasFirstClick && !userManuallyPaused && cardId !== currentCardId && currentAudio) {
              playCardAudio(cardId);
            }
          }
        });
      },
      {
        threshold: 0.7, // Card must be 70% visible
        rootMargin: '0px'
      }
    );

    // Observe all card refs
    Object.values(cardRefs.current).forEach((cardRef) => {
      if (cardRef) {
        observer.observe(cardRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [currentCardId, userManuallyPaused, hasFirstClick, conversationHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (globalProgressIntervalRef.current) {
        clearInterval(globalProgressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" onClick={handleGlobalClick}>
      <style jsx>{`
        @keyframes gradient-1 {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes gradient-2 {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-3 {
          0% { background-position: 0% 0%; }
          33% { background-position: 100% 0%; }
          66% { background-position: 100% 100%; }
          100% { background-position: 0% 100%; }
        }
        @keyframes gradient-4 {
          0% { background-position: 0% 100%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        @keyframes gradient-5 {
          0% { background-position: 0% 0%; }
          20% { background-position: 100% 0%; }
          40% { background-position: 100% 100%; }
          60% { background-position: 0% 100%; }
          80% { background-position: 0% 0%; }
          100% { background-position: 100% 0%; }
        }
        @keyframes gradient-6 {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-7 {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes gradient-8 {
          0% { background-position: 0% 100%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        .gradient-bg {
          background-size: 300% 300%;
        }
        .gradient-1 { animation: gradient-1 12s ease infinite; }
        .gradient-2 { animation: gradient-2 8s ease infinite; }
        .gradient-3 { animation: gradient-3 15s ease infinite; }
        .gradient-4 { animation: gradient-4 10s ease infinite; }
        .gradient-5 { animation: gradient-5 14s ease infinite; }
        .gradient-6 { animation: gradient-6 6s ease infinite; }
        .gradient-7 { animation: gradient-7 16s ease infinite; }
        .gradient-8 { animation: gradient-8 11s ease infinite; }
      `}</style>
      <Navbar />

      {/* Hidden Audio Element - Now used for AI audio only */}
      <audio
        ref={audioRef}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* Audio Icon - Shows briefly when user clicks to mute/unmute */}
      {showAudioIcon && (
        <div className="fixed bottom-20 right-6 z-50 animate-in fade-in-0 zoom-in-95 duration-1000">
          <div className="p-4 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
            {audioState.isMuted ? (
              <VolumeX size={32} className="text-white" />
            ) : (
              <Volume2 size={32} className="text-white" />
            )}
          </div>
        </div>
      )}


      {/* No annoying indicators */}

      {/* No annoying API loading indicator */}

      {/* API Error Indicator */}
      {apiError && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="p-4 rounded-2xl bg-red-500/80 backdrop-blur-md border border-white/20">
            <div className="text-white text-lg font-semibold">Error: {apiError}</div>
            <button
              onClick={() => setApiError(null)}
              className="mt-2 px-4 py-2 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="pt-16 h-screen overflow-hidden flex items-center justify-center px-0 sm:px-4 md:px-6 lg:px-8">
        <div className="h-[90vh] w-full sm:w-[65%] lg:w-[30vw] overflow-y-auto snap-y snap-mandatory scroll-smooth space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
          {shortsData.map((short, index) => (
            <Card
              key={short.id}
              ref={(el) => {
                cardRefs.current[short.id] = el;
              }}
              data-card-id={short.id}
              className="h-[90vh] w-full rounded-lg border-0 snap-start snap-always flex flex-col relative overflow-hidden"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 w-full h-full z-0 gradient-bg ${short.animation}`}
                style={{
                  background: short.gradient,
                  backgroundSize: '300% 300%'
                }}
              />

              {/* Loading Overlay */}
              {loadingCardId === short.id && short.id !== 5 && (
                <div className="absolute inset-0 z-40 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}


              {/* Content Overlay */}
              <div className="relative z-10 flex flex-col h-full">
                {short.id === 5 ? (
                  // Quiz Card for 5th card
                  <QuizCard
                    quizData={pythonQuizData}
                    onCorrectAnswer={handleQuizCorrectAnswer}
                    onWrongAnswer={handleQuizWrongAnswer}
                  />
                ) : (
                  <>
                    {/* Clickable area for audio toggle and swipe detection */}
                    <div
                      className="absolute inset-0 z-20 cursor-pointer"
                      onClick={async () => {
                        // First try to toggle audio
                        await toggleAudio(short.id);

                        // If no audio available, call API
                        const cardAudio = conversationHistory.find(entry => entry.cardId === short.id);
                        if (!cardAudio) {
                          console.log('No audio available, calling API for card:', short.id);
                          await handleCardSwipe(short.id, true);
                        }
                      }}
                      onTouchStart={(e) => handleSwipeStart(e, short.id)}
                      onTouchEnd={(e) => handleSwipeEnd(e, short.id)}
                      onMouseDown={(e) => handleMouseDown(e, short.id)}
                      onMouseUp={(e) => handleMouseUp(e, short.id)}
                    />

                    {/* Audio Visualizer - Center */}
                    <div className="flex-1 flex items-center justify-center p-8">
                      <AudioVisualizer />
                    </div>
                  </>
                )}

                {/* Interactive Icons - Right Side Bottom (Hidden for quiz card) */}
                {short.id !== 5 && (
                  <div className="absolute right-4 bottom-20 flex flex-col space-y-8 z-30">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(short.id)}
                      className="group transition-all duration-200 hover:scale-110"
                    >
                      <div className={`p-2 rounded-full transition-all duration-200 ${likedCards.has(short.id)
                        ? 'bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300'
                        : 'bg-white/20 hover:bg-white/30'
                        }`}>
                        <Heart
                          size={24}
                          className={`transition-all duration-200 ${likedCards.has(short.id)
                            ? 'text-white fill-white'
                            : 'text-white'
                            }`}
                        />
                      </div>
                    </button>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(short.id)}
                      className="group transition-all duration-200 hover:scale-110"
                    >
                      <div className={`p-2 rounded-full transition-all duration-200 ${savedCards.has(short.id)
                        ? 'bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300'
                        : 'bg-white/20 hover:bg-white/30'
                        }`}>
                        <Bookmark
                          size={24}
                          className={`transition-all duration-200 ${savedCards.has(short.id)
                            ? 'text-white fill-white'
                            : 'text-white'
                            }`}
                        />
                      </div>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="group transition-all duration-200 hover:scale-110"
                    >
                      <div className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200">
                        <Share2 size={24} className="text-white" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Progress Bar - Sticky Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/80 rounded-full transition-all duration-100"
                      style={{ width: `${cardProgress[short.id] || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        message={snackbarMessage}
        isVisible={snackbarVisible}
        onClose={() => setSnackbarVisible(false)}
      />
    </div>
  );
}
