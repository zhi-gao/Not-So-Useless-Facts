import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nabar";
import styles from "./Home.module.css";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCommentDots, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import FactReportModal from "../components/FactReportModal";
import UserReportModal from "../components/UserReportModal";

export default function Home() {
    const navigate = useNavigate();
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [isFactFlagged, setIsFactFlagged] = useState(false);
    const [showFactReportModal, setShowFactReportModal] = useState(false);
    const [isUserFlagged, setIsUserFlagged] = useState(false);
    const [showUserReportModal, setShowUserReportModal] = useState(false);
    const portalContainerRef = useRef(null);
    const [fact, setFact] = useState("");
    const [newComment, setNewComment] = useState("");
    
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
    useEffect(() => {
        async function fetchFact() {
            try {
                const response = await fetch("http://localhost:4000/facts/today");
                if (response.ok) {
                    const data = await response.json();
                    setFact(data.fact);
                } else {
                    console.error("Failed to fetch fact");
                }
            } catch (error) {
                console.error("Error fetching fact:", error);
            }
        }
        fetchFact();
    }, []);

    return (
        <div>
            <Navbar 
                primaryButton="Login" 
                primaryButtonOnClick={() => navigate("/login")} 
                secondaryButton="Past Facts" 
                secondaryButtonOnClick={() => navigate("/all-facts")}
                thirdButton="About Us" 
                thirdButtonOnClick={() => navigate("/about")} 
            />

            {/** Fact */}
            <div className={styles.flexContainer}>
                <div id={styles.fotd}>
                    <div><strong>Fact of the Day #1</strong></div>
                    <div>
                        {fact}
                    </div>
                    <div>
                        {/** Upvote Fact Button */}
                        <FontAwesomeIcon icon={faAnglesUp} onClick={() => setUpvotes(upvotes + 1)} />
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
    );
}