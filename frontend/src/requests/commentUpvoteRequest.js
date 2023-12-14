import axios from "axios"

export async function commentUpvoteRequest(commentId, userId) {
    try {
        const res = await axios.post("http://localhost:4000/comments/upvote", {
            userId, commentId
        }, {withCredentials : true});

        return res.data?.msg;
    } catch (err) {
        throw err;
    }
}