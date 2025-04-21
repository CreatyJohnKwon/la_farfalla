import { connectDB } from "@/src/entities/db/mongoose";
import { redirect } from "next/navigation";
import Post from "@/src/entities/models/Post";
import Shop from "@/src/entities/models/Shop";
import User from "@/src/entities/models/User";

export const getProducts = async (id: string) => {
    try {
        await connectDB();
        return await Post.findById(id).lean();
    } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product");
    }
};

export const getShopProducts = async () => {
    try {
        await connectDB();
        return await Post.find({}).lean();
    } catch (error) {
        console.error("Error fetching shop products:", error);
        throw new Error("Failed to fetch shop products");
    }
};

export const getHome = async () => {
    try {
        await connectDB();
        return await Shop.find({}).lean();
    } catch (error) {
        console.error("Error fetching home products:", error);
        throw new Error("Failed to fetch home products");
    }
};

export const getUserExist = async (email: string) => {
    try {
        await connectDB();
        return await User.findOne({ email }).lean();
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw new Error("Failed to check user existence");
    }
};

export const getLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email) {
        alert("이메일을 입력해주세요");
        return;
    }

    if (!password) {
        alert("비밀번호를 입력해주세요");
        return;
    }

    const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 400 이상 에러 처리
    if (!res.ok) {
        alert(data.error);
        return;
    }

    if (res.ok) {
        redirect("/home");
    }
};
