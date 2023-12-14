import axios from "axios";

export async function commentDownvoteRequest(commentId, userId) {
    try {
        const res = await axios.post("http://localhost:4000/comments/downvote", {
            userId, commentId
        });

        return res.data?.msg;
    } catch (err) {
        throw err;
    }
}