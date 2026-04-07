"use client";

import dynamic from "next/dynamic";
import { StudyProvider } from "@/store/StudyContext";

const QuizView = dynamic(() => import("@/components/quiz/QuizView"), {
    ssr: false,
});

export default function QuizMasterPage() {
    return (
        <StudyProvider>
            <QuizView />
        </StudyProvider>
    );
}
