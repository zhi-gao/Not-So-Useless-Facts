import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useContext, useEffect, useState } from 'react';
import { getFactCommentsRequest } from "../requests/getFactCommentsRequest";
import { getUpvoteFactRequest } from "../requests/getUpvoteFactRequest";
import { getDownvoteFactRequest } from "../requests/getDownvoteFactRequest";
import { getUsernameRequest } from "../requests/getUsernameRequest";
import Navbar from '../components/Nabar';
import { UserContext } from "../context/UserContext";
import { authRequest } from "../requests/authRequest";
import { logoutRequest } from "../requests/logoutRequest";

const ProfilePage = () => {
    const { username } = useParams();
    const [facts, setFacts] = useState([]);
    const [activeTab, setActiveTab] = useState('comments');
    const [userName, setUserName] = useState('');
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
                    console.log(data);
                    setIsUserLoggedIn(true);
                } catch (err) {
                    console.log(err);
                }
            }
        }
        
        async function fetchUserName() {
            try {
                const userData = await getUsernameRequest(username);
                setUserName(userData);
            } catch (error) {
                console.error(`Error fetching username for ${username}:`, error);
            }
        }
        
        // Fetch comments for the user initially
        async function helper() {
            await fetchUserName();
            await fetchData("comments");
            await auth();
        }

        helper();
    }, [username]);

    // Function to fetch facts based on the selected tab
    const fetchData = async (tab) => {
        let data;
        switch (tab) {
            case 'comments':
                data = await getFactCommentsRequest(username);
                console.log("comment data: ", data)
                break;
            case 'upvoted':
                data = await getUpvoteFactRequest(username);
                console.log("upvote data: ", data)
                break;
            case 'downvoted':
                data = await getDownvoteFactRequest(username);
                break;
            default:
                data = [];
                break;
        }
        setFacts(data);
    };

    async function logoutHandler() {
        console.log("user logout...")
        try {
            await logoutRequest(currentUser.email);
            localStorage.removeItem("token");
            setCurrentUser({});
            navigate("/login");
        } catch (err) {
            console.error(err);
        }
    }

    // Function to handle tab changes
    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        fetchData(tab);
    };

    return (
        <div>
            {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Home" secondaryButtonOnClick={() => navigate("/")}thirdButton="Past Facts" thirdButtonOnClick={() => navigate("/all-facts")} /> : <Navbar primaryButton="Home" primaryButtonOnClick={() => navigate("/")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="Logout" thirdButtonOnClick={() => logoutHandler()} />}
            <div className={styles.container}>
                <div>
                    <h1>Profile: {userName}</h1>
                    <hr />
                    <div className={styles.buttons}>
                        <button onClick={() => handleTabChange('comments')}>Comments</button>
                        <button onClick={() => handleTabChange('upvoted')}>Upvoted Facts</button>
                        <button onClick={() => handleTabChange('downvoted')}>Downvoted Facts</button>
                    </div>

                    {/* Facts section based on active tab */}
                    <div className={styles.content}>
                        {facts.map((fact, index) => (
                            <div key={index}>
                                {/* Display facts based on the active tab */}
                                {activeTab === 'comments' && (
                                    <p><strong>{userName}</strong> commented on <strong>Fact</strong> {new Date(fact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: {fact.comment}</p>
                                )}
                                {activeTab === 'upvoted' && (
                                    <p><strong>{userName}</strong> upvoted on <strong>Fact</strong>: {fact.fact}</p>
                                )}
                                {activeTab === 'downvoted' && (
                                    <p><strong>{userName}</strong> downvoted on <strong>Fact</strong>: {fact.fact}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;
