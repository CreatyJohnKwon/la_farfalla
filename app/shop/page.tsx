import { connectDB } from "@/app/utils/database";
import Navbar from '@/app/utils/layouts/Navbar/Navbar';
import { Post } from "@/app/utils/types/interfaces";
import ProductsList from "../utils/layouts/Products/ProductsList";

const Shop = async () => {
    const db = (await connectDB).db("forum");
    let result = await db.collection("post").find({}).toArray() as unknown as Post[];

    return (
        <div className="h-full w-screen pb-24">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="w-5/6 c_md:w-4/6 container mx-auto c_base:px-4 c_base:py-8 transition-all duration-300 ease-in-out">
                    <ul className="grid grid-cols-1 c_md:grid-cols-2 gap-2 c_sm:gap-4 c_base:gap-12 transition-all duration-300 ease-in-out">
                        {result.map((post) => (
                            <ProductsList key={post._id} post={post} />
                        ))} 
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Shop;