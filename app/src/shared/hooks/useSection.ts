import { useAtom } from "jotai";
import { sectionAtom, categoryAtom } from "@/src/shared/lib/atom";
import { redirect } from "next/navigation";

const useSection = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [category, setCategory] = useAtom(categoryAtom);

    const moveToShop = (key: any) => {
        setSection(key);
        redirect("/shop");
    }

    return {
        category,
        section,
        setCategory,
        setSection,

        moveToShop
    };
};

export default useSection;
