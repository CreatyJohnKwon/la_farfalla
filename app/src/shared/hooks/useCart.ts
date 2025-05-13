import { useAtom } from "jotai";
import { cartViewAtom } from "@/src/shared/lib/atom";

const useCart = () => {
    const [cartView, setCartView] = useAtom(cartViewAtom);

    return {
        cartView,
        setCartView,
    };
};

export default useCart;
