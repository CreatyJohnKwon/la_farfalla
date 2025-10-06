import { CreateAnnounceData, IAnnounceDTO } from "@src/entities/type/announce";
import { baseUrl } from "../../../../../public/data/common";

// 공지 목록 조회 : ISR 적용
const getAnnouncesISR = async (): Promise<IAnnounceDTO[]> => {
    // 환경 변수에서 기본 URL을 가져와서 절대 경로를 만듭니다.
    if (!baseUrl) {
        throw new Error("환경 변수가 설정되지 않았습니다. `.env` 를 확인해주세요.");
    }
    
    const response = await fetch(`${baseUrl}/api/admin/announces`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // 1분마다 캐시 초기화 (초단위)
    });

    if (!response.ok) {
        throw new Error("공지 목록 조회에 실패했습니다");
    }

    return response.json();
};

const getAnnouncesSSR = async (): Promise<IAnnounceDTO[]> => {
    const response = await fetch(`/api/admin/announces`, {
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
const createAnnounce = async (
    data: CreateAnnounceData,
): Promise<IAnnounceDTO> => {
    // File 객체는 서버로 직접 전송할 수 없으므로 제외하고 전송
    const { ...submitData } = data;

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
const updateAnnounceById = async (
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
const deleteAnnounce = async (id: string): Promise<void> => {
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
const uploadImage = async (file: File): Promise<string> => {
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

export {
    getAnnouncesISR,
    getAnnouncesSSR,
    createAnnounce,
    updateAnnounceById,
    deleteAnnounce,
    uploadImage
}