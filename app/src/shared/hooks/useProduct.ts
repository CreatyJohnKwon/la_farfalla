import { useAtom } from "jotai";
import { sectionAtom, categoryAtom, sidebarAtom } from "@src/shared/lib/atom";

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);

    return {
        openSidebar,
        section,

        setOpenSidebar,
        setSection,
    };
};

export default useProduct;
