import { 
    PutObjectCommand, 
    CreateMultipartUploadCommand, 
    UploadPartCommand, 
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { client } from "./r2Client";
import { v4 as uuidv4 } from "uuid";
import { 
    MULTIPART_THRESHOLD_BYTES, 
    PART_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
    MAX_WIDTH_PIXEL,
    COMPRESSION_QUALITY
} from "@/src/utils/dataUtils";
import imageCompression from 'browser-image-compression';

/**
 * 파일 압축하는 함수
 * 문제재기: 어드민 클라이언트의 사진 용량이 너무 큼
 * 솔루션: 파일 압축하는 함수 구축
 */
const compressAndConvertImage = async (file: File): Promise<File | null> => {
    if (!file.type.startsWith('image')) {
        return file; // 이미지가 아니면 그대로 반환
    }
    
    // 압축 옵션 설정: 용량 및 해상도 제한, JPEG 포맷 강제
    const options = {
        maxSizeMB: MAX_FILE_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_PIXEL,
        useWebWorker: true, // 워커 스레드를 사용하여 UI 블로킹 방지
        fileType: 'image/jpeg', // 모든 이미지를 JPEG로 변환
        initialQuality: COMPRESSION_QUALITY,
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        
        // Blob을 File 객체로 변환하여 반환
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
        return new File([compressedBlob], newName, { type: 'image/jpeg' });
        
    } catch (error) {
        console.error("Image compression failed:", error);
        // 압축 실패 시, 원본 파일이 너무 크면 여전히 413 에러가 발생할 수 있습니다.
        return null; 
    }
};

const uploadImageToR2 = async (file: Buffer, originalFileName: string): Promise<string> => {
    const bucketName: string = process.env.R2_BUCKET_NAME || "";
    const fileBuffer: Buffer = file;
    const fileSize = fileBuffer.length;

    // 파일 이름 및 메타데이터 설정 (기존 로직 유지)
    const ext = originalFileName.split(".").pop();
    const uuid = uuidv4();
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
    const fileName = `${timestamp}_${uuid}.${ext}`;
    const fileMimeType = `image/${ext}` || "image/jpeg"; // 정확한 MIME 타입 사용
    
    // --- 파일 크기에 따른 업로드 전략 분기 ---

    if (fileSize <= MULTIPART_THRESHOLD_BYTES) {
        // A. 단일 요청 업로드 (20MB 이하)
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: fileMimeType,
        });

        await client.send(command);
    } else {
        // B. Multi-Part Upload (20MB 초과 및 413 에러 방지)
        let uploadId: string | undefined;

        try {
            // 1. Multi-Part Upload 생성 (UploadId 획득)
            const createUpload = new CreateMultipartUploadCommand({
                Bucket: bucketName,
                Key: fileName,
                ContentType: fileMimeType,
            });
            const response = await client.send(createUpload);
            uploadId = response.UploadId;

            if (!uploadId) {
                throw new Error("Failed to get UploadId for Multi-Part Upload.");
            }

            const parts = [];
            let partNumber = 1;
            let currentPosition = 0;

            // 2. 파일 청크 단위로 분할 및 업로드
            while (currentPosition < fileSize) {
                const endPosition = Math.min(currentPosition + PART_SIZE_BYTES, fileSize);
                const chunk = fileBuffer.slice(currentPosition, endPosition);

                const uploadPart = new UploadPartCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    UploadId: uploadId,
                    PartNumber: partNumber,
                    Body: chunk,
                });

                const partResponse = await client.send(uploadPart);
                
                // 파트 정보 저장 (CompleteMultipartUploadCommand에 필요)
                parts.push({
                    PartNumber: partNumber,
                    ETag: partResponse.ETag,
                });

                currentPosition = endPosition;
                partNumber++;
            }

            // 3. Multi-Part Upload 완료 요청
            const completeUpload = new CompleteMultipartUploadCommand({
                Bucket: bucketName,
                Key: fileName,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
                },
            });

            await client.send(completeUpload);

        } catch (error) {
            console.error("Multi-Part Upload Failed:", error);
            // 업로드 실패 시 잔여 파트를 정리 (Abort)
            if (uploadId) {
                const abortCommand = new AbortMultipartUploadCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    UploadId: uploadId,
                });
                await client.send(abortCommand);
            }
            throw new Error("R2 Multi-Part upload failed due to network or server error.");
        }
    }

    // 최종 이미지 URL 반환
    return (
        `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${fileName}` || ``
    );
};

const uploadImagesToServer = async (
    images: File[] | null,
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

export { uploadImageToR2, uploadImagesToServer, compressAndConvertImage };
