import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const b2 = new S3Client({
    region: env.B2_REGION,
    endpoint: `https://s3.${env.B2_REGION}.backblazeb2.com`,
    credentials: {
        accessKeyId: env.B2_KEY_ID,
        secretAccessKey: env.B2_APPLICATION_KEY,
    },
});

type UploadAudioOptions = {
    buffer: Buffer;
    key: string;
    contentType?: string;
};

export async function uploadAudio({
    buffer,
    key,
    contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
    await b2.send(
        new PutObjectCommand({
            Bucket: env.B2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }),
    );
};

export async function deleteAudio(key: string): Promise<void> {
    await b2.send(
        new DeleteObjectCommand({
            Bucket: env.B2_BUCKET_NAME,
            Key: key,
        }),
    );
};

export async function getSignedAudioUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: env.B2_BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(b2, command, { expiresIn: 3600 }); // 1 hour
};