import { useAtom } from "jotai";
import { sectionAtom, categoryAtom, sidebarAtom } from "@/src/shared/lib/atom";

const useSection = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [category, setCategory] = useAtom(categoryAtom);
    const [openSidebar, setOpenSidebar] = useAtom<boolean>(sidebarAtom);

    return {
        openSidebar,
        category,
        section,

        setOpenSidebar,
        setCategory,
        setSection,
    };
};

export default useSection;
