import React, { useState, useCallback } from 'react';

// review.content 를 위한 인터페이스 정의
interface ReviewContentsProps {
    review: {
        content: string;
    };
    images: string[];
    openImageModal: (imageUrl: string) => void;
}

const ReviewContents = ({ review, images, openImageModal }: ReviewContentsProps) => {
    // 텍스트 확장 state
    const [isExpanded, setIsExpanded] = useState(false);
    // 최대 글자 수
    const displayLimit = 80;

    // 리뷰 내용이 표시 제한을 초과하는지 확인
    const needsReadMore = review.content.length > displayLimit;

    // 표시할 텍스트 결정: 확장 상태이거나 제한을 초과하지 않으면 전체 텍스트, 아니면 잘린 텍스트
    const displayedContent = isExpanded || !needsReadMore
        ? review.content
        : `${review.content.substring(0, displayLimit)}....`;

    // "더보기"/"간략히" 토글 핸들러
    const toggleReadMore = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <>
            {/* 🆕 이미지 갤러리 */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {images.map((imageUrl, index) => (
                            <div
                                key={index}
                                className="group relative cursor-pointer"
                                onClick={() =>
                                    openImageModal(imageUrl)
                                }
                            >
                                <img
                                    src={imageUrl}
                                    alt={`리뷰 이미지 ${index + 1}`}
                                    className="h-20 w-20 border border-gray-200 object-cover transition-transform duration-200 hover:scale-105 hover:shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28"
                                />
                                {/* 🆕 호버 오버레이 */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-20">
                                    <span className="text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        확대보기
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 🆕 이미지가 많을 때 개수 표시 */}
                    {images.length > 4 && (
                        <p className="text-xs text-gray-500">
                            총 {images.length}개의 이미지
                        </p>
                    )}
                </div>
            )}
             {/* whitespace-pre-wrap : 공백, 들여쓰기, 줄바꿈을 모두 그대로 유지하고, 텍스트가 박스 끝에 도달하면 줄바꿈을 시켜 "스크롤바 없이" 텍스트를 보여줌 */}
            <div className="leading-relaxed text-gray-800 whitespace-pre-wrap">
                {displayedContent}

                {/* "더보기" / "간략히" */}
                {needsReadMore && (
                    <button
                        onClick={toggleReadMore}
                        className="ms-2 font-pretendard font-[500] text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none"
                    >
                        {isExpanded ? "간략히" : "더보기"}
                    </button>
                )}
            </div>
        </>
    );
};

export default ReviewContents;
