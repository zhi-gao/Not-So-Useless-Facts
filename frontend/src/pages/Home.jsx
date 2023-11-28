import { useNavigate } from "react-router-dom"
import Navbar from "../components/Nabar";
import styles from "./Home.module.css"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { authRequest } from "../requests/authRequest";

export default function Home() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        const auth = async () => {
            if(!localStorage.getItem("token")) {
                return;
            }

            if(JSON.stringify(currentUser) === "{}") {
                try {
                    // make auth request
                    const data = await authRequest();
                    setCurrentUser(data);
                    setIsUserLoggedIn(true);
                } catch (err) {
                    console.log(err);
                }
            }
        }
        auth();
    }, []);

    return <div>
        {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> :  <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate("/profile")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />}
        

        <div className={styles.flexContainer}>
            <div id={styles.fotd}>
                <div><strong>Fact of the Day #1</strong></div>
                <div>
                    No matter how hard you try, there will always be an asian smarter than you
                </div>
            </div>
        </div>
    </div>
}