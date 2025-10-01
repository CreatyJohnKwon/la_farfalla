interface AddressUpdateInput {
    orderId: string;
    newAddress: {
        postcode: string;
        address: string;
        detailAddress: string;
        deliveryMemo: string;
    };
    reason?: string;
    orderInfo?: string;
}

interface AddressUpdateRequest {
    newAddress: {
        postcode: string;
        address: string;
        detailAddress: string;
        deliveryMemo: string;
    };
    reason?: string;
    orderInfo?: string;
}

interface PortOnePaymentData {
  status: 'PAID' | 'CANCELLED' | 'VIRTUAL_ACCOUNT_ISSUED' | 'FAILED';
  id: string;
  transactionId: string;
  merchantId: string;
  storeId: string;
  method: PortOneMethod;
  channel: PortOneChannel;
  version: 'V2';
  requestedAt: string; // ISO 8601 형식의 날짜 문자열
  updatedAt: string;
  statusChangedAt: string;
  orderName: string;
  amount: PortOneAmount;
  currency: 'KRW';
  customer: PortOneCustomer;
  promotionId: string | null;
  isCulturalExpense: boolean;
  paidAt: string;
  pgTxId: string;
  receiptUrl: string;
  cancellations: PortOneCancellation[];
  cancelledAt: string | null;
}

// 결제 수단 상세 정보
interface PortOneMethod {
  type: string; // "PaymentMethodEasyPay", "PaymentMethodCard", etc.
  provider: string; // "NAVERPAY", "KAKAOPAY", etc.
  easyPayMethod?: {
    type: string;
    card?: PortOneCardInfo;
    approvalNumber: string;
    installment: PortOneInstallmentInfo;
    pointUsed: boolean;
  };
  card?: PortOneCardInfo; // 간편결제가 아닌 일반 카드 결제용
  // ... 가상계좌 등 다른 결제 수단 추가 가능
}

// 카드 정보
interface PortOneCardInfo {
  publisher: string;
  issuer: string;
  brand: string;
  type: 'CREDIT' | 'DEBIT';
  ownerType: 'PERSONAL' | 'CORPORATE';
  bin: string;
  name: string;
  number: string;
}

// 할부 정보
interface PortOneInstallmentInfo {
  month: number;
  isInterestFree: boolean;
}

// 채널 정보
interface PortOneChannel {
  type: 'LIVE' | 'TEST';
  id: string;
  key: string;
  name: string;
  pgProvider: string;
  pgMerchantId: string;
}

// 금액 정보
interface PortOneAmount {
  total: number;
  taxFree: number;
  vat: number;
  supply: number;
  discount: number;
  paid: number;
  cancelled: number;
  cancelledTaxFree: number;
}

// 고객 정보
interface PortOneCustomer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

// 결제 취소 정보
interface PortOneCancellation {
  status: 'SUCCEEDED' | 'FAILED';
  id: string;
  pgCancellationId: string;
  totalAmount: number;
  taxFreeAmount: number;
  vatAmount: number | null;
  reason: string;
  cancelledAt: string;
  requestedAt: string;
  receiptUrl: string;
  trigger: 'API' | 'MANUAL';
}

export type { 
    AddressUpdateInput, 
    AddressUpdateRequest, 
    PortOnePaymentData 
};
