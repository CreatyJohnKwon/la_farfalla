import { IDescriptionItem, ProductVariant, AdditionalOption } from "@src/entities/type/products";
import mongoose, { Schema } from "mongoose";

const productOptionSchema = new mongoose.Schema(
    {
        colorName: { type: String, required: true },
        stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    },
    { _id: false },
);

const additionalOptionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        additionalPrice: { type: Number, required: true },
        stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    },
    { _id: false },
);

const descriptionItemSchema = new Schema<IDescriptionItem>(
    {
        itemType: {
            type: String,
            required: true,
            enum: ['image', 'break']
        },
        src: {
            type: String,
            // ✨ 3. 'this'의 타입을 명시적으로 지정하여 오류 해결
            required: function(this: IDescriptionItem) {
                return this.itemType === 'image';
            }
        },
    },
    { _id: false }
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
                    items: {
                        type: [descriptionItemSchema],
                        required: true,
                        default: []
                    },
                    text: { type: String, required: true, default: "" },
                    detail: { type: String, required: true, default: "" },
                },
                { _id: false },
            ),
            required: true,
        },
        averageRating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        price: { type: String, required: true, default: "0" },
        discount: { type: String, default: "0" },
        quantity: { type: String, required: true, default: "0" },
        image: { type: [String], required: true },
        categories: { type: [String], required: true, default: [] },
        size: { type: [String], required: true, default: [] },
        options: { type: [productOptionSchema], default: [] },
        additionalOptions: { type: [additionalOptionSchema], default: [] },
        colors: { type: [String], default: [] }
    },
    {
        timestamps: true,
        collection: "products",
    },
);

// 헬퍼 함수: 총수량 및 색상 목록을 계산하여 문서(또는 업데이트 객체)에 설정
function updateTotalQuantity(doc: any) {
    const options = doc.options || [];
    const additionalOptions = doc.additionalOptions || [];

    const optionsTotal = options.reduce(
        (sum: number, option: ProductVariant) => sum + (Number(option.stockQuantity) || 0),
        0
    );

    const additionalOptionsTotal = additionalOptions.reduce(
        (sum: number, option: AdditionalOption) => sum + (Number(option.stockQuantity) || 0),
        0
    );

    doc.quantity = (optionsTotal + additionalOptionsTotal).toString();

    if (options.length > 0) {
        doc.colors = [...new Set(options.map((option: ProductVariant) => option.colorName))];
    }
}

// 훅 1: 새 문서 생성 시 실행
productSchema.pre("save", function (next) {
    updateTotalQuantity(this);
    next();
});

// 훅 2: 문서 업데이트 시 실행
productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const update = this.getUpdate() as any;
    const updateData = update.$set || update;

    if (updateData.options || updateData.additionalOptions) {
        updateTotalQuantity(updateData);
    }
    
    next();
});

export default mongoose.models?.Product || mongoose.model("Product", productSchema);