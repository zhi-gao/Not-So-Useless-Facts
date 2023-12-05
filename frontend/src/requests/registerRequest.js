import axios from "axios";

export async function registerRequest(username, email, password) {
    try {
        await axios.post("http://localhost:4000/user/register", {
            username, email, password
        }, {withCredentials : true});
    } catch (err) {
        throw err;
    }
}