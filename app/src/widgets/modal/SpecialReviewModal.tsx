import { useState } from "react"
import ModalWrap from "./ModalWrap"
import DefaultImage from "../../../../public/images/chill.png"
import { textareaPlaceholder } from "@/src/utils/dataUtils"
import { specialReviewItem } from "@/src/components/product/interface"
import { usePostReviewMutation } from "@src/shared/hooks/react-query/useReviewQuery"
import useOrder from "@/src/shared/hooks/useOrder"

const TEXT_REVIEW_MILEAGE = 500;       // 텍스트 후기 마일리지
const PHOTO_REVIEW_BASE_MILEAGE = 1000;  // 기본 포토 후기 마일리지
const PHOTO_REVIEW_BONUS_MILEAGE = 1500; // 3장 이상 포토 후기 마일리지
const PHOTO_BONUS_THRESHOLD = 3;       // 보너스 마일리지 기준 사진 수

const SpecialReviewModal = ({ 
    onClose, 
    productItem
}: { 
    onClose: () => void; 
    productItem: specialReviewItem;
}) => {
    const postReviewMutation = usePostReviewMutation();

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewText, setReviewText] = useState("")
    const [photos, setPhotos] = useState<File[]>([])
    const { addEarnMileage } = useOrder();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (photos.length + newFiles.length > 5) {
                alert("사진은 최대 5개까지 첨부할 수 있습니다.");
                return;
            }
            setPhotos(prevPhotos => [...prevPhotos, ...newFiles]);
        }
    };

    const removePhoto = (indexToRemove: number) => {
        setPhotos(prevPhotos => prevPhotos.filter((_, index) => index !== indexToRemove));
    };

    const earnMileage = async (): Promise<number> => {
        let mileageToEarn = 0;
        let reasonText = "";

        // 포토 후기인 경우 (사진 1장 이상)
        if (photos.length > 0) {
            if (photos.length >= PHOTO_BONUS_THRESHOLD) {
                mileageToEarn = PHOTO_REVIEW_BONUS_MILEAGE;
                reasonText = `포토후기 적립 | ${photos.length}장`;
            } else {
                mileageToEarn = PHOTO_REVIEW_BASE_MILEAGE;
                reasonText = "포토후기 적립 | 1장";
            }
        } 
        // 텍스트 후기인 경우 (사진 없음)
        else {
            mileageToEarn = TEXT_REVIEW_MILEAGE;
            reasonText = "텍스트후기 적립";
        }
        
        // 적립할 마일리지가 있을 경우에만 함수 호출
        if (mileageToEarn > 0 && productItem.orderId) {
            await addEarnMileage(productItem.orderId, reasonText, mileageToEarn);
        }

        return mileageToEarn;
    }

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault()

        if (rating === 0) {
            alert("별점을 선택해주세요.");
            return;
        }
        if (!reviewText.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        try {
            // 리뷰 등록 API 호출
            await postReviewMutation.mutateAsync({
                productId: productItem.productId,
                content: reviewText,
                imageFiles: photos,
                rating,
            });

            // ⭐️ 2. 구매평 마일리지 적립
            const totalMileage = await earnMileage();

            alert(`구매평이 성공적으로 등록되었습니다.\n${totalMileage} 마일리지가 적립되었습니다.`);
            onClose();
        } catch (error) {
            console.error("리뷰 등록 중 오류 발생:", error);
            alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
        }
    }

    return (
        <ModalWrap 
            onClose={onClose} 
            className="relative h-[80vh] sm:h-[75vh] w-[90vw] overflow-y-auto bg-white shadow-2xl sm:w-[35vw] p-5 text-base rounded-md"
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-lg font-pretendard-bold font-[600] text-gray-900">
                    구매평 작성
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                    <span>
                        &times;
                    </span>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* 상품 정보 */}
                <div className="flex items-center gap-4 pb-5">
                    <img
                        src={productItem.productImage ? productItem.productImage[0] : DefaultImage.src}
                        alt="product"
                        className="w-16 h-16 object-cover"
                    />
                    <div>
                        <span className="font-pretendard-bold text-black ms-1">
                            {productItem.productName}
                        </span>
                    </div>
                </div>

                {/* 별점 */}
                <div className="text-center">
                    <h2 className="text-lg font-semibold mb-2">상품은 어떠셨나요?</h2>
                    <div className="flex justify-center items-center gap-1">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1
                            return (
                                <button
                                    type="button"
                                    key={starValue}
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHoverRating(starValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="cursor-pointer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24"
                                        fill={starValue <= (hoverRating || rating) ? "#f87171" : "#e5e7eb"}
                                        className="h-8 w-8"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 리뷰 텍스트 입력 */}
                <div className="relative w-full">
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={8}
                        placeholder={textareaPlaceholder}
                        maxLength={1200}
                        className="w-full rounded-md border border-gray-300 p-3 pr-16 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none font-pretendard"
                    />
                    <p className="absolute bottom-3 right-3 text-sm text-gray-400 font-amstel">
                        {reviewText.length} / 1200
                    </p>
                </div>
                
                {/* 사진 첨부 */}
                <div>
                    <p className="font-semibold mb-2">사진 첨부</p>
                    <div className="flex items-center gap-4 flex-wrap">
                        {photos.length < 5 && (
                            <label
                                htmlFor="photo-upload"
                                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span className="text-sm text-gray-500 mt-1">{photos.length}/5</span>
                            </label>
                        )}
                        <input
                            type="file"
                            id="photo-upload"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {photos.map((file, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`preview ${index}`}
                                    className="h-24 w-24 rounded-md object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black bg-opacity-60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-4 pt-6 font-pretendard font-[600]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-md border border-gray-300 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        닫기
                    </button>
                    <button
                        type="submit"
                        disabled={postReviewMutation.isPending}
                        className="flex-1 rounded-md bg-gray-900 py-3 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
                    >
                        {postReviewMutation.isPending ? "등록 중..." : "구매평 등록"}
                    </button>
                </div>
            </form>
        </ModalWrap>
    )
}

export default SpecialReviewModal

