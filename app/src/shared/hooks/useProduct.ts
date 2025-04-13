import { Post } from "../../entities/interfaces";

const useProduct = (post: Post) => {
    const price: number = Number(post.price);
    const discount = Number(post.discount);

    const priceResult = (): string => {
        if (post.price) {
            return price.toLocaleString();
        }
        return "0";
    };

    const priceDiscount = (): string => {
        if (post.price && post.discount) {
            let discountPrice = price - price * (discount / 100);
            discountPrice = Math.floor(discountPrice / 10) * 10;

            return discountPrice.toLocaleString();
        }
        return "0";
    };

    return {
        priceResult,
        priceDiscount,
    };
};

export default useProduct;
