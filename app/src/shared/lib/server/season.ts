import { baseUrl } from "public/data/common";

const getSeason = async () => {
    try {
        const res = await fetch(`/api/season`);
        if (!res.ok) throw new Error("시즌 리스트 불러오기 실패");
        return await res.json();
    } catch (error) {
        console.error("Error fetching seasons:", error);
        throw new Error("Failed to fetch seasons");
    }
};

const postSeason = async (data: { title: string; year: string }) => {
    try {
        const res = await fetch(`/api/season`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "시즌 생성 실패");
        }

        return await res.json();
    } catch (error) {
        console.error("Error creating season:", error);
        throw error;
    }
};

const fetchSeason = async () => {
    if (!baseUrl) {
        throw new Error("baseUrl 이 설정되지 않았습니다. baseUrl: " + baseUrl);
    }

    const response = await fetch(`${baseUrl}/api/season`, {
        method: 'GET',
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch season data.');
    }

    return response.json();
}

const putSeason = async (data: {
    _id: string;
    title: string;
    year: string;
}) => {
    try {
        const res = await fetch(`/api/season`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "시즌 수정 실패");
        }

        return await res.json();
    } catch (error) {
        console.error("Error updating season:", error);
        throw error;
    }
};

const deleteSeason = async (id: string) => {
    try {
        const res = await fetch(`/api/season?id=${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "시즌 삭제 실패");
        }

        return await res.json();
    } catch (error) {
        console.error("Error deleting season:", error);
        throw error;
    }
};

export { getSeason, postSeason, putSeason, fetchSeason, deleteSeason };
