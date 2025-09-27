import { Product } from "@src/entities/type/products";
import { Dispatch, SetStateAction } from "react";

interface SizeProps {
    sizeInput: string;
    setSizeInput: Dispatch<SetStateAction<string>>;
    formData: Product;
    setFormData: Dispatch<SetStateAction<Product>>;
}

const Size = ({
    sizeInput,
    setSizeInput,
    formData,
    setFormData,
}: SizeProps) => {
    // 사이즈 관리 함수들
    const addSize = (): void => {
        if (sizeInput.trim() && !formData.size.includes(sizeInput.trim())) {
            setFormData((prev: any) => ({
                ...prev,
                size: [...prev.size, sizeInput.trim()],
            }));
            setSizeInput("");
        }
    };

    const removeSize = (size: string): void => {
        setFormData((prev: any) => ({
            ...prev,
            size: prev.size.filter((s: any) => s !== size),
        }));
    };

    return (
        <div className="space-y-3 border-t border-dashed border-black/50 pt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                사이즈 *
            </label>
            <div className="mb-2 flex gap-2">
                <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-1 rounded-sm border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                    placeholder="사이즈를 입력하세요"
                    onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSize())
                    }
                />
                <button
                    type="button"
                    onClick={addSize}
                    className="rounded-sm bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    추가
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {formData.size.map((size: any, index: number) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
                    >
                        {size}
                        <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Size;
