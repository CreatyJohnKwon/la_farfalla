import { EmailService } from "@/src/shared/lib/emailService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const orderData = await request.json();

        // 필수 데이터 검증
        if (!orderData.userId || !orderData.userNm) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "필수 주문 정보가 누락되었습니다. (userId, userNm 필요)",
                },
                { status: 400 },
            );
        }

        // items 배열 검증 및 변환
        if (
            !orderData.items ||
            !Array.isArray(orderData.items) ||
            orderData.items.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "주문 상품 정보가 없습니다.",
                },
                { status: 400 },
            );
        }

        // 실제 데이터 구조에 맞춰 안전하게 변환
        const safeOrderData = {
            _id: orderData._id || `temp_${Date.now()}`,
            userId: orderData.userId,
            userNm: orderData.userNm,
            phoneNumber: orderData.phoneNumber || "",
            address: orderData.address || "",
            detailAddress: orderData.detailAddress || "",
            deliveryMemo: orderData.deliveryMemo || "",
            postcode: orderData.postcode || "",
            items: orderData.items.map((item: any) => ({
                id: item.productId || item.id,
                name: item.productNm || item.name || item.title || "상품명",
                quantity: item.quantity || 1,
                price: item.price || 0, // price가 없으면 0으로 설정
                description:
                    `${item.color || ""} ${item.size || ""}`.trim() ||
                    item.description,
                sku: item.sku || item.productId || "",
            })),
            totalPrice: orderData.totalPrice || 0,
            createdAt: orderData.createdAt || new Date().toISOString(),
            payMethod: orderData.payMethod || "CARD",
            paymentId: orderData.paymentId || "",
            shippingStatus: orderData.shippingStatus || "pending",
            shippedAt: orderData.shippedAt,
            trackingNumber: orderData.trackingNumber || "",
        };

        // 이메일 서비스 초기화
        const emailService = new EmailService();

        // 관리자에게 알림 메일 발송
        const result = await emailService.sendOrderNotification(safeOrderData);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "주문 알림이 성공적으로 발송되었습니다.",
                messageId: result.messageId,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "알림 발송에 실패했습니다.",
                    error: result.error,
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error("알림 발송 API 오류:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                success: false,
                message: "서버 오류가 발생했습니다.",
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}
