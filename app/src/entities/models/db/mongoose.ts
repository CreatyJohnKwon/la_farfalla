import mongoose from "mongoose";

let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise; // 여기서 연결 완료까지 기다려줌
        return cached.conn;
    } catch (error: any) {
        console.error("MongoDB 연결 실패");
        console.error("에러 메시지:", error.message);
        console.error("에러 코드:", error.code);
        console.error("에러 스택:", error.stack);
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
};
