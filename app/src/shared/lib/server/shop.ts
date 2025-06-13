import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@/src/entities/models/Product";
import Season from "@/src/entities/models/Season";

const getProduct = async (id: string) => {
    try {
        await connectDB();
        return await Product.findById(id).lean();
    } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product");
    }
};

const getShopProducts = async () => {
    try {
        await connectDB();
        return await Product.find({}).lean();
    } catch (error) {
        console.error("Error fetching shop products:", error);
        throw new Error("Failed to fetch shop products");
    }
};

const getSeason = async () => {
    try {
        await connectDB();
        const products = await Season.find({}).lean();
        return products;
    } catch (error) {
        console.error("Error fetching home products:", error);
        throw new Error("Failed to fetch home products");
    }
};

export { getSeason, getProduct, getShopProducts };
