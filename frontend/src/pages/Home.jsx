import { useNavigate } from "react-router-dom"
import Navbar from "../components/Nabar";
import styles from "./Home.module.css"

export default function Home() {
    const navigate = useNavigate();
    
    return <div>
        <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} 
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