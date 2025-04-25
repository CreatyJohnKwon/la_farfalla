import bcrypt from "bcryptjs";
import { connectDB } from "@/src/entities/db/mongoose";
import User from "@/src/entities/models/User";
import { getUserExist } from "@/src/shared/lib/get";
import { RegistReqData } from "@/src/entities/type/interfaces";

const registUser = async (formData: RegistReqData) => {
    try {
        let name: string, email: string, pw: string, image: string, phoneNumber: string, address: string, provider: string;
        
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

        if (await getUserExist(email))
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

export default registUser;
