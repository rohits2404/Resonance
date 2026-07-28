import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Text To Speech" };

export default async function TextToSpeechPage({
    searchParams,
}: {
    searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
  
    const { text, voiceId } = await searchParams;

    prefetch(trpc.voices.getAll.queryOptions());
    prefetch(trpc.generations.getAll.queryOptions());

    return (
        <HydrateClient>
            <TextToSpeechView initialValues={{ text, voiceId }} />
        </HydrateClient>
    );
};