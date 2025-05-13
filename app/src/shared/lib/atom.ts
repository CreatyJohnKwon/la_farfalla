import { Products } from "@/src/entities/type/interfaces";
import { Session } from "next-auth";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const isLoggedInAtom = atomWithStorage<boolean>("login", false);
export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const sectionAtom = atomWithStorage<number>("section", 0);
export const categoryAtom = atomWithStorage<Products[] | []>("category", []);
export const pagesAtom = atom<"e" | "o" | "q">("o");
export const sidebarAtom = atom<boolean>(false);
export const cartViewAtom = atom<boolean>(false);
