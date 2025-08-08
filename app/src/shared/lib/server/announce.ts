// lib/server/announce.ts 파일에 추가/수정할 함수들

import { IAnnounceDTO } from "@/src/entities/type/announce";

// 공지 생성을 위한 데이터 타입 정의
interface CreateAnnounceData {
    isPopup: boolean;
    description: string;
    startAt: Date;
    deletedAt: Date;
    visible?: boolean;
    imageFile?: File; // 실제 이미지 업로드 구현 시 사용
}

// 공지 목록 조회
export const fetchAnnounces = async (): Promise<IAnnounceDTO[]> => {
    const response = await fetch("/api/admin/announces", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("공지 목록 조회에 실패했습니다");
    }

    return response.json();
};

// 공지 생성 - 타입 수정
export const createAnnounce = async (
    data: CreateAnnounceData,
): Promise<IAnnounceDTO> => {
    // File 객체는 서버로 직접 전송할 수 없으므로 제외하고 전송
    const { imageFile, ...submitData } = data;

    // 실제 구현에서는 이미지 파일을 먼저 업로드하고 URL을 받아와야 함
    // 예시:
    // if (imageFile) {
    //     const imageUrl = await uploadImage(imageFile);
    //     submitData.imageUrl = imageUrl;
    // }

    const response = await fetch("/api/admin/announces", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...submitData,
            visible: submitData.visible ?? true, // 기본값 설정
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "공지 생성에 실패했습니다");
    }

    return response.json();
};

// 공지 수정
export const updateAnnounceById = async (
    id: string,
    data: Partial<Omit<IAnnounceDTO, "_id">>,
): Promise<IAnnounceDTO> => {
    const response = await fetch(`/api/admin/announces?aid=${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "공지 수정에 실패했습니다");
    }

    return response.json();
};

// 공지 삭제
export const deleteAnnounce = async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/announces?aid=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "공지 삭제에 실패했습니다");
    }
};

// 이미지 업로드를 위한 별도 함수 (필요시 구현)
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("이미지 업로드에 실패했습니다");
    }

    const { imageUrl } = await response.json();
    return imageUrl;
};
