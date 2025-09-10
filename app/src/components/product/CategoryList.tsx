import { Category } from "@/src/entities/type/interfaces";
import useProduct from "@/src/shared/hooks/useProduct";

const CategoryList = ({ category }: { category?: Category[]}) => {
    const { section, setSection } = useProduct();

    return (
        <div className="flex flex-grow place-self-center items-center sm:justify-center sm:-ms-56">
            {!category ?
                (<span className="text-sm font-pretendard-bold text-red-600">
                    상품 정보 송신 에러: 405 productlist
                </span>) : (
                <ul className="flex flex-row font-amstel text-xl sm:text-3xl gap-5">
                    {/* 2. 'All' 메뉴에 조건부 스타일을 적용합니다. */}
                    <li
                        key={"All_section"}
                        onClick={() => setSection("")}
                        className={`cursor-pointer transition-colors hover:text-black ${
                            section === "" ? "text-black" : "text-gray-300"
                        }`}
                    >
                        All
                    </li> 
                    {category.map((cat) => 
                        // 3. 각 카테고리 메뉴에 조건부 스타일을 적용합니다.
                        <li
                            key={cat._id}
                            onClick={() => setSection(cat.name)}
                            className={`cursor-pointer transition-colors hover:text-black ${
                                section === cat.name ? "text-black" : "text-gray-300"
                            }`}
                        >
                            {cat.name}
                        </li>
                    )}
                </ul>)
            }
        </div>
    )
}

export default CategoryList;