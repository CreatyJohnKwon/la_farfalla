import { S3Client } from '@aws-sdk/client-s3';

export const client = new S3Client({
    region: 'auto', // 중요!
    endpoint: `https://${process.env.R2_ACOUNT_ID}.r2.cloudflarestorage.com` || '',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});