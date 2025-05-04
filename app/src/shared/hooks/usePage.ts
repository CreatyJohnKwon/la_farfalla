import { useAtom } from "jotai";
import { pagesAtom } from "@/src/shared/lib/atom";

const usePage = () => {
    const [pages, setPages] = useAtom(pagesAtom);

    const instagramHandler = () =>
        window.open(
            "https://www.instagram.com/lafarfalla____?igsh=aHdsM3EzNzk1bDh5&utm_source=qr",
            "la_farfalla_instagram",
        );

    return {
        pages,
        setPages,
        instagramHandler,
    };
};

export default usePage;
