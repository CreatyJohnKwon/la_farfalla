import { Product } from "@/src/components/product/interface";

const ProductTitle = ({
    formData,
    handleInputChange,
}: {
    formData: Product;
    handleInputChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
}) => {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                    상품명 (한글) *
                </label>
                <input
                    type="text"
                    name="titleKr"
                    value={formData.title.kr}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                    placeholder="한글 상품명을 입력하세요"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                    상품명 (영어) *
                </label>
                <input
                    type="text"
                    name="titleEg"
                    value={formData.title.eg}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                    placeholder="English product name"
                    required
                />
            </div>
        </div>
    );
};

export default ProductTitle;
