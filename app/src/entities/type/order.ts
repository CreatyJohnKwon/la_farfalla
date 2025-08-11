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

export type { AddressUpdateInput, AddressUpdateRequest };
