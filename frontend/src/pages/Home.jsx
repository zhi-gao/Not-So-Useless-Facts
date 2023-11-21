import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nabar";
import styles from "./Home.module.css";
import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCommentDots, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ReportModal from "../components/ReportModal";

export default function Home() {
    const navigate = useNavigate();
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [isFlagged, setIsFlagged] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const portalContainerRef = useRef(null);

    const handleFlagClick = () => {
        setIsFlagged(true);
        setShowReportModal(true);
    };

    const handleCloseReportModal = () => {
        setIsFlagged(false);
        setShowReportModal(false);
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

            <div className={styles.flexContainer}>
                <div id={styles.fotd}>
                    <div><strong>Fact of the Day #1</strong></div>
                    <div>
                        No matter how hard you try, there will always be an Asian smarter than you
                    </div>
                    <div>
                        {/** Upvote Button */}
                        <FontAwesomeIcon icon={faAnglesUp} onClick={() => setUpvotes(upvotes + 1)} />
                        <span>{upvotes}</span>

                        {/** Downvote Button */}
                        <FontAwesomeIcon icon={faAnglesDown} onClick={() => setDownvotes(downvotes + 1)} />
                        <span>{downvotes}</span>

                        {/** Comment Button */}
                        <FontAwesomeIcon icon={faCommentDots} onClick={() => setShowComments(!showComments)} />
                        <span>{showComments}</span>

                        {/** Flag Button */}
                        <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleFlagClick} />
                        <span>{isFlagged}</span>
                    </div>
                </div>

                {/** Comments */}
                {showComments && (
                    <div className={styles.commentsContainer}>
                        <div><strong><h2>Comments</h2></strong></div>
                        {comments.map((comment, index) => (
                            <div key={index}>
                                <div>
                                    <strong>{comment.username}:</strong> {comment.content}
                                </div>
                                <div className={styles.iconsContainer}>
                                    <FontAwesomeIcon icon={faAnglesUp} onClick={() => {comment.upvotesotes}} />
                                    <span>{comment.upvotes}</span>

                                    <FontAwesomeIcon icon={faAnglesDown} onClick={() => {comment.downvotes}} />
                                    <span>{comment.downvotes}</span>

                                    <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleFlagClick} />
                                    <span>{isFlagged}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/** Portal for Report Modal */}
                {showReportModal && portalContainerRef.current && (
                        <ReportModal onClose={handleCloseReportModal} />
                )}

                {/* Portal container */}
                <div ref={portalContainerRef}></div>
            </div>
        </div>
    );
}