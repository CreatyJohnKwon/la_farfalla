// models/Announce.ts
import mongoose, { Document } from "mongoose";
import { ChangeEvent, RefObject } from "react";

// 공지사항 인터페이스
interface IAnnounce extends Document {
    _id: mongoose.Types.ObjectId; // MongoDB에서 기본 생성되는 private key
    isPopup: boolean; // 팝업형식인지 띠형식인지
    description: string; // isPopup에 따라 true면 image URL, false면 text 데이터
    visible: boolean; // true면 보여지고 false면 안보여짐 (토글 기능)
    createAt: Date; // 공지 생성 날짜
    startAt: Date; // 공지가 보여질 날짜
    deletedAt: Date; // 공지가 자동 삭제될 날짜 (MongoDB TTL 사용)
}

interface IAnnounceDTO {
    _id: mongoose.Types.ObjectId; // MongoDB에서 기본 생성되는 private key
    isPopup: boolean; // 팝업형식인지 띠형식인지
    description: string; // isPopup에 따라 true면 image URL, false면 text 데이터
    visible: boolean; // true면 보여지고 false면 안보여짐 (토글 기능)
    createAt: Date; // 공지 생성 날짜
    startAt: Date; // 공지가 보여질 날짜
    deletedAt: Date; // 공지가 자동 삭제될 날짜 (MongoDB TTL 사용)
}

interface UpdateAnnounceParams {
    id: string;
    data: Partial<IAnnounceDTO>;
}

interface CreateAnnounceData {
    isPopup: boolean;
    description: string;
    startAt: Date;
    deletedAt: Date;
    visible?: boolean;
}

interface AnnounceForm {
    isPopup: boolean;
    description: string;
    startAt: string;
    deletedAt: string;
    imageFile?: File;
}

// 안전한 타입 정의
interface AnnounceForm {
    isPopup: boolean;
    description: string;
    startAt: string;
    deletedAt: string;
    imageFile?: File;
}

interface FormContentProps {
    isEditMode: boolean;
    editingAnnounce: IAnnounceDTO | null;
    form: AnnounceForm;
    errors: Partial<Record<keyof AnnounceForm, string>>;
    imagePreviewUrl: string;
    fileInputRef: RefObject<HTMLInputElement | null>;
    ACCEPTED_IMAGE_TYPES: readonly string[];
    MAX_DESCRIPTION_LENGTH: number;
    handleInputChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    handleStyleChange: (isPopup: boolean) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageRemove: () => void;
    cancelEditMode: () => void;
}

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DESCRIPTION_LENGTH = 50;

export type {
    IAnnounce,
    IAnnounceDTO,
    UpdateAnnounceParams,
    CreateAnnounceData,
    AnnounceForm,
    FormContentProps,
};

export { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, MAX_DESCRIPTION_LENGTH };
