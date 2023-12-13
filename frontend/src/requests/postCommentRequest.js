import axios from "axios";

export async function postCommentRequest(factId, userId, comment) {
    try {
        const res = await axios.post("http://localhost:4000/comments/c", {
            userId, factId, comment
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}