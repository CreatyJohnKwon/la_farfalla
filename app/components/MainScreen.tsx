import Image from "next/image";
import Chillguy from "../../public/chill.png"

const MainScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden">
            <div className="relative w-1/2 h-1/2 font-serif text-center text-9xl text-black -mt-72">
                <Image
                    src={Chillguy}
                    alt="chill_guy_img"
                    width={500}
                    height={500}
                    className="absolute inset-0 -z-50 blur-md object-cover place-self-center"
                />
                <button>
                    <p>LA_FARFALLA</p>
                    <p>WE ARE CHILL</p>
                </button>
            </div>
        </div>
    )
}

export default MainScreen;