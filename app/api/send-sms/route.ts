// import { sendSMS } from "@/src/shared/lib/sms";

// export async function POST(req: Request) {
//   const { phoneNumber } = await req.json();
//   const code = Math.floor(100000 + Math.random() * 900000).toString();

//   await redis.set(`verify:${phoneNumber}`, code, 'EX', 300);

//   const result = await sendSMS(phoneNumber, `인증번호는 ${code}입니다`);
//   return Response.json({ success: result });
// }
