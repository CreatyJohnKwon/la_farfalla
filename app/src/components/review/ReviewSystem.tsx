import { useState } from "react";
import ReviewItem from "./ReviewItem";
import { ReviewSystemProps } from "./interface";
import {
    useGetReviewsListQuery,
    usePostReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useToggleReviewLikeMutation,
    usePostCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useToggleCommentLikeMutation,
} from "@src/shared/hooks/react-query/useReviewQuery";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";

const ReviewSystem: React.FC<ReviewSystemProps> = ({ productId }) => {
    // React Query 훅들
    const {
        data: reviewsData,
        isLoading,
        error,
        refetch,
    } = useGetReviewsListQuery(productId);
    const postReviewMutation = usePostReviewMutation();
    const updateReviewMutation = useUpdateReviewMutation();
    const deleteReviewMutation = useDeleteReviewMutation();
    const toggleReviewLikeMutation = useToggleReviewLikeMutation();
    const postCommentMutation = usePostCommentMutation();
    const updateCommentMutation = useUpdateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();
    const toggleCommentLikeMutation = useToggleCommentLikeMutation();

    // 로컬 상태
    const [newReview, setNewReview] = useState("");
    const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    // 데이터 추출
    const reviews = reviewsData?.data || [];

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

            // 미리보기 생성 - 타입 안전하게 수정
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                // 🔥 타입 안전한 처리
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

    // 리뷰 작성 - 기존 훅과 완전 호환
    const handleSubmitReview = async () => {
        if (newReview.trim()) {
            try {
                // 🆕 기존 방식에 imageFiles만 추가
                await postReviewMutation.mutateAsync({
                    content: newReview,
                    productId,
                    imageFiles: uploadedPhotos, // 🆕 파일 객체 배열 추가
                });

                // 폼 초기화
                setNewReview("");
                setUploadedPhotos([]);
                setPhotoPreviews([]);
            } catch (error) {
                console.error("리뷰 작성 중 오류:", error);
                // 에러는 mutation에서 alert로 처리됨
            }
        }
    };

    // 댓글 추가
    const addComment = async (reviewId: string, content: string) => {
        try {
            await postCommentMutation.mutateAsync({
                reviewId,
                content,
            });
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 리뷰 좋아요 토글
    const toggleLikeReview = async (reviewId: string) => {
        try {
            await toggleReviewLikeMutation.mutateAsync(reviewId);
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 댓글 좋아요 토글
    const toggleLikeComment = async (reviewId: string, commentId: string) => {
        try {
            await toggleCommentLikeMutation.mutateAsync({
                reviewId,
                commentId,
            });
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 리뷰 수정
    const editReview = async (
        reviewId: string,
        newContent: string,
        images?: string[],
    ) => {
        try {
            await updateReviewMutation.mutateAsync({
                reviewId,
                content: newContent,
                images,
            });
        } catch (error) {
            // 에러는 mutation에서 처리됨
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
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 리뷰 삭제
    const deleteReview = async (reviewId: string) => {
        if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            try {
                await deleteReviewMutation.mutateAsync(reviewId);
            } catch (error) {
                // 에러는 mutation에서 처리됨
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
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 로딩 상태
    if (isLoading) {
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
                    <p className="mt-2 text-sm text-gray-400">
                        {error.message}
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            고객 리뷰
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                                {reviews.length}개의 리뷰
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* 사진 첨부 영역 - textarea 위에 위치 */}
                    <div className="flex items-start gap-3">
                        {/* 사진 추가 버튼 (정사각형) */}
                        <div
                            className={`relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 transition-colors hover:border-gray-400 ${
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
                                onChange={(e) => handleFiles(e.target.files)}
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

                        {/* 업로드된 사진들 - 우측으로 하나씩 생성 */}
                        {photoPreviews.map((preview, index) => (
                            <div key={index} className="group relative">
                                <img
                                    src={preview}
                                    alt={`미리보기 ${index + 1}`}
                                    className="h-16 w-16 rounded-md border border-gray-200 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* 사진 개수 표시 */}
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
            </div>

            <div className="space-y-0">
                {reviews.map((review) => (
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
        </div>
    );
};

export default ReviewSystem;
