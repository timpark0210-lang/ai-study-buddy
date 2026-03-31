"use client";

import dynamic from "next/dynamic";
import { StudyProvider } from "@/store/StudyContext";

const LibraryContent = dynamic(() => import("./LibraryContent"), { ssr: false });

export default function LibraryPage() {
    return (
        <StudyProvider>
            <LibraryContent />
        </StudyProvider>
    );
}
