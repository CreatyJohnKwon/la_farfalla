import { redirectIfNeeded } from "@/src/shared/lib/auth";
import ProfileClient from "./ProfileClient";

const Profile = async () => {
    await redirectIfNeeded("profile");

    return <ProfileClient />;
};

export default Profile;
