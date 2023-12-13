import axios from "axios";

export async function getUpvoteFactRequest(userId) {
    try {
        const res = await axios.post("http://localhost:4000/facts/userUpvotes", {
            id: userId
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}