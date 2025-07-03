import { SMSOrderData, SMSResult } from "@/src/entities/type/interfaces";
import axios from "axios";
import crypto from "crypto";

// 네이버 SENS 서명 생성
const makeSignature = (): string => {
    const space = " ";
    const newLine = "\n";
    const method = "POST";
    const url = `/sms/v2/services/${process.env.NAVER_SENS_SERVICE_ID}/messages`;
    const timestamp = Date.now().toString();
    const accessKey = process.env.NAVER_SENS_ACCESS_KEY || "";
    const secretKey = process.env.NAVER_SENS_SECRET_KEY || "";

    const message =
        method + space + url + newLine + timestamp + newLine + accessKey;

    const hmac = crypto.createHmac("sha256", secretKey);
    const signature = hmac.update(message).digest("base64");

    return signature;
};

// 주문 완료 SMS 발송
const sendOrderSMS = async (orderData: SMSOrderData): Promise<SMSResult> => {
    const { orderNumber, customerName, totalAmount, itemCount } = orderData;

    // SMS 메시지 구성 (한글 45자 제한 고려)
    const message = `[새 주문] ${orderNumber}
${customerName}님
${totalAmount.toLocaleString()}원 (${itemCount}개)
${new Date().toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
})}`;

    const timestamp = Date.now().toString();

    try {
        const response = await axios.post(
            `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.NAVER_SENS_SERVICE_ID}/messages`,
            {
                type: "SMS",
                contentType: "COMM",
                from: process.env.NAVER_SENS_SENDER_NUMBER || "",
                content: message,
                messages: [
                    {
                        to: "010-2939-2833", // 고정된 관리자 번호
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "x-ncp-apigw-timestamp": timestamp,
                    "x-ncp-iam-access-key":
                        process.env.NAVER_SENS_ACCESS_KEY || "",
                    "x-ncp-apigw-signature-v2": makeSignature(),
                },
            },
        );

        console.log("✅ 네이버 SENS SMS 발송 완료:", response.data);

        return {
            success: true,
            requestId: response.data.requestId,
            statusCode: response.data.statusCode,
            statusName: response.data.statusName,
        };
    } catch (error: any) {
        console.error(
            "❌ 네이버 SENS SMS 발송 실패:",
            error.response?.data || error.message,
        );

        // 에러 세부 정보 로깅
        if (error.response?.data) {
            console.error("에러 상세:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });
        }

        throw new Error(
            `SMS 발송 실패: ${error.response?.data?.errorMessage || error.message}`,
        );
    }
};

// SMS 발송 결과 조회 (선택사항)
const getSMSResult = async (requestId: string) => {
    const timestamp = Date.now().toString();

    try {
        const response = await axios.get(
            `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.NAVER_SENS_SERVICE_ID}/messages?requestId=${requestId}`,
            {
                headers: {
                    "x-ncp-apigw-timestamp": timestamp,
                    "x-ncp-iam-access-key":
                        process.env.NAVER_SENS_ACCESS_KEY || "",
                    "x-ncp-apigw-signature-v2": makeSignature(),
                },
            },
        );

        return response.data;
    } catch (error: any) {
        console.error("SMS 결과 조회 실패:", error);
        return null;
    }
};

// 연결 테스트 함수
const testNaverSENS = async (): Promise<boolean> => {
    try {
        // 테스트 메시지 발송
        await sendOrderSMS({
            orderNumber: "TEST-" + Date.now(),
            customerName: "테스트",
            totalAmount: 1000,
            itemCount: 1,
        });

        console.log("✅ 네이버 SENS 연결 테스트 성공");
        return true;
    } catch (error) {
        console.error("❌ 네이버 SENS 연결 테스트 실패:", error);
        return false;
    }
};

export { getSMSResult, sendOrderSMS, testNaverSENS };
