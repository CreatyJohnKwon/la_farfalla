import { redirectIfNeeded } from "@src/shared/lib/auth";
import LoginClient from "./LoginClient";

const Login = async () => {
    await redirectIfNeeded("login");

    return <LoginClient />;
};

export default Login;
