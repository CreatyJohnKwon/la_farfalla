"use server";

import { IAnnounceDTO } from "@/src/entities/type/announce";
import HomeClient from "./HomeClient";
import { fetchAnnounces } from "@/src/shared/lib/server/announce";

// ISR

const HomePage = async() => {
    const announces: IAnnounceDTO[] = await fetchAnnounces();

    const popupAnnounces: IAnnounceDTO[] = announces.filter(
        (announce) => announce.isPopup,
    );
    const bannerAnnounces: IAnnounceDTO[] = announces.filter(
        (announce) => !announce.isPopup,
    );

    const bannerAnnounce: IAnnounceDTO | null =
        bannerAnnounces.length > 0 ? bannerAnnounces[0] : null;

    return <HomeClient bannerAnnounce={bannerAnnounce} popupAnnounces={popupAnnounces} />;
}

export default HomePage;