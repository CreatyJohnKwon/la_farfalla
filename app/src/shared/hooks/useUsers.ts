import { isLoggedInAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/src/shared/lib/atom";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

    const sessionCheck = (navData: any) => {
        const session = useAtomValue(sessionAtom);

        if (session === null) {
            setIsLoggedIn(true);
            navData[1].text = "login";
        } else {
            setIsLoggedIn(false);
            navData[1].text = "profile";
        }
    };

    return {
        isLoggedIn,
        setIsLoggedIn,
        sessionCheck,
    };
};

export default useUsers;
