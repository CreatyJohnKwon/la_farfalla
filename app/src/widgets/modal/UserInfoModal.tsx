import { OrderData, OrderItem } from "@/src/entities/type/interfaces";
import { useOneUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { motion } from "framer-motion";
import { useMemo } from "react";

const UserInfoModal = ({
    orderData,
    onClose,
}: {
    orderData: OrderData | null;
    onClose: () => void;
}) => {
    const {
        data: userData,
        isLoading,
        error,
    } = useOneUserQuery(orderData?.userId);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-[90vw] max-w-md bg-white p-6 shadow-2xl sm:w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="mb-6 text-center font-pretendard text-2xl font-semibold text-gray-800">
                    유저 주문 정보
                </h1>

                {!isLoading ? (
                    <div className="space-y-4 text-base text-gray-700">
                        <InfoRow
                            label="이름"
                            value={error ? "탈퇴한 유저" : userData?.name}
                        />
                        <InfoRow
                            label="이메일"
                            value={error ? "탈퇴한 유저" : userData?.email}
                        />
                        <InfoRow
                            label="전화번호"
                            value={
                                error ? "탈퇴한 유저" : userData?.phoneNumber
                            }
                        />
                        <InfoRow
                            label="결제방법"
                            value={orderData?.payMethod}
                        />

                        <BoxElement
                            label={"배송 주소"}
                            value={`${orderData?.address}
            ${orderData?.postcode && `${orderData?.postcode}`}
            ${orderData?.detailAddress && `, ${orderData?.detailAddress}`}`}
                        />
                        {orderData?.deliveryMemo && (
                            <BoxElement
                                label={"배송 메모"}
                                value={`${orderData?.deliveryMemo}`}
                            />
                        )}

                        <div className="me-1 mt-2 place-self-end text-end text-xs">
                            <p className="mb-1 font-medium text-gray-500">
                                UUID (DB 확인용)
                            </p>
                            <p className="font-mono text-gray-600">
                                {userData?._id}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-40 items-center justify-center text-gray-500">
                        불러오는 중...
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg bg-gray-800 py-2 text-lg text-white hover:bg-gray-700"
                >
                    닫기
                </button>
            </motion.div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex justify-between text-sm font-medium">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900">{value || "-"}</span>
    </div>
);

const BoxElement = ({ label, value }: { label: string; value?: string }) => (
    <div className="mt-4 rounded-lg bg-gray-100 p-4">
        <p className="mb-2 text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
    </div>
);

export default UserInfoModal;
