import { redirectIfNeeded } from "@/src/shared/lib/auth";
import ProfileGate from "./ProfileGate";

const Profile = async () => {
    await redirectIfNeeded("profile");

    return <ProfileGate />;
};

export default Profile;
