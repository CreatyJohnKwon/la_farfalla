import { connectDB } from "@/app/utils/database";

const Shop = async () => {
    const client = await connectDB;
    const db = client.db("forum");
    let result = await db.collection("post").find({}).toArray();
    console.log(result);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
<<<<<<< HEAD
            <div className="items-start grid grid-cols">
                
            </div>
=======
            <div></div>
>>>>>>> 4e8f93d693f2fe4e5c621fd5ac9738ec0e256ad6
        </div>
    )
}

export default Shop;