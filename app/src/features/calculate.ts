import { Product } from "@src/entities/type/interfaces";

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

const priceResult = (product: Product): string => {
    const price: number = Number(product.price);

    if (product.price) {
        return price.toLocaleString();
    }
    return "0";
};

const priceDiscount = (product: Product): string => {
    const price: number = Number(product.price);
    const discount = Number(product.discount);

    if (product.price && product.discount) {
        let discountPrice = price - price * (discount / 100);
        discountPrice = Math.floor(discountPrice / 10) * 10;

        return discountPrice.toLocaleString();
    }
    return "0";
};

const justDiscount = (product: Product): number => {
    const price: number = Number(product.price);
    const discount = Number(product.discount);

    if (product.price && product.discount) {
        let discountPrice = price - price * (discount / 100);
        discountPrice = Math.floor(discountPrice / 10) * 10;

        return discountPrice;
    }

    return 0;
};

export {
    serialize,
    serializeFindOne,
    priceResult,
    priceDiscount,
    justDiscount,
};
