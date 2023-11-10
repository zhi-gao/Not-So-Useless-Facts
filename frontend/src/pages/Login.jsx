import { useRef } from "react";
import { useNavigate } from "react-router-dom"

export default function Login() {
    const navigate = useNavigate();

    const usernameRef = useRef();
    const passwordRef = useRef();

    async function submitHandler(e) {
        e.preventDefault();

        const username = usernameRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if(!username) {

        }

        if(!password) {

        }

        // make request
    }

    return <div>
        <h1>Login</h1>

        <form onSubmit={submitHandler}>
            <label>Username</label><br></br>
            <input ref={usernameRef} /><br></br>

            <label>Password</label><br></br>
            <input ref={passwordRef} /><br></br>

            <a onClick={() => navigate("/register")}>New User? Register</a><br></br>
            <button>Login</button>
        </form>
    </div>
}