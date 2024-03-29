import Navbar from '../components/Nabar';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import styles from "./Home.module.css";
import { authRequest } from '../requests/authRequest';
import { useNavigate } from 'react-router-dom';
import githubLogo from "../assets/github-mark.svg"

export default function About() {
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const navigate = useNavigate();
    
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
                }
            }

            else {
                setIsUserLoggedIn(true);
            }
        }

        auth();
    }, []);

    return <div>
        {!isUserLoggedIn ? <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> :  <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate(`/profile/${currentUser.user_id}`)} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="Home" thirdButtonOnClick={() => navigate("/")} />}
        <div className={styles.flexContainer}>
            <div className={styles.aboutTitle}>About</div>
            <div className={styles.aboutContent} style={{marginLeft : "10%", marginRight : "10%"}}>
                Not So Useless Fact is a full stack web application that was build on the purpose of providing users with a random fact everyday. We hope that with this program will help you learn something new everyday. 
            </div>

            <div className={styles.aboutTitle} style={{margin : "50px"}}>
                <img src={githubLogo}/>
            </div>
        </div>

    </div> 
}