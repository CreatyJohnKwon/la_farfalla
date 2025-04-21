"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/src/entities/db/mongoose";
import User from "@/src/entities/models/User";
import { getUserExist } from "@/src/shared/lib/get";

export async function registUser(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const pw = formData.get("password") as string;

        await connectDB();
        if (await getUserExist(email)) {
            return { success: false, error: "이미 등록된 이메일입니다" };
        }

        const hashed = await bcrypt.hash(pw, 10);
        await User.create({ name, email, password: hashed, provider: "local" });

        return { success: true, message: "회원가입이 완료되었습니다" };
    } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, error: "회원가입에 실패했습니다" };
    }
}
