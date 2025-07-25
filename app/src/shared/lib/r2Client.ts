import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "auto", // 중요!
    endpoint:
        `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` || "",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

const config = {
    api: {
        bodyParser: {
            sizeLimit: "25mb",
        },
    },
};
export { client, config };
