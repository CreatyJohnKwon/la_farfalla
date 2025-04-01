import Link from "next/link";

const Menu = () => {
    return (
        <div className="flex flex-col items-end justify-center h-screen w-5/6 text-end">
            <div className="text-7xl font-serif">
                <Link href="/account" className="font-serif mt-5">ACCOUNT</Link><br/>
                <Link href="/shop" className="mt-5">SHOP</Link><br/>
                <Link href="/" className="mt-5">THIRD MENU</Link><br/>
                <Link href="/" className="mt-5">FOURTH MENU</Link><br/>
                <Link href="/purpose" className="mt-5">PURPOSE</Link>
            </div>
        </div>
    )
}

export default Menu;