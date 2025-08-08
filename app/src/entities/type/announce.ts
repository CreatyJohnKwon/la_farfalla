// models/Announce.ts
import mongoose, { Document } from "mongoose";

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

// 사용자 조회 기록 인터페이스
interface IUserAnnounceView extends Document {
    _id: mongoose.Types.ObjectId;
    userId?: string; // 로그인 사용자 ID
    announceId: mongoose.Types.ObjectId; // 공지사항 ID
    sessionId?: string; // 비로그인 사용자 세션 ID
    viewedAt: Date; // 조회 시간
    neverShowAgain: boolean; // 다시 보지 않기 여부
}

export type { IAnnounce, IUserAnnounceView };
