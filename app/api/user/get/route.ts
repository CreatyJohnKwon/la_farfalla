import { getAuthSession } from "@/src/shared/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@/src/entities/db/mongoose";
import User from "@/src/entities/models/User";
import { UserProfile } from "@/src/entities/type/api/get";

// GET: 유저 정보 조회
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean<UserProfile>();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result: UserProfile = {
    name: user.name || "",
    email: user.email || "",
    image: user.image || "",
    address: user.address || undefined,
  }

  return NextResponse.json(result);
}

export async function FETCH(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, address, password, image } = body;

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (name) user.name = name;
  if (address) user.address = address;
  if (image) user.image = image;
  if (password) user.password = password; // 💡 여기서 bcrypt로 해싱 처리 필요!

  await user.save();

  return NextResponse.json({ success: true });
}