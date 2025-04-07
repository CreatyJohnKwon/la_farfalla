import { connectDB } from "@/app/utils/database";

const Shop = async () => {
    const client = await connectDB;
    const db = client.db("forum");
    let result = await db.collection("post").find({}).toArray();
    console.log(result);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div></div>
        </div>
    )
}

export default Shop;