import { useAtom } from "jotai";
import { sectionAtom, categoryAtom, sidebarAtom } from "@src/shared/lib/atom";

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [category, setCategory] = useAtom(categoryAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);

    return {
        openSidebar,
        category,
        section,

        setOpenSidebar,
        setCategory,
        setSection,
    };
};

export default useProduct;
