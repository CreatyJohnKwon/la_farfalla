import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Coupon } from "@src/entities/models/Coupon";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import User from "@src/entities/models/User";

export async function POST(req: NextRequest) {
    try {
        const { couponId, emails } = await req.json();
        
        if (!couponId || !emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { message: "유효한 쿠폰 ID와 이메일 목록이 필요합니다." },
                { status: 400 }
            );
        }

        await connectDB();

        // 1. 원본 쿠폰 존재 및 유효성 확인
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return NextResponse.json(
                { message: "존재하지 않는 쿠폰입니다." },
                { status: 404 }
            );
        }

        // 2. 이메일 목록을 이용해 사용자 ID 찾기
        const users = await User.find({ email: { $in: emails } }).select("_id email");
        
        if (users.length === 0) {
            return NextResponse.json(
                { message: "배포 대상 사용자를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        // 3. 사용자별 최대 발급 한도 초과 여부 확인
        const userCouponsCounts = await UserCoupon.aggregate([
            {
                $match: {
                    couponId: coupon._id,
                    userId: { $in: users.map(u => u._id) }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const existingCounts = new Map(userCouponsCounts.map(item => [item._id.toString(), item.count]));

        const newCouponsData = [];
        const usersToDistribute = [];

        for (const user of users) {
            const count = existingCounts.get(user._id.toString()) || 0;
            if (coupon.maxUsagePerUser && count >= coupon.maxUsagePerUser) {
                // 한도 초과한 사용자는 건너뛰기
                continue;
            }

            // 새로운 UserCoupon 객체 생성
            newCouponsData.push({
                userId: user._id,
                couponId: coupon._id,
                discountValue: coupon.discountValue,
                discountType: coupon.discountType,
                assignedAt: new Date(),
                assignmentType: "manual",
                endAt: coupon.endAt,
            });
            usersToDistribute.push(user);
        }

        if (newCouponsData.length === 0) {
            return NextResponse.json(
                { message: "쿠폰을 발급할 수 있는 사용자가 없습니다." },
                { status: 409 }
            );
        }

        // 4. 쿠폰 발급 한도(전체) 초과 여부 확인
        const totalNewAssignments = newCouponsData.length;
        if (coupon.maxUsage !== null && (coupon.currentUsage + totalNewAssignments) > coupon.maxUsage) {
            return NextResponse.json(
                { message: "전체 쿠폰 발급 한도를 초과합니다." },
                { status: 406 }
            );
        }

        // 트랜잭션 없이 단순한 방식으로 구현
        await UserCoupon.insertMany(newCouponsData);
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { currentUsage: totalNewAssignments } });

        return NextResponse.json(
            { 
                message: `${totalNewAssignments}명의 사용자에게 쿠폰이 성공적으로 발급되었습니다.`, 
                distributedCount: totalNewAssignments,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("쿠폰 일괄 발급 중 오류:", error);
        return NextResponse.json(
            { message: "쿠폰 발급 실패", details: error.message },
            { status: 500 }
        );
    }
}