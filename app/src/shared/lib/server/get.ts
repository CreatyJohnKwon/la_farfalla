import { connectDB } from "@/src/entities/models/db/mongoose";
import Post from "@/src/entities/models/Post";
import Shop from "@/src/entities/models/Shop";

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
