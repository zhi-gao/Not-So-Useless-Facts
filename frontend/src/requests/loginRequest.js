import axios from "axios"

export async function loginRequest(email, password) {
    if(!email || !password) throw new Error("Email or Password cannot be empty");

    try {
        const res = await axios.post("http://localhost:4000/user/login", {email, password});

        const data = res.data;
    } catch (err) {
        throw err;
    }
}