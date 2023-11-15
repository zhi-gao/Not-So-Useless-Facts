import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";
import { loginRequest } from "../requests/loginRequest";

export default function Login() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const emailRef = useRef();
    const passwordRef = useRef();

    async function submitHandler(e) {
        e.preventDefault();
        setErrorMessage("");

        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if(!email) {
            setErrorMessage("Email cannot be empty");
            return;
        }

        if(!password) {
            setErrorMessage("Password cannot be empty");
            return;
        }

        // make request
        try {
            const data = await loginRequest(email, password);

            // TODO
            // store access token, userId, and email 
        } catch (err) {
            console.error(err);
            setErrorMessage("Internal Server Error");
        }
    }

    return <div>
        <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} 
            secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
            thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />

        <div className={styles.flexContainer}>
            <form onSubmit={submitHandler} className={styles.container}>
                {errorMessage && <div className={styles.errMsg}>{errorMessage}</div>}
                <h1>Login</h1>
                <div className={styles.inputContainer}>
                    <label>Email:</label>
                    <input ref={emailRef} type="email" /><br></br>
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