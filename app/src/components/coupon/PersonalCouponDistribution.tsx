import { ICoupon } from "@/src/entities/type/common";
import { X, Send, Mail, AlertCircle } from "lucide-react";
import { useState } from "react";

const PersonalCouponDistribution = ({
    isOpen,
    onClose,
    selectedCoupon,
    onDistribute
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedCoupon: ICoupon | null;
    onDistribute: (emails: string[]) => void;
}) => {
    const [emailInput, setEmailInput] = useState('');
    const [emailList, setEmailList] = useState<string[]>([]);

    if (!isOpen || !selectedCoupon) return null;

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const processEmailInput = (text: string) => {
        const emails = text
            .split(/[\n,;\s]+/)
            .map(email => email.trim())
            .filter(email => email && isValidEmail(email));
        
        const uniqueEmails = [...new Set(emails)];
        setEmailList(uniqueEmails);
    };

    const removeEmail = (emailToRemove: string) => {
        setEmailList(emailList.filter(email => email !== emailToRemove));
    };

    const handleDistribute = () => {
        if (emailList.length > 0) {
            onDistribute(emailList);
            setEmailList([]);
            setEmailInput('');
            onClose();
        }
    };

    const invalidEmails = emailInput
        .split(/[\n,;\s]+/)
        .map(email => email.trim())
        .filter(email => email && !isValidEmail(email));

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
            onClick={onClose}
        >
            <div 
                className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">개별 쿠폰 배포</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            "{selectedCoupon.name}" 쿠폰을 특정 사용자에게 배포합니다
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                        <h3 className="font-medium text-blue-900">{selectedCoupon.name}</h3>
                        <p className="text-sm text-blue-700">{selectedCoupon.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-blue-600">코드: {selectedCoupon.code}</span>
                            <span className="text-blue-600">
                                할인: {selectedCoupon.discountType === 'percentage' 
                                    ? `${selectedCoupon.discountValue}%` 
                                    : `${selectedCoupon.discountValue?.toLocaleString()}원`}
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            <Mail className="mr-2 inline h-4 w-4" />
                            사용자 이메일 주소
                        </label>
                        <p className="mb-3 text-sm text-gray-500">
                            여러 이메일은 줄바꿈, 쉼표, 세미콜론 또는 공백으로 구분해서 입력하세요
                        </p>
                        <textarea
                            value={emailInput}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                processEmailInput(e.target.value);
                            }}
                            placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        
                        {invalidEmails.length > 0 && (
                            <div className="mt-2 flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        유효하지 않은 이메일 형식:
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        {invalidEmails.join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {emailList.length > 0 && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                배포 대상자 목록 ({emailList.length}명)
                            </label>
                            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-3">
                                <div className="space-y-2">
                                    {emailList.map((email, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-700">{email}</span>
                                            <button
                                                onClick={() => removeEmail(email)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">배포 정보</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>• 각 사용자에게 개별 쿠폰이 발급됩니다</p>
                            {/* <p>• 이메일로 쿠폰 발급 알림이 전송됩니다</p> */}
                            <p>• 유저당 최대 사용 횟수: {selectedCoupon.maxUsagePerUser || 1}회</p>
                            <p>• 유효기간: {new Date(selectedCoupon.startAt).toLocaleDateString('ko-KR')} ~ {new Date(selectedCoupon.endAt).toLocaleDateString('ko-KR')}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDistribute}
                            disabled={emailList.length === 0}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            <Send className="h-4 w-4" />
                            {emailList.length}명에게 배포
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalCouponDistribution;