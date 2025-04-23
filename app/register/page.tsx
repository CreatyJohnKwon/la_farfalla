import RegistClient from "./RegisterClient";
import { registUser } from "./actions";
import { redirectIfNeeded } from "@/src/shared/lib/auth";

const Register = async () => {
    await redirectIfNeeded("register");

    return <RegistClient registUser={registUser} />;
};

export default Register;
