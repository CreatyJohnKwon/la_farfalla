import Image from "next/image";

const MainScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden">
            <div className="relative w-1/2 h-1/2 font-serif text-center text-9xl text-black -mt-72">
                <Image
                    src="/chill.png"
                    alt="chill_guy_img"
                    width={500}
                    height={500}
                    className="absolute inset-0 -z-50 blur-md object-cover place-self-center"
                />
                <p>LA_FARFALLA</p>
                <p>WE ARE CHILL</p>
            </div>
        </div>
    )
}

export default MainScreen;