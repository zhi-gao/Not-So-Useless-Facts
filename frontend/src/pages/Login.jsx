import { useRef } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";

export default function Login() {
    const navigate = useNavigate();

    const emailRef = useRef();
    const passwordRef = useRef();

    async function submitHandler(e) {
        e.preventDefault();

        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if(!email) {

        }

        if(!password) {

        }

        // make request
    }

    return <div>
        <Navbar />
        <div className={styles.flexContainer}>
            <form onSubmit={submitHandler} className={styles.container}>
                <h1>Login</h1>
                <div className={styles.inputContainer}>
                    <label>Email:</label>
                    <input ref={emailRef} /><br></br>
                </div>

                <div className={styles.inputContainer}>
                    <label>Password:</label>
                    <input ref={passwordRef} type="password" /><br></br>
                </div>

                <div className={styles.centerContainer}>
                    <a onClick={() => navigate("/register")}>New User? Register</a><br></br>
                    <button>Login</button>
                </div>
            </form>
        </div>
    </div>   
}