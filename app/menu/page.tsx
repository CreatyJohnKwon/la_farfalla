import Link from "next/link";

const Menu = () => {
    return (
        <div className="flex flex-col items-end justify-center h-screen w-5/6 text-end">
            <div className="font-serif -me-10 c_md:-me-0 text-4xl c_md:text-7xl transition-all duration-700 ease-in-out">
                <Link href="/account" className="font-serif mt-5">ACCOUNT</Link><br/>
                <Link href="/shop" className="mt-5">SHOP</Link><br/>
                <Link href="/fun" className="mt-5">FONT DESIGN</Link><br/>
                <Link href="/purpose" className="mt-5">PURPOSE</Link>
            </div>
        </div>
    )
}

export default Menu;