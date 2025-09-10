import { NextRequest, NextResponse } from "next/server";
import { Coupon } from "@src/entities/models/Coupon";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import { connectDB } from "@src/entities/models/db/mongoose";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const allCoupons = await Coupon.find().sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            type: "allCoupons",
            data: allCoupons,
            count: allCoupons.length,
        });
    } catch (error) {
        console.error("전체 쿠폰 조회 오류:", error);
        return NextResponse.json(
            { error: "전체 쿠폰 조회 실패" },
            { status: 500 },
        );
    }
}

// POST - 쿠폰 생성
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const newCoupon = await Coupon.create(body);
        return NextResponse.json({
            message: "쿠폰이 생성되었습니다",
            data: newCoupon,
        });
    } catch (error) {
        console.error("쿠폰 생성 오류:", error);
        return NextResponse.json({ error: "쿠폰 생성 실패" }, { status: 500 });
    }
}

// PATCH - 쿠폰 수정 ? 현재는 토글 용도로만 사용됨
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json(
                { error: "쿠폰 ID가 필요합니다" },
                { status: 400 },
            );
        }

        await connectDB();

        const updatedCoupon = await Coupon.findByIdAndUpdate(_id, updateData, {
            new: true,
        });

        if (!updatedCoupon) {
            return NextResponse.json(
                { error: "쿠폰을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "쿠폰이 수정되었습니다",
            data: updatedCoupon,
        });
    } catch (error) {
        console.error("쿠폰 수정 오류:", error);
        return NextResponse.json({ error: "쿠폰 수정 실패" }, { status: 500 });
    }
}

// DELETE - 쿠폰 삭제
export async function DELETE(req: NextRequest) {
    try {
        const { _id } = await req.json();

        if (!_id) {
            return NextResponse.json(
                { error: "쿠폰 ID가 필요합니다" },
                { status: 400 },
            );
        }

        await connectDB();

        const deleted = await Coupon.findByIdAndDelete(_id);

        if (!deleted) {
            return NextResponse.json(
                { error: "쿠폰을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        const deletedUserCoupons = await UserCoupon.deleteMany({
            couponId: _id,
        });

        if (!deletedUserCoupons) {
            return NextResponse.json(
                { error: "유저 쿠폰 삭제 중 오류가 발견되었습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({ message: "쿠폰이 삭제되었습니다" });
    } catch (error) {
        console.error("쿠폰 삭제 오류:", error);
        return NextResponse.json({ error: "쿠폰 삭제 실패" }, { status: 500 });
    }
}
