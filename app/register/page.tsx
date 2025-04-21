import RegistClient from "./RegisterClient";
import { registUser } from "./actions";

const Register = async () => {
    return <RegistClient registUser={registUser} />;
};

export default Register;
