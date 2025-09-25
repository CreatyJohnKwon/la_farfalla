import { redirectIfNeeded } from "@src/shared/lib/auth";
import ProfileClient from "@/profile/[id]/ProfileClient";

interface IDProps {
    params: Promise<{ id: string }>;
}

const Profile = async ({ params }: IDProps) => {
    await redirectIfNeeded("profile");

    const { id } = await params;
    if (!id) return null;

    return <ProfileClient id={id} />;
};

export default Profile;
