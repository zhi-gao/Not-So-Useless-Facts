import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '../components/Nabar';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { logoutRequest } from '../requests/logoutRequest';
import styles from "./Home.module.css";
import { authRequest } from '../requests/authRequest';
import { useNavigate } from 'react-router-dom';

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
                    console.log(data);
                    setIsUserLoggedIn(true);
                } catch (err) {
                    console.log(err);
                }
            }
        }

        auth();
    }, []);

    return <div>
        {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="Home" thirdButtonOnClick={() => navigate("/")} /> :  <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate(`/profile/${currentUser.user_id}`)} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="Home" thirdButtonOnClick={() => navigate("/")} />}
        <div className={styles.flexContainer}>
            <div className={styles.factTitle}>About</div>
            <div className={styles.factContent}>
                Not So Useless Fact is a full stack web application that was build on the purpose of providing users with a random fact everyday. We hope that with this program will help you learn something new everyday. 
            </div>

            <div>
                <FontAwesomeIcon  />
            </div>
        </div>

    </div> 
}