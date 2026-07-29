"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceCreateForm } from "./voice-create-form";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCheckout } from "@/features/billing/hooks/use-checkout";

interface VoiceCreateDialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function VoiceCreateDialog({
    children,
    open,
    onOpenChange,
}: VoiceCreateDialogProps) {
  
    const isMobile = useIsMobile();

    const { checkout } = useCheckout();

    const handleError = useCallback((message: string) => {
        if (message === "SUBSCRIPTION_REQUIRED") {
            toast.error("Subscription required", {
                action: {
                    label: "Subscribe",
                    onClick: () => checkout(),
                },
            });
        } else {
            toast.error(message);
        }
    },[checkout]);

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Create Custom Voice</DrawerTitle>
                        <DrawerDescription>
                            Upload Or Record An Audio Sample To Add A New Voice To Your
                            Library.
                        </DrawerDescription>
                    </DrawerHeader>
                    <VoiceCreateForm
                    scrollable
                    footer={(submit) => (
                        <DrawerFooter>
                            {submit}
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    )}
                    />
                </DrawerContent>
            </Drawer>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent>
                <DialogHeader className="text-left">
                    <DialogTitle>Create Custom Voice</DialogTitle>
                    <DialogDescription>
                        Upload Or Record An Audio Sample To Add A New Voice To Your Library.
                    </DialogDescription>
                </DialogHeader>
                <VoiceCreateForm onError={handleError} />
            </DialogContent>
        </Dialog>
    );
};