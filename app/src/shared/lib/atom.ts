import { SelectedItem } from "@src/entities/type/interfaces";
import { Session } from "next-auth";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import { Product } from "@src/entities/type/products";

export const isLoggedInAtom = atomWithStorage<boolean>("login", false);
export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const sectionAtom = atom<string>("");
export const pagesAtom = atom<"o" | "e" | "m" | "c" | string>("");
export const sidebarAtom = atom<boolean>(false);
export const cartViewAtom = atom<boolean>(false);
export const cartDatasAtom = atom<SelectedItem[] | []>([]);
export const loadingAtom = atom(false);
export const orderDatasAtom = atomWithStorage<SelectedItem[] | []>(
    "orderData",
    [],
);
export const productFormDatasAtom = atom<Product>({
    title: {
        kr: "",
        eg: "",
    },
    description: {
        items: [],
        text: "",
        detail: "",
    },
    price: "",
    discount: "",
    image: [],
    size: [],
    quantity: "",
    categories: []
});
export const resetProductFormAtom = atom(null, (get, set) => {
    set(productFormDatasAtom, { ...INITIAL_PRODUCT_FORM_DATA });
});
const INITIAL_PRODUCT_FORM_DATA: Product = {
    title: {
        kr: "",
        eg: "",
    },
    description: {
        items: [],
        text: "",
        detail: "",
    },
    price: "",
    discount: "",
    image: [],
    size: [],
    quantity: "",
    categories: []
};
