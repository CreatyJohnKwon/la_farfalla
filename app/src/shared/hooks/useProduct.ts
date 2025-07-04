import { useAtom, useSetAtom } from "jotai";
import {
    productFormDatasAtom,
    resetProductFormAtom,
    sectionAtom,
    sidebarAtom,
} from "@src/shared/lib/atom";

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);
    const [formData, setFormData] = useAtom(productFormDatasAtom);
    const resetProductForm = useSetAtom(resetProductFormAtom);

    return {
        openSidebar,
        setOpenSidebar,
        section,
        setSection,
        formData,
        setFormData,

        resetProductForm
    };
};

export default useProduct;
