"use client";

import { useAtom } from "jotai";
import { darkModeAtom } from "../utils/jotai";
import { useEffect } from "react";

const useDarkMode = () => {
    const [darkMode, setDarkMode] = useAtom<boolean>(darkModeAtom);

    const clickDarkMode = () => {
        localStorage.setItem('darkMode', (!darkMode).toString())
        setDarkMode(!darkMode)
    }

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode]);

    return {
        darkMode,
        setDarkMode,
        clickDarkMode
    }
}

export default useDarkMode;