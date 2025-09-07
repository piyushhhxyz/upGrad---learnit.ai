"use client";

import { Navbar } from '@/components/navbar';
import ContentGraph from '@/components/content-graph';

export default function GraphPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-16 h-screen">
                <div className="h-full w-full">
                    <ContentGraph />
                </div>
            </div>
        </div>
    );
}
