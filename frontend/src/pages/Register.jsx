import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";
import { registerRequest } from "../requests/registerRequest";

export default function Register() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const formRefs = {
        username : useRef(),
        email : useRef(),
        password : useRef(),
        confirmPassword : useRef()
    }
    
    async function submitHandler(e) {
        e.preventDefault();
        setErrorMessage("");

        const username = formRefs.username.current?.value;
        const email = formRefs.email.current?.value;
        const password = formRefs.password.current?.value;
        const confirmPassword = formRefs.confirmPassword.current?.value;

        if(!username) {
            setErrorMessage("Username must be cannot be empty");
            return;
        }

        if(!email) {
            setErrorMessage("Email must be cannot be empty");
            return;
        }

        if(!password) {
            setErrorMessage("Password cannot be empty");
            return;
        }

        if(!confirmPassword || password !== confirmPassword) {
            setErrorMessage("Confirm password must match the password");
            return;
        }

        const emailRegex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        const passwordRegex = new RegExp("^(?=.*[0-9])(.{9,})$");

        if(!emailRegex.test(email)) {
            setErrorMessage("Email must be valid");
            return;
        }

        if(!passwordRegex.test(password)) {
            setErrorMessage("Password must have at more than 8 characters");
            return;
        }

        // make request
        try {
            await registerRequest(username, email, password);
            navigate("/login");
        } catch (err) {
            console.log(err);
            setErrorMessage("Internal Server Error")
        }
    }

    return <div>
        <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} 
                secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
                thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />
        <div className={styles.flexContainer}>
            <form onSubmit={submitHandler} className={styles.container}>
                {errorMessage && <div className={styles.errMsg}>{errorMessage}</div>}

                <h1>Register</h1>

                <div className={styles.inputContainer}>
                    <label>Username</label>
                    <input ref={formRefs.username} /><br></br>
                </div>

                <div className={styles.inputContainer}>
                    <label>Email</label>
                    <input ref={formRefs.email} type="email" /><br></br>
                </div>

                <div className={styles.inputContainer}>
                    <label>Password</label>
                    <input ref={formRefs.password} type="password"/><br></br>
                </div>

                <div className={styles.inputContainer}>
                    <label>Confirm Password</label>
                    <input ref={formRefs.confirmPassword} type="password"/><br></br>
                </div>

                <div className={styles.centerContainer}>
                    <a onClick={() => navigate("/login")}>Existing User? Login</a><br></br>
                    <button>Register</button>
                </div>
            </form>
        </div>
    </div> 
}