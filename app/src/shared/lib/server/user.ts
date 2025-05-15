import bcrypt from "bcryptjs";
import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import { RegistReqData } from "@/src/entities/type/interfaces";

const registUser = async (formData: RegistReqData) => {
    try {
        let name: string,
            email: string,
            pw: string,
            image: string,
            phoneNumber: string,
            address: string,
            provider: string;

        if (formData instanceof FormData) {
            name = formData.get("name") as string;
            email = formData.get("email") as string;
            pw = formData.get("password") as string;
            phoneNumber = formData.get("phoneNumber") as string;
            image = "" as string;
            address = formData.get("address") as string;
            provider = "local" as string;
        } else {
            name = formData.name as string;
            email = formData.email as string;
            pw = formData.password as string;
            phoneNumber = formData.phoneNumber as string;
            image = formData.image as string;
            address = formData.address as string;
            provider = formData.provider as string;
        }

        await connectDB();

        if (await getUser(email))
            return { success: false, error: "이미 등록된 이메일입니다" };

        const password = await bcrypt.hash(pw, 10);
        await User.create({
            name,
            email,
            password,
            provider,
            image,
            phoneNumber,
            address,
        });

        return { success: true, message: "회원가입이 완료되었습니다" };
    } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, error: "회원가입에 실패했습니다" };
    }
};

const fetchUser = async () => {
    try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("유저 정보를 불러오지 못했습니다");
        return res.json();
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "사용자 조회에 실패했습니다" };
    }
};

const updateUser = async (form: {
    name?: string;
    address?: string;
    password?: string;
    image?: string;
}) => {
    const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("업데이트 실패");
    return res.json();
};

export const getUser = async (email: string) => {
    try {
        await connectDB();
        return await User.findOne({ email }).lean();
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw new Error("Failed to check user existence");
    }
};

export { registUser, fetchUser, updateUser };
