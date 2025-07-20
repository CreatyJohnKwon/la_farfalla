import mongoose from "mongoose";

const productOptionSchema = new mongoose.Schema(
    {
        colorName: {
            type: String,
            required: true,
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    { _id: false },
);

const productSchema = new mongoose.Schema(
    {
        title: {
            type: new mongoose.Schema(
                {
                    kr: { type: String, required: true },
                    eg: { type: String, default: "" },
                },
                { _id: false },
            ),
            required: true,
        },
        description: {
            type: new mongoose.Schema(
                {
                    images: { type: [String], required: true, default: [] },
                    text: { type: String, required: true, default: "" },
                    detail: { type: String, required: true, default: "" },
                },
                { _id: false },
            ),
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        discount: {
            type: String,
            default: "0",
        },
        quantity: {
            type: String,
            default: "0",
        },
        image: {
            type: [String],
            required: true,
        },
        colors: {
            type: [String],
            required: true,
        },
        seasonName: {
            type: String,
            required: false,
            default: "",
            validate: {
                validator: function (v: string) {
                    return typeof v === "string";
                },
                message: "seasonName은 문자열이어야 합니다.",
            },
        },
        size: {
            type: [String],
            required: true,
            default: [],
        },
        // 🆕 여기에 options 필드 추가
        options: {
            type: [productOptionSchema],
            required: false,
            default: [],
            validate: {
                validator: function (v: any[]) {
                    return !v || v.length === 0 || v.length > 0;
                },
                message: "옵션이 있다면 최소 1개 이상이어야 합니다.",
            },
        },
    },
    {
        timestamps: true,
        collection: "product",
    },
);

// 미들웨어
productSchema.pre("save", function (next) {
    if (
        this.options &&
        Array.isArray(this.options) &&
        this.options.length > 0
    ) {
        this.colors = [
            ...new Set(this.options.map((option: any) => option.colorName)),
        ];

        const totalQuantity = this.options.reduce(
            (sum: number, option: any) => {
                return sum + (Number(option.stockQuantity) || 0);
            },
            0,
        );
        this.quantity = totalQuantity.toString();

        console.log(
            `[Pre-save] 자동 계산 완료 - colors: ${this.colors}, quantity: ${this.quantity}`,
        );
    }
    next();
});

productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const update = this.getUpdate() as any;

    if (
        update &&
        update.options &&
        Array.isArray(update.options) &&
        update.options.length > 0
    ) {
        update.colors = [
            ...new Set(update.options.map((option: any) => option.colorName)),
        ];

        const totalQuantity = update.options.reduce(
            (sum: number, option: any) => {
                return sum + (Number(option.stockQuantity) || 0);
            },
            0,
        );
        update.quantity = totalQuantity.toString();

        console.log(
            `[Pre-update] 자동 계산 완료 - colors: ${update.colors}, quantity: ${update.quantity}`,
        );
    }
    next();
});

export default mongoose.models?.Product ||
    mongoose.model("Product", productSchema);
