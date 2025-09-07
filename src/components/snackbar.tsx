"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface SnackbarProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Snackbar({ message, isVisible, onClose, duration = 3000 }: SnackbarProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3 min-w-[280px]">
                <div className="w-6 h-6 bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium text-sm">{message}</span>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
