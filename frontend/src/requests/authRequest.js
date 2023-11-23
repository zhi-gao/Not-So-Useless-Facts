import axios from "axios";

export async function authRequest() {
    const accessToken = localStorage.getItem("token");

    if(!accessToken) throw new Error("No access token in storage");

    try {
        const res = await axios.post("http://localhost:4000/user/auth", {}, {
            headers : {Authorization : `Bearer ${accessToken}`},
            withCredentials : true
        });

        return res.data;
    } catch (err) {
        throw err;
    }
}