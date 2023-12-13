import axios from "axios";

export async function factDownvoteRequest(factId, userId) {
    try {
        const res = await axios.post("http://localhost:4000/facts/downvote", {
            userId, factId
        });

        return res.data?.msg;
    } catch (err) {
        throw err;
    }
}