import axios from "axios";

export async function getFactCommentsRequest(factId) {
    try {
        const res = await axios.post("http://localhost:4000/comments", {
            id: factId
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}