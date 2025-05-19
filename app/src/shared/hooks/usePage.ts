import { useState } from "react";

const usePage = () => {
    const [pages, setPages] = useState("");

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
