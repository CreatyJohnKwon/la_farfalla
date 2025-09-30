import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMileageQuery } from '@/src/shared/hooks/react-query/useBenefitQuery';
import LoadingSpinner from '../../spinner/LoadingSpinner';
import { MileageItem } from '@/src/components/order/interface';
import ModalWrap from '../etc/ModalWrap';

interface MileageModalProps {
    userId: string;
    onClose: () => void;
}

const UserMileageListModal = ({ userId, onClose }: MileageModalProps) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError,
        isFetchingNextPage,
    } = useMileageQuery(userId);

    const { ref, inView } = useInView({
        threshold: 0,
        delay: 100,
    });

    useEffect(() => {
        // When the ref element comes into view and there's a next page, fetch it.
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-40">
                    <LoadingSpinner />
                </div>
            );
        }

        if (isError) {
            return (
                <div className="flex justify-center items-center h-40 text-red-500">
                    오류가 발생했습니다.
                </div>
            );
        }

        if (!data || data.pages.length === 0 || data.pages[0].length === 0) {
            return (
                <div className="flex justify-center items-center h-40 text-gray-500">
                    마일리지 내역이 없습니다.
                </div>
            );
        }

        return data.pages.map((page, i) => (
            <div key={i} className="space-y-4">
                {page.map((mileage: MileageItem) => (
                    <div
                        key={mileage._id}
                        className="flex items-center justify-between border-b pb-2"
                    >
                        <div>
                            <p className="font-semibold text-sm">{mileage.description}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(mileage.createdAt).toLocaleDateString(
                                    'ko-KR',
                                )}
                            </p>
                        </div>
                        <p
                            className={`font-bold ${
                                mileage.type === "earn"
                                    ? 'text-blue-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {mileage.type === "earn" ? '+' : '-'}
                            {mileage.amount.toLocaleString()}P
                        </p>
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <ModalWrap
            onClose={onClose}
            className="relative w-[90vw] max-w-md bg-white p-6 pb-0 shadow-2xl sm:w-full rounded-md"
        >
            <div className='flex flex-row w-full items-start justify-between mb-12'>
                <h2 className="text-xl font-pretendard font-[600]">
                    마일리지 리스트
                </h2>
                <button className="text-2xl font-light leading-none" onClick={onClose}>
                    &times;
                </button>
            </div>
            
            {/* Scrollable content area */}
            <div className="max-h-[60vh] h-auto overflow-y-auto pr-2 space-y-4">
                {renderContent()}
                {/* Intersection Observer target */}
                <div ref={ref} className="h-1" />
                {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        </ModalWrap>
    );
};

export default UserMileageListModal;