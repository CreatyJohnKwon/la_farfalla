import Link from "next/link";
import { menuData } from "@/app/utils/context/dummy";;

const Menu = () => {
    return (
        <div className="flex flex-col items-end justify-center h-screen w-5/6 text-end">
            <ul className="font-brand -me-10 c_md:-me-0 text-4xl c_md:text-7xl transition-all duration-700 ease-in-out">
                {
                    menuData.map((menuList, index) => (
                        <li key={index} className="mt-3">
                            <Link href={`${menuList.link}`}>{menuList.text}</Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default Menu;