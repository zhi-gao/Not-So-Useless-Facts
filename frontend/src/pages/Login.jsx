import { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./UserLogin.module.css"
import Navbar from "../components/Nabar";
import { loginRequest } from "../requests/loginRequest";
import { UserContext } from "../context/UserContext";
import { authRequest } from "../requests/authRequest";

export default function Login() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isLoading, setLoading] = useState(true);

    const emailRef = useRef();
    const passwordRef = useRef();

    useEffect(() => {
        const auth = async () => {
            if(!localStorage.getItem("token")) {
                setLoading(false);
                return;
            }

            if(JSON.stringify(currentUser) === "{}") {
                try {
                    // make auth request
                    const data = await authRequest();
                    setCurrentUser(data);
                    navigate(`/profile/${data.user_id}`);
                } catch (err) {
                    setLoading(false);
                }
            }

            else {
                navigate(`/profile/${currentUser.user_id}`);
            }
        }

        auth();
    }, []);

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

            localStorage.setItem("token", data.accessToken);
            setCurrentUser(data);
            navigate(`/profile/${data.user_id}`);
        } catch (err) {
            const httpCode = err.response?.status;
            if(httpCode === 401) {
                setErrorMessage("Invalid email or password");
                return;
            }

            setErrorMessage("Internal Server Error");
        }
    }

    if(isLoading) {
        return <div>
            Loading...
        </div>
    }

    return <div>
        <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} 
            secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
            thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")}  />

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