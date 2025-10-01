import { PortOneClient } from "@portone/server-sdk";
import { PaymentClient } from "@portone/server-sdk/payment";

export const portone = PortOneClient({
  secret: process.env.V2_API_SECRET!,
});

export const paymentClient = PaymentClient({
  secret: process.env.PORTONE_API_SECRET_KEY!,
});