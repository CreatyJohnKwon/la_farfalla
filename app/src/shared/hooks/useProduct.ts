import { useAtom } from "jotai";
import {
    sectionAtom,
    categoryAtom,
    sidebarAtom,
    countProductAtom,
} from "@/src/shared/lib/atom";

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [category, setCategory] = useAtom(categoryAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);
    const [count, setCount] = useAtom(countProductAtom);

    const increase = () => setCount((prev) => prev + 1);
    const decrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

    return {
        openSidebar,
        category,
        section,

        setOpenSidebar,
        setCategory,
        setSection,

        count,
        increase,
        decrease,
    };
};

export default useProduct;
