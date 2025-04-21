import { Products } from "@/src/entities/type/interfaces";
import { atom } from "jotai";
import { Session } from "next-auth";
import { atomWithStorage } from "jotai/utils";

export const isLoggedInAtom = atomWithStorage<boolean>("login", false);
export const isOAuthOpenAtom = atomWithStorage<boolean>("oauthOpen", false);
export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const sectionAtom = atomWithStorage<number>("section", 0);
export const categoryAtom = atomWithStorage<Products[] | []>("category", []);
export const emailAtom = atom<string>("");
export const passwordAtom = atom<string>("");
export const disabledAtom = atom<boolean>(true);
