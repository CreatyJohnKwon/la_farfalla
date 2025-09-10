import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@src/entities/models/db/mongoose";
import { AddressUpdateRequest } from "@src/entities/type/order";
import { Order } from "@src/entities/models/Order";

// 배송지 변경 PATCH API
export async function PATCH(request: NextRequest) {
    try {
        // 데이터베이스 연결
        await connectDB();

        // URL 파라미터에서 orderId 추출 (Next.js 모든 버전 호환)
        const url = new URL(request.url);
        const orderId = url.pathname.split("/")[3];

        // orderId 검증
        if (!orderId || typeof orderId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid order ID",
                    error: "Order ID is required and must be a string",
                },
                { status: 400 },
            );
        }

        // ObjectId 형식 검증
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid order ID format",
                    error: "Order ID must be a valid ObjectId",
                },
                { status: 400 },
            );
        }

        // 요청 바디 파싱
        let body: AddressUpdateRequest;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON format",
                    error: "Request body must be valid JSON",
                },
                { status: 400 },
            );
        }

        const { newAddress, reason } = body;

        // 요청 바디 검증
        if (!newAddress) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields",
                    error: "newAddress is required",
                },
                { status: 400 },
            );
        }

        // 주소 필드 검증
        const { postcode, address, detailAddress, deliveryMemo } = newAddress;

        if (!postcode?.trim() || !address?.trim() || !detailAddress?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid address data",
                    error: "postcode, address, and detailAddress are required",
                },
                { status: 400 },
            );
        }

        // 우편번호 형식 검증 (5자리 숫자)
        if (!/^\d{5}$/.test(postcode.trim())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid postcode format",
                    error: "Postcode must be 5 digits",
                },
                { status: 400 },
            );
        }

        // 기존 주문 조회 (삭제되지 않은 주문만)
        const existingOrder = await Order.findOne({
            _id: orderId,
            deletedAt: null, // soft delete 체크
        });

        if (!existingOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order not found",
                    error: `Order with ID ${orderId} does not exist or has been deleted`,
                },
                { status: 404 },
            );
        }

        // 배송지 변경 가능 여부 확인
        const allowedStatuses = ["pending", "ready"];
        if (!allowedStatuses.includes(existingOrder.shippingStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Address change not allowed",
                    error: `Cannot change address for orders with status: ${existingOrder.shippingStatus}`,
                },
                { status: 400 },
            );
        }

        // 변경사항 확인
        const hasChanges =
            existingOrder.postcode !== postcode.trim() ||
            existingOrder.address !== address.trim() ||
            existingOrder.detailAddress !== detailAddress.trim() ||
            (existingOrder.deliveryMemo || "") !== (deliveryMemo?.trim() || "");

        if (!hasChanges) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No changes detected",
                    error: "The new address is the same as the current address",
                },
                { status: 400 },
            );
        }

        // 기존 주소 백업 (로깅용)
        const previousAddress = {
            postcode: existingOrder.postcode,
            address: existingOrder.address,
            detailAddress: existingOrder.detailAddress,
            deliveryMemo: existingOrder.deliveryMemo || "",
        };

        // 주문 업데이트 실행
        const updateData = {
            postcode: postcode.trim(),
            address: address.trim(),
            detailAddress: detailAddress.trim(),
            deliveryMemo: deliveryMemo?.trim() || "",
            updatedAt: new Date(),
        };

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            {
                new: true, // 업데이트된 문서 반환
                runValidators: true, // 스키마 검증 실행
            },
        );

        if (!updatedOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Update failed",
                    error: "Failed to update order address",
                },
                { status: 500 },
            );
        }

        // 성공 응답
        return NextResponse.json(
            {
                success: true,
                message: "Address updated successfully",
                data: {
                    orderId: updatedOrder._id,
                    userId: updatedOrder.userId,
                    previousAddress,
                    newAddress: {
                        postcode: updatedOrder.postcode,
                        address: updatedOrder.address,
                        detailAddress: updatedOrder.detailAddress,
                        deliveryMemo: updatedOrder.deliveryMemo,
                    },
                    updatedAt: updatedOrder.updatedAt,
                },
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("Address update error:", error);

        // MongoDB 특정 에러 처리
        if (error.name === "ValidationError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    error: error.message,
                },
                { status: 400 },
            );
        }

        if (error.name === "CastError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid data format",
                    error: "Invalid order ID format",
                },
                { status: 400 },
            );
        }

        // 일반적인 서버 에러
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Something went wrong",
            },
            { status: 500 },
        );
    }
}

// // OPTIONS 메서드 (CORS 처리용)
// export async function OPTIONS() {
//     return NextResponse.json(
//         {},
//         {
//             status: 200,
//             headers: {
//                 Allow: "PATCH, OPTIONS",
//                 "Access-Control-Allow-Methods": "PATCH, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//         },
//     );
// }
