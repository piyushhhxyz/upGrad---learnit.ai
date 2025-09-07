"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Snackbar } from '@/components/snackbar';
import ContentGraph from '@/components/content-graph';


export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showContentGraph, setShowContentGraph] = useState(false);
    const [hasUploadedFile, setHasUploadedFile] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentGraphRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    const acceptedFileTypes = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'text/plain': '.txt',
        'application/rtf': '.rtf'
    };


    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const scrollToTop = () => {
        heroRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToBottom = () => {
        contentGraphRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const toggleScroll = () => {
        if (showScrollToTop) {
            scrollToTop();
        } else {
            scrollToBottom();
        }
        setShowScrollToTop(!showScrollToTop);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setIsUploading(true);

        // Check file type and size for first file only
        const file = files[0];
        if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
            setSnackbarMessage('Unsupported file format');
            setSnackbarVisible(true);
            setIsUploading(false);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setSnackbarMessage('File too large (max 10MB)');
            setSnackbarVisible(true);
            setIsUploading(false);
            return;
        }

        // Mock upload process
        setTimeout(() => {
            setIsUploading(false);
            setIsGenerating(true);
            setHasUploadedFile(true);

            // After 3 more seconds, show success message and content graph
            setTimeout(() => {
                setIsGenerating(false);
                setShowContentGraph(true);
                setSnackbarMessage('Content graph generated successfully!');
                setSnackbarVisible(true);

                // Scroll to content graph after a short delay
                setTimeout(() => {
                    contentGraphRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 500);
            }, 3000);
        }, 2000);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    return (
        <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${showContentGraph ? '' : 'min-h-screen'}`}>
            <Navbar />

            <div className="pt-16 px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div ref={heroRef} className="text-center mb-16 mt-20">
                        <h1 className="text-6xl font-bold mb-2">
                            Create Content Graph in one click
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Upload your documents and transform them into interactive content graphs
                        </p>
                    </div>

                    {/* Upload Area */}
                    <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm max-w-4xl mx-auto">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl">Upload Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-700/50"
                                onClick={handleFileSelect}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="p-4 rounded-full bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300">
                                        <Upload className="size-12 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Click to upload files</h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            or drag and drop your files here
                                        </p>
                                        <div className={`flex gap-4 ${hasUploadedFile ? 'justify-start' : 'justify-center'}`}>
                                            <Button
                                                className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 hover:from-yellow-500 hover:via-pink-500 hover:to-blue-500 text-white border-0"
                                                disabled={isUploading || isGenerating}
                                            >
                                                {isUploading ? 'Content uploaded successfully...' : isGenerating ? 'Generating content graph...' : 'Choose Files'}
                                            </Button>
                                            {hasUploadedFile && (
                                                <Button
                                                    className='border-1 border-slate-300 dark:border-slate-600 text-black'
                                                    variant="outline"
                                                    onClick={handleFileSelect}
                                                    disabled={isUploading || isGenerating}
                                                >
                                                    Upload Another
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </CardContent>
                    </Card>

                    {/* Content Graph Section */}
                    {showContentGraph && (
                        <div ref={contentGraphRef} className="mt-12">
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-2xl">Generated Content Graph</CardTitle>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Interactive visualization of your content relationships
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[600px] w-full rounded-lg overflow-hidden">
                                        <ContentGraph />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                </div>
            </div>

            <Snackbar
                message={snackbarMessage}
                isVisible={snackbarVisible}
                onClose={() => setSnackbarVisible(false)}
            />

            {/* Scroll Toggle Button */}
            {hasUploadedFile && (
                <Button
                    onClick={toggleScroll}
                    className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg"
                    variant="outline"
                >
                    {showScrollToTop ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                </Button>
            )}
        </div>
    );
}
