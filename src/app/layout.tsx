import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Resonance",
        template: "%s | Resonance"
    },
    description: "AI-Powered Text-To-Speech And Voice Cloning Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <TRPCReactProvider>
                <html lang="en">
                    <body
                    className={`${inter.variable} ${geistMono.variable} antialiased`}
                    >
                        <NuqsAdapter>
                            <TooltipProvider>
                                {children}
                            </TooltipProvider>
                        </NuqsAdapter>
                        <Toaster/>
                    </body>
                </html>
            </TRPCReactProvider>
        </ClerkProvider>
    );
}