import { useState } from "react";
import { SizeDropProps } from "@/src/entities/type/interfaces";
import { IoChevronDown } from "react-icons/io5";

const SizeDrop = ({ size }: SizeDropProps) => {
    const [selected, setSelected] = useState("");

    return (
        <div className="font-amstel relative w-full">
            <label className="mb-1 block text-sm font-semibold text-black">
                size <span className="text-gray-800">*</span>
            </label>
            <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full appearance-none border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-black focus:outline-none"
                required
            >
                <option key={"default"} value="" disabled hidden>
                    size (필수)
                </option>
                {size.map((item, index) => (
                    <option key={`size ${index}`}>{item}</option>
                ))}
            </select>

            <IoChevronDown className="pointer-events-none absolute right-3 top-10 text-black" />
        </div>
    );
};

export default SizeDrop;
