import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "auto", // 중요!
    endpoint:
        `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` || "",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    // SSL/TLS 설정 추가
    forcePathStyle: true,
    requestHandler: {
        // Node.js 환경에서 SSL 설정
        httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: true,
            secureProtocol: "TLSv1_2_method", // TLS 1.2 강제 사용
            ciphers: "HIGH:!aNULL:!MD5",
        }),
        requestTimeout: 60000, // 60초 타임아웃
        connectionTimeout: 10000, // 10초 연결 타임아웃
    },
});

const config = {
    api: {
        bodyParser: {
            sizeLimit: "50mb",
        },
    },
};
export { client, config };
