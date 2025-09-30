import { OrderData } from "../components/order/interface";
import { UserProfileData } from "../entities/type/common";

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

const searchOrders = (orders: OrderData[], query: string) => {
    if (!query.trim()) return orders;

    const searchTerm = query.toLowerCase().trim();

    return orders.filter((order) => {
        // 주문번호 검색
        const orderIdMatch = order._id?.toLowerCase().includes(searchTerm);

        // 주문자명 검색
        const userNameMatch = order.userNm?.toLowerCase().includes(searchTerm);

        // 연락처 검색 (하이픈 제거)
        const phoneMatch = order.phoneNumber
            ?.replace(/-/g, "")
            .includes(searchTerm.replace(/-/g, ""));
        
        // 주소 검색
        const addressMatch = 
            order.address?.toLowerCase().includes(searchTerm) ||
            order.detailAddress?.toLowerCase().includes(searchTerm);

        // 우편번호 검색
        const postcodeMatch = order.postcode?.includes(searchTerm);

        // 운송장 번호 검색
        const trackingNumberMatch = order.trackingNumber?.toLowerCase().includes(searchTerm);
        
        return (
            orderIdMatch ||
            userNameMatch ||
            phoneMatch ||
            addressMatch ||
            postcodeMatch ||
            trackingNumberMatch
        );
    });
};

export {
    searchUsers,
    searchOrders
}