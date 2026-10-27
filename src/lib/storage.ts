import "server-only";
import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireEnv } from "./env";

// Private bucket declared in neon.ts.
export const BUCKET = "commonplace";

let client: S3Client | undefined;

function s3() {
  // Credentials are passed explicitly rather than read through the default AWS
  // provider chain: on Vercel the runtime can expose its own AWS_SESSION_TOKEN,
  // which the chain would pair with the Neon key and break request signing.
  client ??= new S3Client({
    forcePathStyle: true, // required by Neon Object Storage
    endpoint: requireEnv("AWS_ENDPOINT_URL_S3"),
    region: requireEnv("AWS_REGION"),
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

function isNotFound(error: unknown) {
  const { name, $metadata } = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return name === "NoSuchKey" || $metadata?.httpStatusCode === 404;
}

/** Returns the object's bytes, or null when the key does not exist. */
export async function getObject(key: string): Promise<Uint8Array | null> {
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return (await res.Body?.transformToByteArray()) ?? null;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** Short-lived URL that downloads the object straight from storage. */
export function getDownloadUrl(key: string, filename: string) {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    }),
    { expiresIn: 300 },
  );
}

export async function pingBucket() {
  await s3().send(new HeadBucketCommand({ Bucket: BUCKET }));
}
