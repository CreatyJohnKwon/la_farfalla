import { atom } from "jotai";
import { Session } from "next-auth";

export const isLoggedInAtom = atom(false);
export const sessionAtom = atom<Session | null>(null);
export const sectionAtom = atom<number>(0);
