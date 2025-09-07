"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, Settings, LogOut, Bell, Sparkles, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Left side - Logo and Sidebar toggle */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <Menu className="size-7" />
                                    <span className="sr-only">Open sidebar</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 sm:w-72 bg-white dark:bg-gray-900">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-800">
                                        <div className="w-8 h-8 bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300 rounded-lg flex items-center justify-center">
                                            <Sparkles size={20} className="text-white" />
                                        </div>
                                        <span className="font-bold text-lg">Upgrad AI</span>
                                    </div>
                                    <nav className="flex-1 p-4 space-y-2">
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <Link href="/">
                                                <User size={24} className="mr-2" />
                                                Shorts Feed
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <a href="/upload">
                                                <Upload size={24} className="mr-2" />
                                                Upload Docs
                                            </a>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <a href="/graph">
                                                <Sparkles size={24} className="mr-2" />
                                                Content Graph
                                            </a>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Bell size={24} className="mr-2" />
                                            Notifications
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Settings size={24} className="mr-2" />
                                            Settings
                                        </Button>
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-base">UA</span>
                            </div>
                            <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white hidden sm:block">Upgrad AI</span>
                        </Link>
                    </div>

                    {/* Center - Empty space */}
                    <div className="flex-1"></div>

                    {/* Right side - Profile and Theme */}
                    <div className="flex items-center space-x-3 sm:space-x-6">
                        <ThemeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" alt="Profile" />
                                        <AvatarFallback className="bg-gradient-to-b from-yellow-300 via-pink-300 to-blue-300 text-white text-xs">
                                            <User size={16} />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">John Doe</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            john.doe@upgrad.ai
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User size={24} className="mr-2" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings size={24} className="mr-2" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut size={24} className="mr-2" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
