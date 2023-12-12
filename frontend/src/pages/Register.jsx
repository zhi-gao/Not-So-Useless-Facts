import { useRef } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";
import { registerRequest } from "../requests/registerRequest";

export default function Register() {
    const navigate = useNavigate();

    const formRefs = {
        username : useRef(),
        email : useRef(),
        password : useRef(),
        confirmPassword : useRef()
    }
    
    async function submitHandler(e) {
        e.preventDefault();

        const username = formRefs.username.current?.value;
        const email = formRefs.email.current?.value;
        const password = formRefs.password.current?.value;
        const confirmPassword = formRefs.confirmPassword.current?.value;

        if(!username) {

        }

        if(!email) {

        }

        if(!password) {

        }

        if(!confirmPassword) {

        }

        const emailRegex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        const passwordRegex = new RegExp("^(?=.*[0-9])(.{9,})$");

        // make request
        try {
            await registerRequest(username, email, password);
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    }

    return <div>
        <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} 
                secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
                thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />
        <div className={styles.flexContainer}>
            <form onSubmit={submitHandler} className={styles.container}>
                <h1>Register</h1>

                <div className={styles.inputContainer}>
                    <label>Username</label>
                    <input ref={formRefs.username} /><br></br>
                </div>

                <div className={styles.inputContainer}>
                    <label>Email</label>
                    <input ref={formRefs.email} /><br></br>
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