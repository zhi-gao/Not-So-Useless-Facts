import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nabar";
import styles from "./Home.module.css"
import axios from "axios";
import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { authRequest } from "../requests/authRequest";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCommentDots, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import FactReportModal from "../components/FactReportModal";
import UserReportModal from "../components/UserReportModal";
import { factUpvoteRequest } from "../requests/factUpvoteRequest";

export default function Home() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [isFactFlagged, setIsFactFlagged] = useState(false);
    const [showFactReportModal, setShowFactReportModal] = useState(false);
    const [isUserFlagged, setIsUserFlagged] = useState(false);
    const [showUserReportModal, setShowUserReportModal] = useState(false);
    const portalContainerRef = useRef(null);
    // Comment data
    const comments = [
        { username: "GeniusJoe88", 
          content: "This fact is intriguing, showcasing the diverse talents and wisdom within the Asian community. It's essential to encourage and respect the unique abilities of every individual.",
          upvotes: 5,
          downvotes: 2},
        { username: "SmartyPants23", 
          content: "This serves as a reminder to respect intelligence irrespective of racial boundaries. Let's strive together to create a more inclusive and equitable society.",
          upvotes: 3,
          downvotes: 1 },
        { username: "IQMaster99", 
          content: "This fact reflects the rich intelligence found across different cultures and ethnicities. Let's cherish and collectively embrace the valuable richness brought by this diversity.",
          upvotes: 4,
          downvotes: 2 },
        { username: "BrainyBella", 
          content: "This fact is inspiring, reminding us that intelligence and talent know no racial bounds. Let's work together to foster equality and diverse growth.",
          upvotes: 2,
          downvotes: 0 },
        { username: "EinsteinWannabe", 
          content: "This fact is invigorating as it showcases the abundant intelligence across diverse backgrounds globally. Let's learn from each other and progress together.",
          upvotes: 0,
          downvotes: 0 },
    ];
    
    {/** Fetch today's fact */}
    const [fact, setFact] = useState({});
    const [newComment, setNewComment] = useState("");

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

        async function fetchFact() {
            try {
                const response = await axios.get("http://localhost:4000/facts/today");
                const data = response.data;
                setFact(data.fact);
            } catch (error) {
                console.error("Error fetching fact:", error);
            }
        }

        async function helper() {
            await fetchFact();
            await auth();
        }
        
        helper();
    }, []);

    const handleFactFlagClick = () => {
        setIsFactFlagged(true);
        setShowFactReportModal(true);
    };

    const handleCloseFactReportModal = () => {
        setIsFactFlagged(false);
        setShowFactReportModal(false);
    };

    const handleUserFlagClick = () => {
        setIsUserFlagged(true);
        setShowUserReportModal(true);
    };

    const handleCloseUserReportModal = () => {
        setIsUserFlagged(false);
        setShowUserReportModal(false);
    };

    const handleCommentSubmit = () => {
        console.log("New Comment:", newComment);

        setNewComment("");
    };

    async function factUpvoteHandler(fact) {
        if(!fact) return;
        if(JSON.stringify(currentUser) === "{}") {
            console.log(`please sign in`);
            return;
        }

        console.log(currentUser);
        try {
            const updatedFact = await factUpvoteRequest(fact._id, currentUser.id);
            console.log(updatedFact);
        } catch(err) {
            console.error(err);
        }
    }

    return <div>
        {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> :  <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate("/profile")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />}
        {/** Fact */}
        <div className={styles.flexContainer}>
            <div id={styles.fotd}>
                <div><strong>Fact of the Day #1</strong></div>
                <div>
                    {fact.fact}
                </div>
                <div>
                    {/** Upvote Fact Button */}
                    <FontAwesomeIcon icon={faAnglesUp} onClick={() => factUpvoteHandler(fact)} />
                    <span>{upvotes}</span>

                    {/** Downvote Fact Button */}
                    <FontAwesomeIcon icon={faAnglesDown} onClick={() => setDownvotes(downvotes + 1)} />
                    <span>{downvotes}</span>

                    {/** Comment Fact Button */}
                    <FontAwesomeIcon icon={faCommentDots} onClick={() => setShowComments(!showComments)} />
                    <span>{showComments}</span>

                    {/** Flag Fact Button */}
                    <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleFactFlagClick} />
                    <span>{isFactFlagged}</span>
                </div>
            </div>

            {/** Comments */}
            {showComments && (
                <div className={styles.commentsContainer}>
                    {/** Add a new comment */}
                    <div>
                        <textarea
                            rows="4"
                            cols="150"
                            placeholder="Enter your comment here.."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button onClick={handleCommentSubmit}>Submit</button>
                    </div>

                    {/** Show comments */}
                    <div><strong><h2>Comments</h2></strong></div>
                    {comments.map((comment, index) => (
                        <div key={index}>
                            <div>
                                <strong>{comment.username}:</strong> {comment.content}
                            </div>
                            <div className={styles.iconsContainer}>
                                {/** Upvote Comment Button */}
                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => {comment.upvotesotes}} />
                                <span>{comment.upvotes}</span>

                                {/** Downvote Comment Button */}
                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => {comment.downvotes}} />
                                <span>{comment.downvotes}</span>

                                {/** Flag User Button */}
                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleUserFlagClick} />
                                <span>{isUserFlagged}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/** Portal for Fact Report Modal */}
            {showFactReportModal && portalContainerRef.current && (
                    <FactReportModal onClose={handleCloseFactReportModal} />
            )}

            {/** Portal for User Report Modal */}
            {showUserReportModal && portalContainerRef.current && (
                    <UserReportModal onClose={handleCloseUserReportModal} />
            )}

            {/**  Portal container */}
            <div ref={portalContainerRef}></div>
        </div>
    </div>
}