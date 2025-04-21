import { Posts } from "@/src/entities/type/interfaces";

const serialize = <T extends { _id: any }>(
    docs: T[],
): (Omit<T, "_id"> & { _id: string })[] =>
    docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
    }));

const serializeFindOne = <T extends { _id: any }>(
    doc: T,
): Omit<T, "_id"> & { _id: string } => ({
    ...doc,
    _id: doc._id.toString(),
});

const priceResult = (post: Posts): string => {
    const price: number = Number(post.price);

    if (post.price) {
        return price.toLocaleString();
    }
    return "0";
};

const priceDiscount = (post: Posts): string => {
    const price: number = Number(post.price);
    const discount = Number(post.discount);

    if (post.price && post.discount) {
        let discountPrice = price - price * (discount / 100);
        discountPrice = Math.floor(discountPrice / 10) * 10;

        return discountPrice.toLocaleString();
    }
    return "0";
};

export { serialize, serializeFindOne, priceResult, priceDiscount };
