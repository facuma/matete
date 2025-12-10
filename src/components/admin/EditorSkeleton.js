import React from 'react';

export default function EditorSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-200 rounded-lg"></div>
                    <div className="space-y-2">
                        <div className="w-24 h-4 bg-stone-200 rounded"></div>
                        <div className="w-12 h-2 bg-stone-100 rounded"></div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-6 h-6 bg-stone-100 rounded"></div>
                    <div className="w-6 h-6 bg-stone-100 rounded"></div>
                </div>
            </div>
        </div>
    );
}
