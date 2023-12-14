import axios from "axios";

export async function reportRequest(userId, recipientId, recipientType, flag, comment) {
    try {
        const res = await axios.post("http://localhost:4000/user/report", {
            userId, recipientId, recipientType, flag, comment
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}