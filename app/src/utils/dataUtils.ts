import { sidebarAtom } from '../shared/lib/atom';
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
    { label: "INTRODUCE", path: "/introduce" },
    { label: "PROJECT", path: "/project" },
    // { label: "NOTICE", path: "/notice" },
];

const sideBarMenuData = [
    { label: "INTRODUCE", link: "/introduce" },
    { label: "PROJECT", link: "/project" },
    // { label: "NOTICE", link: "/notice" }, // 추후에 추가
]

// Admin 드롭다운 메뉴 아이템
const adminMenuItems = [
    { label: "ORDER", path: "/admin/list/orders" },
    { label: "PRODUCT", path: "/admin/list/products" },
    { label: "USER", path: "/admin/list/users" },
    { label: "COUPON", path: "/admin/list/coupons" },
];

const textareaPlaceholder = `리뷰 작성시 적립금 안내
텍스트후기 : 마일리지 500원 지급
포토후기 : 기본 마일리지 1,000원 지급
(3장 이상의 사진 첨부 시 1,500원 지급)

*다음과 같은 경우 마일리지 지급이 어렵습니다.
(중복된 사진 및 내용이 포함된 경우, 부적절한 내용이 담긴 경우, 브랜드와 무관한 경우)
`

export {
    getCurrentDateTime,
    getDateTimeAfterHours,
    isImageUrl,
    aboutMenuItems,
    adminMenuItems,
    textareaPlaceholder,
    sideBarMenuData
}