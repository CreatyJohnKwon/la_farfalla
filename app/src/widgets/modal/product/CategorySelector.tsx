import { Category } from "@/src/entities/type/common";

interface CategorySelectorProps {
    selectedCategories: string[]; 
    setSelectedCategories: (categoryIds: string[]) => void;
    allCategories?: Category[];
}

const CategorySelector = ({
    selectedCategories = [],
    setSelectedCategories,
    allCategories = [],
}: CategorySelectorProps) => {
    // 카테고리 _id를 추가하는 함수
    const addCategory = (categoryId: string) => {
        if (categoryId && !selectedCategories.includes(categoryId)) {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // 카테고리 _id를 삭제하는 함수
    const removeCategory = (categoryIdToRemove: string) => {
        setSelectedCategories(
            selectedCategories.filter((id) => id !== categoryIdToRemove)
        );
    };

    // select 태그의 onChange 핸들러
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        addCategory(e.target.value);
        e.target.value = ""; // 선택 후 초기화
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
                카테고리 (중복 가능)
            </label>
            <select
                onChange={handleSelectChange}
                className="w-full border border-gray-300 bg-white px-3 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
            >
                <option value="">카테고리를 선택하세요...</option>
                {allCategories.map((item) => (
                    <option key={item._id} value={item._id}>
                        {item.name}
                    </option>
                ))}
            </select>

            <div className="flex max-h-[40px] h-auto flex-wrap items-center gap-2">
                {selectedCategories.length === 0 && (
                    <span className="px-2 text-sm text-gray-400">선택된 카테고리가 없습니다.</span>
                )}
                {/* [KEY CHANGE] selectedCategories는 이제 _id 배열입니다. */}
                {selectedCategories.map((categoryId) => {
                    // _id를 이용해 전체 카테고리 목록에서 해당 카테고리 정보를 찾습니다.
                    const category = allCategories.find(cat => cat._id === categoryId);
                    // 카테고리 정보가 없으면 렌더링하지 않습니다 (데이터 동기화 문제 방지).
                    if (!category) return null;

                    return (
                        <span
                            key={categoryId} // key도 고유한 _id로 변경
                            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
                        >
                            {category.name} {/* 화면에는 이름을 보여줍니다. */}
                            <button
                                type="button"
                                onClick={() => removeCategory(categoryId)}
                                className="text-gray-400 hover:text-red-500"
                                aria-label={`${category.name} 카테고리 삭제`}
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySelector;