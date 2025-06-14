import { useAtom } from "jotai";
import {
    productFormDatasAtom,
    sectionAtom,
    sidebarAtom,
} from "@src/shared/lib/atom";

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);
    const [formData, setFormData] = useAtom(productFormDatasAtom);

    return {
        openSidebar,
        setOpenSidebar,
        section,
        setSection,
        formData,
        setFormData,
    };
};

export default useProduct;
