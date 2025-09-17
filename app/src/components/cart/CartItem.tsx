import { SelectedItem } from "@src/entities/type/interfaces";
import usePage from "@/src/shared/hooks/usePage";

const CartItem = ({ item, onClose }: { item: SelectedItem; onClose: () => void; }) => {
    const { router } = usePage();

    return (
        <div className="flex w-full items-center gap-4 border-b p-2 text-black">
            <img 
                src={item.image} 
                alt={item.title} 
                className="h-20 w-20 flex-shrink-0 rounded-sm object-cover sm:h-24 sm:w-24 cursor-pointer"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=Error';
                }}
                onClick={() => {
                    router.push(`/products/${item.productId}`);
                    onClose();
                }}
            />
            <div className="flex-grow">
                <p className="font-pretendard font-[500] text-sm sm:text-base">{item.title || "상품 이름"}</p>
                <p className="text-xs text-gray-600 sm:text-sm font-amstel font-[340]">
                    {item.size || "size"} - {item.color || "size"}
                </p>
                <p className="text-xs text-gray-600 sm:text-sm font-pretendard font-[340]">
                    {item.quantity} 개
                </p>
            </div>
            <span className="text-sm sm:text-base font-pretendard font-[400]">
                {(item.discountPrice * item.quantity).toLocaleString()+"\t"}
                <span className="font-amstel text-sm sm:text-base">
                    KRW
                </span>
            </span>
        </div>
    );
}

export default CartItem;