import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return; // 연결되었으면 그냥 얼리리턴

    try {
        // mongoose로 MongoDB에 연결
        await mongoose.connect(process.env.MONGODB_URI!,{
            bufferCommands: false
        });

        // 연결이 성공적으로 이루어졌을 때 상태 업데이트
        isConnected = true;
    } catch (error: any) {
        console.error("MongoDB 연결 실패");
        console.error("에러 메시지:", error.message);
        console.error("에러 코드:", error.code);
        console.error("에러 스택:", error.stack);
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};
