import React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <SignIn
        appearance={{
            elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
            },
        }}
        />
    );
}