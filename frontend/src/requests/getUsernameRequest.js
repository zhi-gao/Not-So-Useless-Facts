import axios from "axios";

export async function getUsernameRequest(userId) {
    try {
        const res = await axios.post("http://localhost:4000/user/search", {
            id: userId
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}