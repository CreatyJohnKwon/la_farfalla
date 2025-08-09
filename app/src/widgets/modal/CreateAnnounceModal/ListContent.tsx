import { IAnnounceDTO } from "@/src/entities/type/announce";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import AnnounceList from "./AnnounceList";

const ListContent = ({
    listError,
    isListLoading,
    announces,
    populateFormWithAnnounce,
}: {
    listError: Error | null;
    isListLoading: boolean;
    announces?: IAnnounceDTO[];
    populateFormWithAnnounce: (announce: IAnnounceDTO) => void;
}) => {
    return (
        <div className="h-full overflow-hidden p-2 sm:p-0">
            {listError ? (
                <div className="flex h-full items-center justify-center p-4 lg:p-6">
                    <div className="text-center">
                        <div className="mb-3 flex justify-center lg:mb-4">
                            <svg
                                className="h-10 w-10 text-red-400 lg:h-12 lg:w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">
                            공지 목록을 불러올 수 없습니다
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                            잠시 후 다시 시도해주세요
                        </p>
                    </div>
                </div>
            ) : isListLoading ? (
                <LoadingSpinner size="md" />
            ) : (
                <div className="h-full overflow-y-auto">
                    <AnnounceList
                        announces={announces || []}
                        onEdit={populateFormWithAnnounce}
                    />
                </div>
            )}
        </div>
    );
};

export default ListContent;
