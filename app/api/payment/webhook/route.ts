import { syncPayment } from "@src/shared/lib/payments";
import { Webhook } from "@portone/server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();

    const verified = await Webhook.verify(
        process.env.V2_WEBHOOK_SECRET!,
        rawBody,
        Object.fromEntries(req.headers),
    );

    if ("data" in verified && "paymentId" in verified.data) {
        await syncPayment(verified.data.paymentId);
    }

    return new NextResponse(null, { status: 200 });
}
