// lib/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const getAuthSession = () => getServerSession(authOptions);
