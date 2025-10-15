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
const serviceMenuItems = [
    { label: "INTRODUCE", path: "/introduce" },
    { label: "PROJECT", path: "/project" },
    // { label: "NOTICE", path: "/notice" },
];

// Admin 드롭다운 메뉴 아이템
const adminMenuItems = [
    { label: "ORDER", path: "/admin/list/orders" },
    { label: "PRODUCT", path: "/admin/list/products" },
    { label: "USER", path: "/admin/list/users" },
    { label: "COUPON", path: "/admin/list/coupons" },
    { label: "PROJECT", path: "/admin/list/projects" },
];

// 상품 상세페이지 탭
const productTabs = [
    { id: "description", label: "상세정보" },
    { id: "reviews", label: "구매평" },
];

const textareaPlaceholder = `리뷰 작성시 적립금 안내
텍스트후기 : 마일리지 500원 지급
포토후기 : 기본 마일리지 1,000원 지급
(3장 이상의 사진 첨부 시 1,500원 지급)

*다음과 같은 경우 마일리지 지급이 어렵습니다.
(중복된 사진 및 내용이 포함된 경우, 부적절한 내용이 담긴 경우, 브랜드와 무관한 경우)
`

// 자동 로그인 세션관리
const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30일 (초 단위)
const ONE_DAY = 24 * 60 * 60; // 1일 (초 단위)

// 줄바꿈 식별자 / DescriptionItem 으로 사용
const BREAK_IDENTIFIER = "---BREAK---";

// 이미지 업로드 크기 관리
const PART_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (AWS S3/R2 MPU 최소 파트 크기)
const MULTIPART_THRESHOLD_BYTES = 20 * 1024 * 1024; // 20MB 초과 시 MPU 사용 (50MB 제한보다 안전하게 낮춤)

const MAX_FILE_SIZE_MB = 1;      // 파일당 최대 1MB로 제한
const MAX_WIDTH_PIXEL = 1920;   // 최대 너비 1920px
const COMPRESSION_QUALITY = 0.8; // 압축 품질 (0.0 to 1.0)

export {
    getCurrentDateTime,
    getDateTimeAfterHours,
    isImageUrl,
    serviceMenuItems,
    adminMenuItems,
    textareaPlaceholder,
    productTabs,
    THIRTY_DAYS,
    ONE_DAY,
    BREAK_IDENTIFIER,

    PART_SIZE_BYTES,
    MULTIPART_THRESHOLD_BYTES,
    MAX_FILE_SIZE_MB,
    MAX_WIDTH_PIXEL,
    COMPRESSION_QUALITY
}