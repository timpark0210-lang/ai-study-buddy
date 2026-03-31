"use client";

import Navbar from "@/components/layout/Navbar";
import ChatContainer from "@/components/chat/ChatContainer";
import StudyView from "@/components/study/StudyView";
import QuizView from "@/components/quiz/QuizView";
import { useViewStore } from "@/store/useViewStore";

export default function Home() {
    const { currentView } = useViewStore();

    return (
        <div className="flex h-screen flex-col">
            <Navbar />
            <main className="flex-1 overflow-hidden">
                {currentView === "chat" && <ChatContainer />}
                {currentView === "study" && <StudyView />}
                {currentView === "quiz" && <QuizView />}
            </main>
        </div>
    );
}
