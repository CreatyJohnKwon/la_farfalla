import { useAtom } from "jotai";
import { pagesAtom } from "@/src/shared/lib/atom";

const usePage = () => {
    const [pages, setPages] = useAtom(pagesAtom);

    return {
        pages,
        setPages,
    };
};

export default usePage;
