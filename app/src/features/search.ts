import { UserProfileData } from "../entities/type/interfaces";

// 검색 함수
const searchUsers = (users: UserProfileData[], query: string) => {
    if (!query.trim()) return users;

    const searchTerm = query.toLowerCase().trim();

    return users.filter((user) => {
        // 이메일 검색
        const emailMatch = user.email?.toLowerCase().includes(searchTerm);

        // 이름 검색
        const nameMatch = user.name?.toLowerCase().includes(searchTerm);

        // 전화번호 검색 (하이픈 제거해서 검색)
        const phoneMatch = user.phoneNumber
            ?.replace(/-/g, "")
            .includes(searchTerm.replace(/-/g, ""));

        // 주소 검색
        const addressMatch =
            user.address?.toLowerCase().includes(searchTerm) ||
            user.detailAddress?.toLowerCase().includes(searchTerm);

        // 우편번호 검색
        const postcodeMatch = user.postcode?.includes(searchTerm);

        return (
            emailMatch ||
            nameMatch ||
            phoneMatch ||
            addressMatch ||
            postcodeMatch
        );
    });
};

export {
    searchUsers
}