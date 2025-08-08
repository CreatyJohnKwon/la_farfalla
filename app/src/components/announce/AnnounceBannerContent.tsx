import { IAnnounceDTO } from "@/src/entities/type/announce";

const AnnounceBannerContent = ({ announce }: { announce: IAnnounceDTO }) => {
    return (
        <div className="absolute left-0 top-0 z-50 w-full overflow-hidden bg-black">
            <div className="flex w-max animate-marquee whitespace-nowrap">
                <div className="flex">
                    <MarqueeContent text={announce.description} />
                    <MarqueeContent text={announce.description} />
                </div>
            </div>
        </div>
    );
};

const MarqueeContent = ({ text }: { text: string }) => {
    return (
        <div className="flex gap-32 px-16 py-1 font-pretendard text-xs font-[500] text-white">
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i}>{text}</span>
                ))}
        </div>
    );
};

export default AnnounceBannerContent;
