export async function getFactCommentsRequest(factId) {
    try {
        const res = await axios.get("http://localhost:4000/comments", {
            factId
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}