import { useAtom } from "jotai";
import { pagesAtom } from "@/src/shared/lib/atom";

const useProfile = () => {
    const [pages, setPages] = useAtom(pagesAtom);

    return {
        pages,
        setPages,
    };
};

export default useProfile;
