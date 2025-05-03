import { useAtom } from "jotai";
import { sectionAtom, categoryAtom } from "@/src/shared/lib/atom";

const useSection = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [category, setCategory] = useAtom(categoryAtom);

    return {
        category,
        section,
        setCategory,
        setSection,
    };
};

export default useSection;
