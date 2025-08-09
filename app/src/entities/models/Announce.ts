import mongoose, { Schema, Model } from "mongoose";
import { IAnnounce } from "../type/announce";

const AnnounceSchema = new Schema<IAnnounce>(
    {
        isPopup: {
            type: Boolean,
            required: false,
            default: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        visible: {
            type: Boolean,
            required: true,
            default: true,
        },
        createAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
        startAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        deletedAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 },
        },
    },
    {
        versionKey: false,
        collection: "announces",
    },
);

// 인덱스 설정
AnnounceSchema.index({ visible: 1, startAt: 1, deletedAt: 1 });
AnnounceSchema.index({ isPopup: 1, visible: 1 });
AnnounceSchema.index({ createAt: -1 });

const AnnounceModel: Model<IAnnounce> =
    mongoose.models?.Announce ||
    mongoose.model<IAnnounce>("Announce", AnnounceSchema);

export { AnnounceModel };
