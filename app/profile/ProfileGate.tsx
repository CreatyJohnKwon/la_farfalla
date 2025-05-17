import FolderImage from "../../public/images/folder_ic.png";
import Image from "next/image";

const ProfileGate = () => {
    const folderData = [
        { id: 1, title: "Order", image: FolderImage },
        { id: 2, title: "Edit", image: FolderImage },
        { id: 3, title: "Mileage", image: FolderImage },
        { id: 4, title: "Coupon", image: FolderImage },
    ];

    return (
        <div className="h-screen w-screen">
            <span>뭔가 요소</span>
            <div className="mx-auto mt-32 grid max-w-[50vw] grid-cols-2 items-center justify-center gap-10">
                {folderData.map((item) => (
                    <div
                        key={item.id}
                        className="group relative aspect-square w-full cursor-pointer"
                    >
                        <Image
                            src={item.image}
                            alt={`profile_folder_img_${item.id}`}
                            fill
                            className="object-cover transition group-hover:brightness-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="font-amstel text-[2em] font-semibold text-white drop-shadow">
                                {item.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileGate;
