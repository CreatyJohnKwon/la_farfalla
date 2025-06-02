import { useRouter } from "next/navigation";
import useUser from "@src/shared/hooks/useUsers";
import { SelectedItem } from "@src/entities/type/interfaces";
import { useAtom } from "jotai";
import { orderDatasAtom } from "../lib/atom";

const useOrder = () => {
    const { session } = useUser();
    const router = useRouter();
    const [orderDatas, setOrderDatas] = useAtom<SelectedItem[] | []>(
        orderDatasAtom,
    );

    return {
        orderDatas,
        setOrderDatas,
        session,
        router,
    };
};

export default useOrder;
