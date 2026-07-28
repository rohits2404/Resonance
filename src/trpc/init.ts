import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async () => {
    return {};
});

const t = initTRPC.create({
    transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;

// Authenticated procedure - calls auth() only when needed
export const authProcedure = t.procedure.use(async ({ next }) => {
    const { userId } = await auth();

    if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: { userId },
    });
});

// Organization procedure - requires userId and orgId
export const orgProcedure = t.procedure.use(async ({ next }) => {
    const { userId, orgId } = await auth();

    if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (!orgId) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Organization Required",
        });
    }

    return next({ ctx: { userId, orgId } });
});