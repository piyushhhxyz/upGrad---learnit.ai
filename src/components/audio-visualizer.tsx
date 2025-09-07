"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    className?: string;
}

const AudioSpeakingComponent: React.FC<AudioVisualizerProps> = ({ className = "" }) => {
    const [animationValues, setAnimationValues] = useState([0.8, 1.2, 0.9, 0.7]);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const targetValuesRef = useRef([0.8, 1.2, 0.9, 0.7]);
    const currentValuesRef = useRef([0.8, 1.2, 0.9, 0.7]);
    const velocityRef = useRef([0, 0, 0, 0]);

    // Generate new target values with speech-like patterns
    const generateTargets = () => {
        return [0, 1, 2, 3].map((i) => {
            // Create speech-like patterns with different frequencies per blob
            const baseFreq = 0.5 + i * 0.3;
            const intensity = Math.random() > 0.5 ?
                0.4 + Math.random() * 1.1 : // High intensity spikes
                0.7 + Math.random() * 0.5;  // Normal variations

            // Add some correlation between adjacent blobs for realism
            const correlation = i > 0 ? targetValuesRef.current[i - 1] * 0.2 : 0;
            return Math.max(0.3, Math.min(1.6, intensity + correlation * Math.random()));
        });
    };

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            // Generate new targets more frequently for faster animation
            if (Math.random() < 0.04) { // 4% chance per frame (faster)
                targetValuesRef.current = generateTargets();
            }

            // Faster spring physics with more responsive damping
            const newValues = currentValuesRef.current.map((current, i) => {
                const target = targetValuesRef.current[i];
                const diff = target - current;

                // More aggressive spring physics for faster response
                const springForce = diff * 0.12; // Increased from 0.08
                const damping = velocityRef.current[i] * 0.88; // More damping
                velocityRef.current[i] += springForce - damping;

                return current + velocityRef.current[i];
            });

            currentValuesRef.current = newValues;
            setAnimationValues([...newValues]);

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* Main audio visualizer */}
            <div className="flex items-center justify-center space-x-1 relative">
                {animationValues.map((scale, index) => {
                    const baseWidth = index === 1 ? 80 : 60;
                    const baseHeight = index === 1 ? 160 : 120;
                    const currentHeight = baseHeight * scale;

                    return (
                        <div
                            key={index}
                            className="bg-gradient-to-b from-white to-gray-100 rounded-full relative overflow-hidden"
                            style={{
                                width: `${baseWidth}px`,
                                height: `${currentHeight}px`,
                                transition: 'none', // Remove CSS transitions for smoother RAF animation
                                transformOrigin: 'center',
                                boxShadow: `0 0 ${20 + scale * 15}px rgba(255, 255, 255, ${0.3 + scale * 0.2})`,
                            }}
                        >
                            {/* Inner glow effect */}
                            <div
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                                style={{
                                    opacity: scale * 0.6,
                                }}
                            />
                        </div>
                    );
                })}

                {/* Ambient background glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Frequency bars background decoration */}
            <div className="absolute inset-0 -z-20 overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/3 w-1"
                        style={{
                            left: `${(i / 40) * 100}%`,
                            height: `${10 + Math.random() * 40}%`,
                            bottom: '25%',
                            animationDelay: `${i * 30}ms`,
                            animation: 'pulse 1.5s ease-in-out infinite alternate',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export { AudioSpeakingComponent as AudioVisualizer };