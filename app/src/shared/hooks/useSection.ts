import { useAtom } from "jotai";
import { sectionAtom } from "@/src/shared/lib/atom";

const useSection = () => {
    const [section, setSection] = useAtom(sectionAtom);

    return {
        section,
        setSection,
    };
};

export default useSection;
