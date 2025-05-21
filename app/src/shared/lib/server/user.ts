import bcrypt from "bcryptjs";
import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import { RegistReqData } from "@/src/entities/type/interfaces";

const registUser = async (formData: RegistReqData) => {
    try {
        const formDataStatus = formData instanceof FormData,
            name = formDataStatus
                ? getFormValue(formData, "name")
                : formData.name,
            email = formDataStatus
                ? getFormValue(formData, "email")
                : formData.email,
            pw = formDataStatus
                ? getFormValue(formData, "password")
                : formData.password,
            phoneNumber = formDataStatus
                ? getFormValue(formData, "phoneNumber")
                : formData.phoneNumber,
            address = formDataStatus
                ? getFormValue(formData, "address")
                : formData.address,
            detailAddress = formDataStatus
                ? getFormValue(formData, "detailAddress")
                : formData.detailAddress,
            image = formDataStatus ? "" : formData.image,
            provider = formDataStatus ? "local" : formData.provider;

        console.log(phoneNumber, address, detailAddress);

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
            detailAddress,
            reward: 0,
            mileage: 3000,
            coupon: 0,
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
    detailAddress?: string;
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

const getUser = async (email: string) => {
    try {
        await connectDB();
        return await User.findOne({ email }).lean();
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw new Error("Failed to check user existence");
    }
};

const getFormValue = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
};

export { registUser, fetchUser, updateUser, getUser };
