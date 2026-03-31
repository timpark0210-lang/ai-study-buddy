"use client";

import dynamic from "next/dynamic";
import { StudyProvider } from "@/store/StudyContext";

const TutorContent = dynamic(() => import("./TutorContent"), { ssr: false });

export default function TutorPage() {
    return (
        <StudyProvider>
            <TutorContent />
        </StudyProvider>
    );
}
