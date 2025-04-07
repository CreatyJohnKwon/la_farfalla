// import { connectDB } from "../context/database";

// const useDatas = () => {
//     const getDatas = async () => {
//         const client = await connectDB;
//         const db = client.db("forum");
//         let result = await db.collection("post").find({}).toArray();
//         console.log(result);
//         return result;
//     }

//     return { getDatas };
// }

// export default useDatas;