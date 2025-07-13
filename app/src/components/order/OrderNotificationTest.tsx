"use client";

import { useState } from "react";

export default function OrderNotificationTest() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    const testSMTPConnection = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/orders/test-smtp");
            const data = await response.json();
            setResult(data.message);
        } catch (error) {
            setResult("연결 테스트 실패: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-xl font-bold">
                📧 SMTP 테스트
            </h2>

            <div className="space-y-4">
                <button
                    onClick={testSMTPConnection}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading ? "테스트 중..." : "🔗 SMTP 연결 테스트"}
                </button>

                {result && (
                    <div className="mt-4 rounded-lg border bg-gray-50 p-4">
                        <h3 className="mb-2 font-semibold text-gray-800">
                            결과:
                        </h3>
                        <p className="text-sm text-gray-600">{result}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-800">💡 사용법</h3>
                <ol className="space-y-1 text-sm text-blue-700">
                    <li>1. SMTP 연결을 먼저 테스트하세요</li>
                    <li>2. 실제 주문 데이터로 알림을 발송하세요</li>
                    <li>3. 관리자 이메일로 알림이 도착하는지 확인하세요</li>
                </ol>
            </div>
        </div>
    );
}
