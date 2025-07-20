import { Season } from "@/src/entities/type/interfaces";
import { SectionProps } from "./interface";

const Section = ({
    formData,
    handleInputChange,
    season,
    variants,
}: SectionProps) => {
    return (
        season && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        시즌
                    </label>
                    <select
                        name="seasonName"
                        value={formData.seasonName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 bg-white px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                    >
                        <option value="">시즌 선택</option>
                        {season.map((item: Season, index: number) => (
                            <option key={index} value={item.title}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        가격 (원) *
                    </label>
                    <input
                        type="text"
                        name="price"
                        value={
                            formData.price
                                ? Number(formData.price).toLocaleString("ko-KR")
                                : ""
                        }
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        할인율 (%)
                    </label>
                    <input
                        type="text"
                        name="discount"
                        value={formData.discount}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (
                                value === "" ||
                                (/^\d+$/.test(value) && parseInt(value) <= 100)
                            ) {
                                handleInputChange(e);
                            }
                        }}
                        className="w-full border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                        placeholder="100 이하만 가능"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        총 수량 (자동계산)
                    </label>
                    <input
                        type="text"
                        value={variants
                            .reduce((sum, v) => sum + v.stockQuantity, 0)
                            .toString()}
                        readOnly
                        className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 px-4 py-3 text-gray-700"
                        placeholder="옵션별 재고 합계"
                    />
                </div>
            </div>
        )
    );
};

export default Section;
