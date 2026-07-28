import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Text To Speech" };

export default function TextToSpeechPage() {
    return <TextToSpeechView />;
}