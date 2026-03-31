"use client";

import dynamic from "next/dynamic";
import { StudyProvider } from "@/store/StudyContext";

const FlashcardQuiz = dynamic(() => import("./FlashcardQuiz"), { ssr: false });

export default function QuizPage() {
    return (
        <StudyProvider>
            <FlashcardQuiz />
        </StudyProvider>
    );
}
