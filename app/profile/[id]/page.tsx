import { redirectIfNeeded } from "@/src/shared/lib/auth";
import { IDProps } from "@/src/entities/type/interfaces";
import ProfileClient from "@/profile/[id]/ProfileClient";

const Profile = async ({ params }: IDProps) => {
    await redirectIfNeeded("profile");

    const { id } = await params;
    if (!id) return null;

    return <ProfileClient id={id} />;
};

export default Profile;
