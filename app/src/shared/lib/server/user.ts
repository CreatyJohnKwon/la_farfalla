import bcrypt from "bcryptjs";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { RegistReqData } from "@src/entities/type/interfaces";
import { benefitWelcomeCoupon } from "@/src/features/benefit/coupon";

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
            postcode = formDataStatus
                ? getFormValue(formData, "postcode")
                : formData.postcode,
            image = formDataStatus ? "" : formData.image,
            provider = formDataStatus ? "local" : formData.provider;

        await connectDB();

        if (await getUser(email))
            return { success: false, error: "이미 등록된 이메일입니다" };

        const password = await bcrypt.hash(pw, 10);

        const newUser = await User.create({
            name,
            email,
            password,
            provider,
            image,
            phoneNumber,
            address,
            detailAddress,
            postcode,
            reward: 0,
        });

        // 신규 유저용 쿠폰 발급 프로세스 (프로세스 제거 / 임시 삭제 or 안쓸예정)
        // benefitWelcomeCoupon(newUser._id);

        return { success: true, message: `${newUser.name}님의 회원가입이 완료되었습니다` };
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
    email?: string;
    name?: string;
    address?: string;
    detailAddress?: string;
    postcode?: string;
    password?: string;
    image?: string;
}) => {
    const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("updateUser | 업데이트 실패: " + res.json);
    return res.json();
};

const deleteUser = async (userId: string) => {
    const res = await fetch(`/api/user/me?userId=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("user delete failure");
    return res.json();
};

const restoreUser = async (userId: string) => {
    const res = await fetch(`/api/admin/user?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("user delete failure");
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

const getUserList = async () => {
    const res = await fetch(`/api/admin/list/user`);
    if (!res.ok) throw new Error("단일 유저 정보 불러오기 실패");
    return await res.json();
};

const getUserbyId = async (userId: string) => {
    const res = await fetch(`/api/admin/user?userId=${userId}`);
    if (!res.ok) throw new Error("단일 유저 정보 불러오기 실패");
    return await res.json();
};

const getFormValue = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
};

const getMileage = async ({ pageParam = 1, userId }: { pageParam?: number, userId: string }) => {
    const limit = 5;
    const res = await fetch(`/api/user/mileage?userId=${userId}&page=${pageParam}&limit=${limit}`);
    if (!res.ok) throw new Error("마일리지 불러오기 실패");
    return await res.json();
};

const sendAuthMail = async (body: any) => {
    const res = await fetch("/api/user/auth-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export {
    registUser,
    fetchUser,
    restoreUser,
    updateUser,
    deleteUser,
    getUser,
    getMileage,
    getUserbyId,
    getUserList,
    sendAuthMail,
};
