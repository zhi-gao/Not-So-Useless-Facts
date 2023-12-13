import axios from "axios";

export async function getDownvoteFactRequest(userId) {
    try {
        const res = await axios.post("http://localhost:4000/facts/userDownvotes", {
            id: userId
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}