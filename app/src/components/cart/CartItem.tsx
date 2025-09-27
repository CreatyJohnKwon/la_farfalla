import { SelectedItem } from "@src/entities/type/interfaces";
import usePage from "@src/shared/hooks/usePage";
import useCart from "@src/shared/hooks/useCart";
import Image from "next/image";

interface CartItemProps {
    item: SelectedItem;
    onClose: () => void;
}

const CartItem = ({ item, onClose }: CartItemProps) => {
    const { router } = usePage();
    const { handleDeleteProduct, handleUpdateProduct } = useCart();
    const cartItemId = item._id || "";

    // 수량 증가 핸들러
    const handleIncrease = (item: SelectedItem) => {
        handleUpdateProduct(item.quantity + 1, item);
    };

    // 수량 감소 핸들러
    const handleDecrease = (item: SelectedItem) => {
        // 수량이 1보다 클 때만 감소시킵니다.
        if (item.quantity > 1) {
            handleUpdateProduct(item.quantity - 1, item);
        }
    };

    return (
        // relative 클래스를 추가하여 삭제 버튼의 기준점으로 만듭니다.
        <div className="relative flex w-full items-center gap-4 border-b p-4 sm:p-5 text-black">
            <button 
                onClick={() => handleDeleteProduct(cartItemId)}
                className="absolute top-2 right-3 text-gray-400 font-amstel text-base sm:text-lg hover:text-black transition-colors"
                aria-label="장바구니에서 삭제"
            >
                &times;
            </button>

            <Image
                src={item.image} 
                alt={item.title} 
                className="h-20 w-20 flex-shrink-0 object-cover sm:h-24 sm:w-24 cursor-pointer"
                width={24}
                height={24}
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
                <p className="font-pretendard font-[500] text-sm sm:text-base ps-1.5">{item.title || "상품 이름"}</p>
                <p className="text-xs text-gray-600 sm:text-sm font-amstel font-[340] ps-1.5">
                    {item.additional ? `${item.additional}` : `${item.size || "size"} - ${item.color || "color"}`}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-amstel font-[300]">
                    <button 
                        onClick={() => handleDecrease(item)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 text-gray-600 mb-0.5"
                        aria-label="수량 감소"
                    >
                        -
                    </button>
                    <span className="text-sm font-amstel">{item.quantity}</span>
                    <button 
                        onClick={() => handleIncrease(item)}
                        className="w-6 h-6 text-gray-600 mb-0.5"
                        aria-label="수량 증가"
                    >
                        +
                    </button>
                </div>
            </div>
            <span className="text-sm sm:text-base font-amstel self-end mb-2">
                {(item.discountPrice * item.quantity).toLocaleString()+"\t"}
                <span className="text-sm sm:text-base">
                    KRW
                </span>
            </span>
        </div>
    );
}

export default CartItem;