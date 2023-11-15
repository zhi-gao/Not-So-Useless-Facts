import { useRef } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";
import { loginRequest } from "../requests/loginRequest";

export default function Login() {
    const navigate = useNavigate();

    const emailRef = useRef();
    const passwordRef = useRef();

    async function submitHandler(e) {
        e.preventDefault();

        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if(!email) {
            console.error(`No email given`);
        }

        if(!password) {
            console.error(`No password given`);
        }

        // make request
        await loginRequest(email, password);
    }

    return <div>
        <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} 
            secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
            thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />

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