"use client";

import { useState, useMemo } from "react";
import ReviewItem from "./ReviewItem";
import { ReviewSystemProps } from "./interface";
import {
    usePostReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useToggleReviewLikeMutation,
    usePostCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useToggleCommentLikeMutation,
    useReviewPermission,
} from "@src/shared/hooks/react-query/useReviewQuery";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";
import useUsers from "@/src/shared/hooks/useUsers";
import ImageViewerModal from "@/src/widgets/modal/ImageViewerModal";

// 정렬 옵션 타입 정의
type SortOption = "newest" | "oldest" | "most-liked" | "least-liked";

const ReviewSystem = ({
    productId,
    reviews,
    isLoading,
    error,
    refetch,
    imgsOnly
}: ReviewSystemProps) => {
    const postReviewMutation = usePostReviewMutation();
    const updateReviewMutation = useUpdateReviewMutation();
    const deleteReviewMutation = useDeleteReviewMutation();
    const toggleReviewLikeMutation = useToggleReviewLikeMutation();
    const postCommentMutation = usePostCommentMutation();
    const updateCommentMutation = useUpdateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();
    const toggleCommentLikeMutation = useToggleCommentLikeMutation();

    // 리뷰 권한 검증 훅
    const { data: permissionData, isLoading: permissionLoading } = useReviewPermission(productId);

    // 로컬 상태
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [newReview, setNewReview] = useState("");
    const { authCheck } = useUsers();

    // 권한 체크
    const canWriteReview = permissionData?.canReview || false;
    const permissionMessage = permissionData?.message || "";

    // 정렬 옵션 설정
    const sortOptions = [
        { value: "newest", label: "최신순", icon: "↓" },
        { value: "oldest", label: "오래된순", icon: "↑" },
        { value: "most-liked", label: "좋아요 많은순", icon: "↓" },
        { value: "least-liked", label: "좋아요 적은순", icon: "↑" },
    ] as const;

    // 리뷰 정렬 로직
    const sortedReviews = useMemo(() => {
        const reviewsCopy = [...reviews];

        switch (sortOption) {
            case "newest":
                return reviewsCopy.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
            case "oldest":
                return reviewsCopy.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                );
            case "most-liked":
                return reviewsCopy.sort((a, b) => b.likesCount - a.likesCount);
            case "least-liked":
                return reviewsCopy.sort((a, b) => a.likesCount - b.likesCount);
            default:
                return reviewsCopy;
        }
    }, [reviews, sortOption]);

    // 현재 선택된 정렬 옵션 레이블
    const currentSortLabel =
        sortOptions.find((option) => option.value === sortOption)?.label ||
        "최신순";

    // 파일 업로드 처리
    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles: File[] = [];

        Array.from(files).forEach((file) => {
            // 파일 타입 검증
            if (!file.type.startsWith("image/")) {
                alert("이미지 파일만 업로드 가능합니다.");
                return;
            }

            // 파일 크기 검증 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("파일 크기는 5MB 이하만 가능합니다.");
                return;
            }

            // 최대 5개 제한
            if (uploadedPhotos.length + newFiles.length >= 5) {
                alert("최대 5개의 사진만 업로드할 수 있습니다.");
                return;
            }

            newFiles.push(file);

            // 미리보기 생성
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const target = e.target;
                if (
                    target &&
                    target.result &&
                    typeof target.result === "string"
                ) {
                    setPhotoPreviews((prev) => [
                        ...prev,
                        target.result as string,
                    ]);
                }
            };
            reader.readAsDataURL(file);
        });

        setUploadedPhotos((prev) => [...prev, ...newFiles]);
    };

    // 드래그 앤 드롭 이벤트
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    // 사진 제거
    const removePhoto = (index: number) => {
        setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // 정렬 옵션 변경
    const handleSortChange = (newSortOption: SortOption) => {
        setSortOption(newSortOption);
        setIsDropdownOpen(false);
    };

    // 리뷰 작성
    const handleSubmitReview = async () => {
        if (authCheck())
            if (newReview.trim())
                try {
                    await postReviewMutation.mutateAsync({
                        content: newReview,
                        productId,
                        imageFiles: uploadedPhotos,
                    });

                    // 폼 초기화
                    setNewReview("");
                    setUploadedPhotos([]);
                    setPhotoPreviews([]);
                } catch (error) {
                    console.error("리뷰 작성 중 오류:", error);
                }
    };

    // 댓글 추가
    const addComment = async (reviewId: string, content: string) => {
        if (authCheck())
            try {
                await postCommentMutation.mutateAsync({
                    reviewId,
                    content,
                });
            } catch (error) {
                console.error(error);
            }
    };

    // 리뷰 좋아요 토글
    const toggleLikeReview = async (reviewId: string) => {
        try {
            if (authCheck())
                await toggleReviewLikeMutation.mutateAsync(reviewId);
        } catch (error) {
            console.error(error);
        }
    };

    // 댓글 좋아요 토글
    const toggleLikeComment = async (reviewId: string, commentId: string) => {
        try {
            if (authCheck())
                await toggleCommentLikeMutation.mutateAsync({
                    reviewId,
                    commentId,
                });
        } catch (error) {
            console.error(error);
        }
    };

    // 리뷰 수정
    const editReview = async (
        reviewId: string,
        newContent: string,
        images?: string[],
    ) => {
        try {
            if (authCheck())
                await updateReviewMutation.mutateAsync({
                    reviewId,
                    content: newContent,
                    images,
                });
        } catch (error) {
            console.error(error);
        }
    };

    // 댓글 수정
    const editComment = async (commentId: string, newContent: string) => {
        const review = reviews.find((r) =>
            r.comments.some((c) => c.id === commentId),
        );
        if (review) {
            try {
                await updateCommentMutation.mutateAsync({
                    reviewId: review._id,
                    commentId,
                    content: newContent,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    // 리뷰 삭제
    const deleteReview = async (reviewId: string) => {
        if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            try {
                await deleteReviewMutation.mutateAsync(reviewId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // 댓글 삭제
    const deleteComment = async (commentId: string) => {
        const review = reviews.find((r) =>
            r.comments.some((c) => c.id === commentId),
        );
        if (review && confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                await deleteCommentMutation.mutateAsync({
                    reviewId: review._id,
                    commentId,
                });
            } catch (error) {
            }
        }
    };

    // 로딩 상태
    if (isLoading || permissionLoading) {
        return (
            <LoadingSpinner size="md" fullScreen={false} message="Loading..." />
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="mx-auto min-h-screen bg-white p-8">
                <div className="py-20 text-center">
                    <p className="text-lg text-red-500">
                        리뷰를 불러오는데 실패했습니다
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 bg-black px-6 py-2 text-white hover:bg-gray-800"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen w-full bg-white p-6">
            <div className="mb-12 border border-gray-100 bg-white p-6">
                <div className="mb-8 flex flex-row items-center justify-between">
                    <h2 className="font-amstel mb-2 text-3xl text-gray-900">
                        Review
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                            {reviews.length}개의 리뷰
                        </span>
                    </div>
                </div>

                {canWriteReview ? (
                    <div className="space-y-5">
                        <div className="flex items-start gap-3">
                            <div
                                className={`relative flex h-16 w-16 cursor-pointer items-center justify-center border border-dashed border-gray-300 transition-colors hover:border-gray-400 ${
                                    isDragOver ? "border-black bg-gray-50" : ""
                                } ${uploadedPhotos.length >= 5 ? "pointer-events-none opacity-50" : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleFiles(e.target.files)
                                    }
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    disabled={uploadedPhotos.length >= 5}
                                />
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>

                            {photoPreviews.map((preview, index) => (
                                <div key={index} className="group relative">
                                    <img
                                        src={preview}
                                        alt={`미리보기 ${index + 1}`}
                                        className="h-16 w-16 border border-gray-200 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-red-500 text-xs leading-none text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {uploadedPhotos.length > 0 && (
                                <div className="ml-2 flex items-center">
                                    <span className="text-xs text-gray-400">
                                        {uploadedPhotos.length}/5
                                    </span>
                                </div>
                            )}
                        </div>

                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="w-full resize-none border border-gray-300 bg-white p-5 text-gray-800 placeholder-gray-500 focus:border-black focus:outline-none"
                            rows={4}
                            placeholder="서비스에 대한 리뷰를 작성해주세요. (최대 1000자)"
                            disabled={postReviewMutation.isPending}
                            maxLength={1000}
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmitReview}
                                disabled={
                                    postReviewMutation.isPending ||
                                    !newReview.trim()
                                }
                                className="bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {postReviewMutation.isPending
                                    ? "작성 중..."
                                    : "리뷰 작성"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
                        <div className="mb-2">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 15v2m0 0v2m0-2h2m-2 0H9.5A5.5 5.5 0 1 1 9.5 4h13A2.5 2.5 0 0 1 25 6.5V7"
                                />
                            </svg>
                        </div>
                        <p className="mb-1 text-lg font-medium text-gray-700">
                            리뷰 작성 불가
                        </p>
                        <p className="text-sm text-gray-500">
                            {permissionMessage}
                        </p>
                    </div>
                )}
            </div>

            {imgsOnly.length > 0 ? (
                <div>
                    <h3 className="mb-4 text-lg font-bold">
                        리뷰 이미지
                    </h3>
                    <div className="relative overflow-hidden">
                        <style>
                            {`
                            .custom-scrollbar::-webkit-scrollbar {
                                height: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background-color: rgba(0, 0, 0, 0.2);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            `}
                        </style>
                        <div className="flex w-full gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {imgsOnly.map((imgSrc, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        setImgUrl(imgSrc);
                                        setIsImageModalOpen(true);
                                    }}
                                    className="group relative flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                                >
                                    <img
                                        src={imgSrc}
                                        alt={`리뷰 이미지 ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-20">
                                        <span className="text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            확대보기
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div></div>
            )}

            {reviews.length > 0 && (
                <div className="relative place-self-end py-5">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        <span>{currentSortLabel}</span>
                        <svg
                            className={`h-4 w-4 transition-transform ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right border border-gray-200 bg-white shadow-lg">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        handleSortChange(option.value)
                                    }
                                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                                        sortOption === option.value
                                            ? "bg-gray-50 font-medium text-gray-900"
                                            : "text-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        <span className="text-xs text-gray-400">
                                            {option.icon}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-0">
                {sortedReviews.map((review) => (
                    <ReviewItem
                        key={review._id}
                        review={review}
                        onAddComment={addComment}
                        onLikeReview={toggleLikeReview}
                        onLikeComment={toggleLikeComment}
                        onLikePending={toggleReviewLikeMutation.isPending}
                        onLikeCommentPending={
                            toggleCommentLikeMutation.isPending
                        }
                        onEditReview={editReview}
                        onEditComment={editComment}
                        onDeleteReview={deleteReview}
                        onDeleteComment={deleteComment}
                    />
                ))}
            </div>

            {isDropdownOpen && (
                <div
                    className="z-5 fixed inset-0"
                    onClick={() => setIsDropdownOpen(false)}
                ></div>
            )}

            {reviews.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                    <p className="text-lg text-gray-500">
                        아직 리뷰가 없습니다.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        첫 번째 리뷰를 작성해보세요!
                    </p>
                </div>
            )}

            {isImageModalOpen && 
                <ImageViewerModal 
                    onClose={() => setIsImageModalOpen(false)}
                    imageUrl={imgUrl}
                />
            }
        </div>
    );
};

export default ReviewSystem;
