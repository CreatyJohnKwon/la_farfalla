import { connectDB } from "@/app/utils/database";

const Shop = async () => {

    const client = await connectDB;
    const db = client.db("forum");
    let result = await db.collection("post").find({}).toArray();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <ul>
                {result.map((post) => (
                    <li key={`${post._id}`}>
                        <h1>{post.title}</h1>
                        <p>{post.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Shop;