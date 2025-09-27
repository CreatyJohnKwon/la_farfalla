interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface SMTPConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
}

interface SMSOrderData {
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemCount: number;
}

interface SMSResult {
    success: boolean;
    requestId?: string;
    statusCode?: string;
    statusName?: string;
}

interface MileageItem {
    _id?: string;
    userId: string;
    type: "earn" | "spend";
    amount: number;
    description: string;
    relatedOrderId?: string;
    createdAt: string;
}

interface OrderItem {
    productId: string;
    productNm: string;
    size: string;
    color: string;
    additional: string;
    quantity: number;
    price: number;
    image?: string[];
}

interface OrderData {
    _id?: string;
    userId: string;
    userNm: string;
    phoneNumber: string;
    address: string;
    detailAddress: string;
    deliveryMemo: string;
    postcode: string;
    items: OrderItem[];
    totalPrice: number;
    createdAt?: string;
    payMethod: "NAVER_PAY" | "KAKAO_PAY" | "CARD";
    paymentId?: string;
    shippingStatus: ShippingStatus;
    shippedAt?: string;
    confirmAt?: Date;
    trackingNumber?: string;
    description?: string;
    discountDetails?: {
        couponId?: string;
        mileage?: number;
    }
}

interface OrderPage {
    pages: any[];
    nextPage: number | null;
    currentPage: number;
}

interface OrderUpdateInput {
    orderId: string | undefined;
    shippingStatus: string;
    trackingNumber: string | undefined;
}

type StockUpdateItem = {
    productId: string;
    quantity: number;
    size: string;
    color: string;
    additional: string; // 추가 옵션의 이름
};

type ShippingStatus = "prepare" | "pending" | "ready" | "shipped" | "confirm" | "cancel" | "return" | "exchange";

export type {
    EmailResult,
    SMTPConfig,
    OrderData,
    OrderPage,
    OrderItem,
    MileageItem,
    ShippingStatus,
    OrderUpdateInput,
    StockUpdateItem,
    SMSOrderData,
    SMSResult,
}