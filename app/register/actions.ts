"use server";

import { registUser } from "@src/shared/lib/server/user";
import { RegistReqData } from "@src/entities/type/interfaces";

export async function registUserAction(formData: RegistReqData) {
    return await registUser(formData);
}
