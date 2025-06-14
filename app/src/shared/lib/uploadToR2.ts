import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "./r2Client";
import { v4 as uuidv4 } from "uuid";

const uploadImageToR2 = async (file: Buffer, originalFileName: string) => {
    const bucketName: string = process.env.R2_BUCKET_NAME || "";
    const fileBuffer: Buffer = file || Buffer.from("");
    const fileMimeType: string =
        originalFileName.split(".").pop() || "image/jpeg";

    const ext = originalFileName.split(".").pop();
    const uuid = uuidv4();
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now
        .getHours()
        .toString()
        .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

    const fileName = `${timestamp}_${uuid}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileMimeType,
    });

    await client.send(command);
    return fileName || ``;
};

const uploadImagesToServer = async (
    images: File | File[] | null,
): Promise<string[] | null> => {
    if (!images) return null;

    const formData = new FormData();

    // images가 배열인지 확인
    if (Array.isArray(images)) {
        images.forEach((image) => {
            formData.append("images", image);
        });
    } else {
        formData.append("images", images);
    }

    const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const { urls } = await response.json();

    return Array.isArray(urls) ? urls : [urls]; // 항상 배열로 반환
};

export { uploadImageToR2, uploadImagesToServer };
