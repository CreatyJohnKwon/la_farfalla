import {
    Edit3,
    Heart,
    MenuSquare,
    MoreVertical,
    Trash2,
    X,
    Crown,
} from "lucide-react";
import ReviewCommentItem from "./ReviewCommentItem";
import { useState } from "react";
import { ReviewItemProps } from "./interface";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { uploadImagesToServer } from "@/src/shared/lib/uploadToR2";

const ReviewItem: React.FC<ReviewItemProps> = ({
    review,
    onAddComment,
    onLikeReview,
    onLikeComment,
    onEditReview,
    onEditComment,
    onDeleteReview,
    onDeleteComment,
    // onLikePending, onLikeCommentPending 제거 - 개별 관리
}) => {
    const [isCommenting, setIsCommenting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [editContent, setEditContent] = useState(review.content);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLikingReview, setIsLikingReview] = useState(false); // 개별 리뷰 좋아요 로딩 상태

    // 🆕 이미지 수정 관련 상태
    const [editImages, setEditImages] = useState<string[]>(review.images || []);
    const [editUploadedPhotos, setEditUploadedPhotos] = useState<File[]>([]);
    const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const { data: session } = useUserQuery();

    // 🔧 더 안전한 권한 체크 (여러 케이스 대응)
    const isOwner = (() => {
        if (!session || !review.userId) return false;

        // 케이스 1: 직접 비교
        if (review.userId._id === session._id) return true;

        // 케이스 2: toString() 비교
        if (review.userId._id?.toString() === session._id?.toString())
            return true;

        // 케이스 3: review.userId가 문자열인 경우
        if (typeof review.userId === "string" && review.userId === session._id)
            return true;

        // 케이스 4: 이메일 비교 (최후 수단)
        if (review.author === session.name || review.author === session.email)
            return true;

        return false;
    })();

    const handleAddComment = () => {
        if (commentContent.trim()) {
            onAddComment(review._id, commentContent);
            setCommentContent("");
            setIsCommenting(false);
            setShowComments(true);
        }
    };

    // 🔄 수정된 리뷰 수정 함수
    const handleEditReview = async () => {
        if (editContent.trim()) {
            // 새로 업로드된 이미지가 있으면 업로드
            let finalImages = [...editImages];

            if (editUploadedPhotos.length > 0) {
                try {
                    const uploadedUrls =
                        await uploadImagesToServer(editUploadedPhotos);
                    finalImages = [...finalImages, ...(uploadedUrls || [])];
                } catch (error) {
                    alert("이미지 업로드에 실패했습니다.");
                    return;
                }
            }

            // 리뷰 수정 (이미지 포함)
            onEditReview(review._id, editContent, finalImages);
            setIsEditing(false);

            // 편집 상태 초기화
            setEditUploadedPhotos([]);
            setEditPhotoPreviews([]);
        }
    };

    // 개별 리뷰 좋아요 처리
    const handleLikeReview = (reviewId: string) => async () => {
        if (isLikingReview) return; // 이미 로딩 중이면 중복 실행 방지

        setIsLikingReview(true);
        try {
            await onLikeReview(reviewId);
        } finally {
            setIsLikingReview(false);
        }
    };

    const handleDeleteReview = () => {
        onDeleteReview(review._id);
    };

    // 🆕 편집 시작 시 이미지 상태 초기화
    const startEditing = () => {
        setIsEditing(true);
        setEditImages(review.images || []);
        setEditUploadedPhotos([]);
        setEditPhotoPreviews([]);
        setShowMenu(false);
    };

    // 🆕 편집 취소 시 상태 초기화
    const cancelEditing = () => {
        setIsEditing(false);
        setEditContent(review.content);
        setEditImages(review.images || []);
        setEditUploadedPhotos([]);
        setEditPhotoPreviews([]);
    };

    // 🆕 기존 이미지 제거
    const removeExistingImage = (index: number) => {
        setEditImages((prev) => prev.filter((_, i) => i !== index));
    };

    // 🆕 새 이미지 파일 처리
    const handleEditFiles = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            // 파일 검증
            if (!file.type.startsWith("image/")) {
                alert("이미지 파일만 업로드 가능합니다.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("파일 크기는 5MB 이하만 가능합니다.");
                return;
            }

            // 총 이미지 개수 제한 (기존 + 새로운)
            const totalImages = editImages.length + editUploadedPhotos.length;
            if (totalImages >= 5) {
                alert("최대 5개의 사진만 업로드할 수 있습니다.");
                return;
            }

            setEditUploadedPhotos((prev) => [...prev, file]);

            // 미리보기 생성
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const target = e.target;
                if (
                    target &&
                    target.result &&
                    typeof target.result === "string"
                ) {
                    setEditPhotoPreviews((prev) => [
                        ...prev,
                        target.result as string,
                    ]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // 🆕 새 이미지 제거
    const removeNewImage = (index: number) => {
        setEditUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
        setEditPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // 🆕 드래그 앤 드롭 이벤트
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
        handleEditFiles(e.dataTransfer.files);
    };

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    const comments = review.comments || [];
    const images = review.images || [];

    return (
        <>
            <div className="border-b border-gray-200 px-2 py-8 transition-all duration-300 last:border-b-0 hover:bg-gray-50/50">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900">
                                    {review.author}
                                </h4>
                            </div>
                            <div className="mt-1 flex items-center space-x-3">
                                <p className="text-xs text-gray-500">
                                    {new Date(
                                        review.timestamp,
                                    ).toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                                {/* 🆕 이미지 개수 표시 */}
                                {images.length > 0 && (
                                    <span className="flex items-center text-xs text-blue-600">
                                        📷 {images.length}개
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🔧 권한 체크 로직 수정 */}
                    <div className="relative">
                        {isOwner && (
                            <>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 transition-colors duration-200 hover:bg-black/5"
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                </button>
                            </>
                        )}

                        {showMenu && (
                            <div className="absolute right-0 z-10 mt-2 w-36 border border-gray-200/50 bg-white shadow-2xl">
                                <button
                                    onClick={startEditing}
                                    className="flex w-full items-center space-x-3 px-4 py-3 text-left text-sm transition-colors duration-200 hover:bg-black/5"
                                >
                                    <Edit3 className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-700">수정</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteReview();
                                        setShowMenu(false);
                                    }}
                                    className="flex w-full items-center space-x-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-black/5"
                                >
                                    <Trash2 className="h-4 w-4 text-gray-600" />
                                    <span>삭제</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* 🆕 텍스트 편집 */}
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full resize-none border border-gray-300 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                                rows={4}
                                placeholder="리뷰를 수정하세요..."
                            />

                            {/* 🆕 이미지 편집 섹션 */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    이미지 수정 (최대 5개)
                                </label>

                                {/* 🆕 기존 이미지들 */}
                                {editImages.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            기존 이미지
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {editImages.map(
                                                (imageUrl, index) => (
                                                    <div
                                                        key={index}
                                                        className="group relative"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`기존 이미지 ${index + 1}`}
                                                            className="h-16 w-16 rounded border border-gray-200 object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeExistingImage(
                                                                    index,
                                                                )
                                                            }
                                                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 🆕 새 이미지 업로드 영역 */}
                                {editImages.length + editUploadedPhotos.length <
                                    5 && (
                                    <div>
                                        <div
                                            className={`relative border border-dashed p-4 text-center transition-colors ${
                                                isDragOver
                                                    ? "border-black bg-gray-50"
                                                    : "border-gray-300 hover:border-gray-400"
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleEditFiles(
                                                        e.target.files,
                                                    )
                                                }
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                            <div className="flex items-center justify-center space-x-2">
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
                                                <span className="text-sm text-gray-600">
                                                    새 이미지 추가
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    (
                                                    {5 -
                                                        editImages.length -
                                                        editUploadedPhotos.length}
                                                    개 더 추가 가능)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 🆕 새로 업로드한 이미지 미리보기 */}
                                {editPhotoPreviews.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            새로 추가한 이미지
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {editPhotoPreviews.map(
                                                (preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="group relative"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`새 이미지 ${index + 1}`}
                                                            className="h-16 w-16 rounded border border-gray-200 object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeNewImage(
                                                                    index,
                                                                )
                                                            }
                                                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleEditReview}
                                    className="bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                                >
                                    수정 완료
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="leading-relaxed text-gray-800">
                                {review.content}
                            </p>

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
                        </div>
                    )}
                </div>

                <div className="mt-5 flex items-center space-x-6">
                    <button
                        onClick={handleLikeReview(review._id)}
                        disabled={isLikingReview} // 개별 로딩 상태로 변경
                        className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                            review.isLiked
                                ? "scale-110 fill-transparent text-red-500"
                                : "text-gray-600 hover:text-red-400"
                        } ${
                            isLikingReview // 개별 로딩 상태로 변경
                                ? "cursor-not-allowed opacity-50"
                                : "hover:scale-105"
                        }`}
                    >
                        {isLikingReview ? ( // 개별 로딩 상태로 변경
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                        ) : (
                            <Heart
                                className={`h-4 w-4 transition-all duration-200 ${
                                    review.isLiked ? "scale-110" : ""
                                }`}
                            />
                        )}
                        <span className="text-sm font-medium">
                            {review.likesCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsCommenting(!isCommenting)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 transition-all duration-200 hover:bg-black/5"
                    >
                        <MenuSquare className="h-4 w-4" />
                        <span className="text-sm font-medium">댓글</span>
                    </button>

                    {comments.length > 0 && (
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 transition-all duration-200 hover:bg-black/5"
                        >
                            <span className="text-sm font-medium">
                                댓글 {comments.length}개{" "}
                                {showComments ? "숨기기" : "보기"}
                            </span>
                        </button>
                    )}
                </div>

                {isCommenting && (
                    <div className="mt-6 space-y-4">
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="w-full resize-none border border-gray-300 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                            rows={3}
                            placeholder="리뷰에 댓글을 작성하세요..."
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddComment}
                                className="bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                            >
                                댓글 작성
                            </button>
                            <button
                                onClick={() => {
                                    setIsCommenting(false);
                                    setCommentContent("");
                                }}
                                className="bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {showComments && comments.length > 0 && (
                    <div className="ml-4 mt-8 space-y-0 border-l-2 border-gray-200 pl-6">
                        <h6 className="text-sm font-medium text-gray-900">
                            댓글 {comments.length}개
                        </h6>
                        {comments.map((comment) => (
                            <ReviewCommentItem
                                key={comment.id}
                                comment={comment}
                                onLike={onLikeComment}
                                onEdit={onEditComment}
                                onDelete={onDeleteComment}
                                userId={session?._id} // 🔧 안전한 접근
                                reviewId={review._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 🆕 이미지 모달 */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={closeImageModal}
                >
                    <div className="relative max-h-full max-w-4xl">
                        <button
                            onClick={closeImageModal}
                            className="absolute -top-12 right-0 text-white transition-colors duration-200 hover:text-gray-300"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="확대된 리뷰 이미지"
                            className="max-h-full max-w-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewItem;
