// models/Announce.ts
import mongoose, { Schema, Model } from "mongoose";
import { IAnnounce, IUserAnnounceView } from "../type/announce";

const AnnounceSchema = new Schema<IAnnounce>(
    {
        isPopup: {
            type: Boolean,
            required: true,
            default: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
            validate: {
                validator: function (this: IAnnounce, value: string) {
                    // 팝업인 경우 URL 형식 검증
                    if (this.isPopup) {
                        try {
                            new URL(value);
                            return true;
                        } catch {
                            return false;
                        }
                    }
                    // 띠배너인 경우 텍스트 길이 검증 (1자 이상)
                    return value.length >= 1;
                },
                message: function (this: IAnnounce) {
                    return this.isPopup
                        ? "팝업 타입은 올바른 이미지 URL이어야 합니다."
                        : "띠배너 텍스트는 1자 이상이어야 합니다.";
                },
            },
        },
        visible: {
            type: Boolean,
            required: true,
            default: true,
        },
        createAt: {
            type: Date,
            default: Date.now,
            immutable: true, // 생성 후 수정 불가
        },
        startAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        deletedAt: {
            type: Date,
            required: true,
            validate: {
                validator: function (this: IAnnounce, value: Date) {
                    // startAt보다 이후여야 함
                    return value > this.startAt;
                },
                message: "삭제 날짜는 시작 날짜보다 이후여야 합니다.",
            },
            index: { expireAfterSeconds: 0 }, // TTL 인덱스: deletedAt 시간에 자동 삭제
        },
    },
    {
        versionKey: false,
        collection: "announces",
    },
);

// 사용자 조회 기록 스키마
const UserAnnounceViewSchema = new Schema<IUserAnnounceView>(
    {
        userId: {
            type: String,
            sparse: true, // null 값 허용
        },
        announceId: {
            type: Schema.Types.ObjectId,
            ref: "Announce",
            required: true,
        },
        sessionId: {
            type: String,
            sparse: true, // null 값 허용
        },
        viewedAt: {
            type: Date,
            default: Date.now,
        },
        neverShowAgain: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "user_announce_views",
    },
);

// 인덱스 설정
AnnounceSchema.index({ visible: 1, startAt: 1, deletedAt: 1 }); // 활성 공지 조회용
AnnounceSchema.index({ isPopup: 1, visible: 1 }); // 타입별 필터용
AnnounceSchema.index({ createAt: -1 }); // 관리자 정렬용

// 사용자 조회 기록 유니크 인덱스 (중복 방지)
UserAnnounceViewSchema.index(
    {
        userId: 1,
        announceId: 1,
    },
    {
        unique: true,
        partialFilterExpression: { userId: { $ne: null } },
    },
);

UserAnnounceViewSchema.index(
    {
        sessionId: 1,
        announceId: 1,
    },
    {
        unique: true,
        partialFilterExpression: { sessionId: { $ne: null } },
    },
);

// Pre-save 미들웨어 - 추가 검증
AnnounceSchema.pre("save", function (this: IAnnounce, next) {
    const now = new Date();

    // 삭제일이 현재 시간보다 과거인지 확인
    if (this.deletedAt <= now) {
        return next(new Error("삭제일은 현재 시간보다 이후여야 합니다."));
    }

    next();
});

// 모델 생성
const AnnounceModel: Model<IAnnounce> =
    mongoose.models?.Announce ||
    mongoose.model<IAnnounce>("Announce", AnnounceSchema);

const UserAnnounceViewModel: Model<IUserAnnounceView> =
    mongoose.models?.UserAnnounceView ||
    mongoose.model<IUserAnnounceView>(
        "UserAnnounceView",
        UserAnnounceViewSchema,
    );

export { AnnounceModel, UserAnnounceViewModel };
