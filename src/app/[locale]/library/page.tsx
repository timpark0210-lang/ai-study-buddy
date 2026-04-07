"use client";

import dynamic from "next/dynamic";
import { StudyProvider } from "@/store/StudyContext";

const StudyView = dynamic(() => import("@/components/study/StudyView"), {
    ssr: false,
});

export default function LibraryPage() {
    return (
        <StudyProvider>
            <StudyView />
        </StudyProvider>
    );
}
