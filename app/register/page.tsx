import RegistClient from "./RegisterClient";
import { redirectIfNeeded } from "@/src/shared/lib/auth";

const Register = async () => {
    await redirectIfNeeded("register");

    return <RegistClient />;
};

export default Register;
