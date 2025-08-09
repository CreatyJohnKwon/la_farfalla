// utils/dateUtils.ts
export const getCurrentDateTime = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

export const getDateTimeAfterHours = (hours: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const timezoneOffset = future.getTimezoneOffset() * 60000;
    const localTime = new Date(future.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

export const isImageUrl = (description: string) => {
    return (
        description.startsWith("http") &&
        (description.includes(".jpg") ||
            description.includes(".jpeg") ||
            description.includes(".png") ||
            description.includes(".gif") ||
            description.includes("r2.dev"))
    );
};
