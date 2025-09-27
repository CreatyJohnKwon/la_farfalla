import { Category } from "@src/entities/type/interfaces";
import useProduct from "@src/shared/hooks/useProduct";

const CategoryList = ({ category }: { category: Category[]}) => {
    const { setSection, section } = useProduct();

    return (
        <ul className="flex flex-row font-amstel text-xs sm:text-base gap-4 sm:gap-5">
            <li
                key={"All_section"}
                onClick={() => setSection("")}
                className={`cursor-pointer transition-colors ${section === "" ? "text-gray-400" : "text-black"}`}
            >
                All
            </li>
            {category.map((cat) => 
                cat.name === "MVP" ?
                (
                    <li key={cat._id} className="-m-2"></li>
                ) : (
                    <li
                        key={cat._id}
                        onClick={() => setSection(cat.name)}
                        className={`cursor-pointer transition-colors ${section === cat.name ? "text-gray-400" : "text-black"}`}
                    >
                        {cat.name}
                    </li>
                )
            )}
        </ul>
    )
}

export default CategoryList;