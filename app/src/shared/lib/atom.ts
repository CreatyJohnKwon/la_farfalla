import { Product, SelectedItem } from "@src/entities/type/interfaces";
import { Session } from "next-auth";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const isLoggedInAtom = atomWithStorage<boolean>("login", false);
export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const sectionAtom = atomWithStorage<string>("section", "");
export const categoryAtom = atomWithStorage<Product[] | []>("category", []);
export const pagesAtom = atom<"o" | "e" | "m" | "c" | string>("");
export const sidebarAtom = atom<boolean>(false);
export const cartViewAtom = atom<boolean>(false);
export const cartDatasAtom = atom<SelectedItem[] | []>([]);
export const orderDatasAtom = atomWithStorage<SelectedItem[] | []>(
    "orderData",
    [],
);
