import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {

    const { userId, orgId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    if (!orgId) {
        redirect("/org-selection");
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
            <h1 className="text-2xl font-semibold">Welcome To Resonance</h1>
            <div className="flex items-center gap-4">
                <OrganizationSwitcher />
                <UserButton />
            </div>
        </div>
    )
}