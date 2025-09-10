import { IAnnounceDTO } from "@src/entities/type/announce";

const AnnounceBannerContent = ({ announce }: { announce: IAnnounceDTO }) => {
    // 헥스 코드 유효성 검사 함수
    const isValidHex = (hex: string) => {
        return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    };

    // 안전한 색상 처리
    const getBackgroundColor = () => {
        if (announce.backgroundColor && isValidHex(announce.backgroundColor)) {
            return `#${announce.backgroundColor}`;
        }
        return "#000000"; // 기본 검정색
    };

    const getTextColor = () => {
        if (announce.textColor && isValidHex(announce.textColor)) {
            return `#${announce.textColor}`;
        }
        return "#FFFFFF"; // 기본 흰색
    };

    return (
        <div
            className="absolute left-0 top-0 z-50 w-full overflow-hidden"
            style={{
                backgroundColor: getBackgroundColor(),
                color: getTextColor(),
            }}
        >
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
        <div className="flex gap-[40vw] px-[20vw] py-1 font-pretendard text-xs font-[500]">
            {Array(3)
                .fill(null)
                .map((_, i) => (
                    <span key={i}>{text}</span>
                ))}
        </div>
    );
};

export default AnnounceBannerContent;
