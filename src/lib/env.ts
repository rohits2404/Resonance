import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        APP_URL: z.string().min(1),
        B2_REGION: z.string().min(1),
        B2_KEY_ID: z.string().min(1),
        B2_APPLICATION_KEY: z.string().min(1),
        B2_BUCKET_NAME: z.string().min(1),
        CHATTERBOX_API_URL: z.url(),
        CHATTERBOX_API_KEY: z.string().min(1),
    },
    experimental__runtimeEnv: {},
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});