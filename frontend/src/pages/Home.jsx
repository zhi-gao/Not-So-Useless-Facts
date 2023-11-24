import { useNavigate } from "react-router-dom"
import Navbar from "../components/Nabar";
import styles from "./Home.module.css"
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function Home() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    
    return <div>
        <Navbar primaryButton={JSON.stringify(currentUser) === "{}" ? "Login" : "Profile"} primaryButtonOnClick={JSON.stringify(currentUser) === "{}" ? () => navigate("/login") : () => navigate("/profile")} 
                secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}
                thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />

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