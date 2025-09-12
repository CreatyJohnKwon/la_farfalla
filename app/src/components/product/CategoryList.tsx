import { Category } from "@/src/entities/type/interfaces";
import useProduct from "@/src/shared/hooks/useProduct";

const CategoryList = ({ category }: { category?: Category[]}) => {
    const { setSection } = useProduct();

    return (
        <div className="flex items-center justify-center pt-6 md:pt-0">
            {!category ?
                (<span className="text-sm font-pretendard-bold text-red-600">
                    상품 정보 송신 에러: 405 productlist
                </span>) : (
                <ul className="flex flex-row font-amstel text-xs sm:text-base gap-4 sm:gap-5">
                    <li
                        key={"All_section"}
                        onClick={() => setSection("")}
                        className={`cursor-pointer transition-colors hover:text-black`}
                    >
                        All
                    </li> 
                    {category.map((cat) => 
                        <li
                            key={cat._id}
                            onClick={() => setSection(cat.name)}
                            className={`cursor-pointer transition-colors hover:text-black`}
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