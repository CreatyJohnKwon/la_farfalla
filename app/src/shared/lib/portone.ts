import { PortOneClient } from "@portone/server-sdk";

export const portone = PortOneClient({
    secret: process.env.V2_API_SECRET!,
});
