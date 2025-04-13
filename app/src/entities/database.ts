import { MongoClient } from "mongodb";
const url = "mongodb+srv://admin:john1125@laf-cluster.julhaoc.mongodb.net/?retryWrites=true&w=majority&appName=laf-cluster"
let connectDB: Promise<MongoClient>;

declare global {
    var _mongo: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongo) {
        global._mongo = new MongoClient(url).connect();
    }
    connectDB = global._mongo;
} else {
    connectDB = new MongoClient(url).connect();
}

export {
    connectDB
}