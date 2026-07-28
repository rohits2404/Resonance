import React from "react";
import { OrganizationList } from "@clerk/nextjs";

export default function OrgSelectionPage() {
    return (
        <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/"
        afterSelectOrganizationUrl="/"
        appearance={{
            elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
            },
        }}
        />
    );
};