import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return; // 연결되었으면 그냥 얼리리턴

    try {
        // mongoose로 MongoDB에 연결
        await mongoose.connect(
            "mongodb+srv://admin:john1125@laf-cluster.julhaoc.mongodb.net/forum?retryWrites=true&w=majority&appName=laf-cluster",
        );

        // 연결이 성공적으로 이루어졌을 때 상태 업데이트
        isConnected = true;
        console.log("MongoDB connected with Mongoose");

        // 연결 상태를 출력하여 확인
        console.log(
            "Mongoose connection state:",
            mongoose.connection.readyState,
        );
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("MongoDB connection failed");
    }
};
