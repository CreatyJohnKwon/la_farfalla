import { PutObjectCommand } from '@aws-sdk/client-s3';
import { client } from './r2Client';
import { v4 as uuidv4 } from 'uuid';

const uploadImageToR2 = async (file: Buffer, originalFileName: string) => {
    const bucketName: string = process.env.R2_BUCKET_NAME || '';
    const fileBuffer: Buffer = file || Buffer.from('');
    const fileMimeType: string = originalFileName.split('.').pop() || 'image/jpeg';

    const ext = originalFileName.split('.').pop();
    const uuid = uuidv4();
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours()
        .toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds()
        .toString().padStart(2, '0')}`;
    
    const fileName = `${timestamp}_${uuid}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileMimeType,
    });

    await client.send(command);
    return `${process.env.R2_FILE_DOMAIN}/${fileName}` || ``;
}

export default uploadImageToR2;