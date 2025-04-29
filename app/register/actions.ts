"use server";

import registUser from "@/src/shared/lib/server/registUser";
import { RegistReqData } from "@/src/entities/type/interfaces";

async function registUserAction(formData: RegistReqData) {
    return await registUser(formData);
}

const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (numbers.length < 4) return numbers;
    if (numbers.length < 8) return numbers.replace(/(\d{3})(\d+)/, "$1-$2");
    return numbers.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
};

export {
    registUserAction,
    formatPhoneNumber
}