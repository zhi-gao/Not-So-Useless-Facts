import axios from "axios"

export async function factUpvoteRequest(factId, userId) {
    try {
        const res = await axios.post("http://localhost:4000/facts/upvote", {
            userId, factId
        }, {withCredentials : true});

        return res.data;
    } catch (err) {
        throw err;
    }
}