"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLibraryStore, StudySession } from "@/store/useLibraryStore";

export default function LibraryPage() {
    const router = useRouter();
    const { studySessions, deleteStudySession, setCurrentSessionId } = useLibraryStore();

    const handleDelete = (e: React.MouseEvent, sessionId: string, fileName: string) => {
        e.stopPropagation();
        if (confirm(`"${fileName}" 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            deleteStudySession(sessionId);
        }
    };

    const handleRowClick = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        router.push(`/en/study/${sessionId}`);
    };

    // Sort by newest first
    const sortedSessions = useMemo(() => {
        return [...studySessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [studySessions]);

    return (
        <main className="w-full min-h-screen bg-zinc-900 text-zinc-200 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        Library
                    </h1>
                    <p className="text-slate-400 text-lg">All your uploaded materials and generated study guides.</p>
                </div>

                {sortedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-800/20 rounded-3xl border border-zinc-800/50">
                        <span className="material-symbols-outlined text-6xl text-zinc-700 mb-6">folder_open</span>
                        <h2 className="text-xl font-bold text-zinc-300 mb-2">Your library is empty</h2>
                        <p className="text-zinc-500 mb-6">Upload materials in the Dashboard to get started.</p>
                        <button 
                            onClick={() => router.push('/en')}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-700/50">
                                    <th className="py-4 px-6 font-medium">Type</th>
                                    <th className="py-4 px-6 font-medium">File Name</th>
                                    <th className="py-4 px-6 font-medium">Subject</th>
                                    <th className="py-4 px-6 font-medium">Date Uploaded</th>
                                    <th className="py-4 px-6 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700/30">
                                {sortedSessions.map((session) => (
                                    <tr 
                                        key={session.id} 
                                        onClick={() => handleRowClick(session.id)}
                                        className="hover:bg-indigo-900/10 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-4 px-6 w-16">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-colors">
                                                <span className="material-symbols-outlined text-xl">
                                                    {session.fileType === 'pdf' ? 'picture_as_pdf' : session.fileType === 'word' ? 'description' : 'image'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                                {session.fileName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-zinc-400 line-clamp-1">
                                                {session.subject}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs text-zinc-500 whitespace-nowrap">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button 
                                                onClick={(e) => handleDelete(e, session.id, session.fileName)}
                                                className="w-8 h-8 rounded-full bg-transparent border border-transparent flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ml-auto"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
