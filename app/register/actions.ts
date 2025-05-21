import { registUser } from "@/src/shared/lib/server/user";
import { RegistReqData } from "@/src/entities/type/interfaces";

async function registUserAction(formData: RegistReqData) {
    return await registUser(formData);
}

export { registUserAction };
