import { Shop } from "@/src/entities/interfaces";
import { atom } from "jotai";
import { Session } from "next-auth";
import { atomWithStorage } from "jotai/utils";

export const isLoggedInAtom = atomWithStorage<boolean>("login", false);
export const isOAuthOpenAtom = atomWithStorage<boolean>("oauthOpen", false);
export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const sectionAtom = atomWithStorage<number>("section", 0);
export const categoryAtom = atomWithStorage<Shop[] | []>("category", []);
