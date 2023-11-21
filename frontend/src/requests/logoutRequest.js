import axios from "axios";

export async function logoutRequest(email) {
    try {
        await axios.post("http://localhost:4000/user/logout", {email}, {
            withCredentials : true,
        });

        localStorage.removeItem("token");
    } catch (err) {
        throw err;
    }
}