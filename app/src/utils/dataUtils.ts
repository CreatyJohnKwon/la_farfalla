// utils/dateUtils.ts
const getCurrentDateTime = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

// date 함수
const getDateTimeAfterHours = (hours: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const timezoneOffset = future.getTimezoneOffset() * 60000;
    const localTime = new Date(future.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

// 이미지 Url 확장자명 포멧
const isImageUrl = (description: string) => {
    return (
        description.startsWith("http") &&
        (description.includes(".jpg") ||
            description.includes(".jpeg") ||
            description.includes(".png") ||
            description.includes(".gif") ||
            description.includes("r2.dev"))
    );
};

// About 드롭다운 메뉴 아이템
const aboutMenuItems = [
    { label: "introduce", path: "/introduce" },
    { label: "project", path: "/project" },
];

// Admin 드롭다운 메뉴 아이템
const adminMenuItems = [
    { label: "Order", path: "/admin/list/orders" },
    { label: "Product", path: "/admin/list/products" },
    { label: "User", path: "/admin/list/users" },
    { label: "Coupon", path: "/admin/list/coupons" },
];

export {
    getCurrentDateTime,
    getDateTimeAfterHours,
    isImageUrl,
    aboutMenuItems,
    adminMenuItems
}