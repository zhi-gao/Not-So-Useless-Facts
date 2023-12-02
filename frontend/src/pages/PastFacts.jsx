import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nabar";
import styles from "./Home.module.css";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCommentDots, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import FactReportModal from "../components/FactReportModal";
import UserReportModal from "../components/UserReportModal";

export default function PastFacts() {
    const navigate = useNavigate();
    const [pastFacts, setPastFacts] = useState([]);
    const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'oldest'
    const portalContainerRef = useRef(null);
    const [newComment, setNewComment] = useState("");
    const [factComments, setFactComments] = useState({});
    const [isFactFlagged, setIsFactFlagged] = useState(false);
    const [showFactReportModal, setShowFactReportModal] = useState(false);
    const [isUserFlagged, setIsUserFlagged] = useState(false);
    const [showUserReportModal, setShowUserReportModal] = useState(false);

    useEffect(() => {
        async function fetchPastFacts() {
            try {
                const response = await fetch('http://localhost:4000/facts');
                if (response.ok) {
                    let data = await response.json();
                
                    // Filter out the latest fact for the current day
                    const today = new Date().toLocaleDateString();
                    data = data.filter((fact) => {
                        const factDate = new Date(fact.createdAt).toLocaleDateString();
                        return factDate !== today;
                    });
    
                    if (sortBy === 'latest') {
                        data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    } else if (sortBy === 'oldest') {
                        data = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    }
                    
                    data = data.map((fact) => ({
                        ...fact,
                        upvotes: 0,
                        downvotes: 0,
                        comments: [],
                        isFactFlagged: false,
                        isUserFlagged: false,
                    }));
    
                    setPastFacts(data);
                } else {
                    console.error('Failed to fetch past facts');
                }
            } catch (error) {
                console.error('Error fetching past facts:', error);
            }
        }
        fetchPastFacts();
    }, [sortBy]);

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    const handleUpvote = (factId) => {
        setPastFacts((prevFacts) =>
            prevFacts.map((fact) =>
                fact._id === factId ? { ...fact, upvotes: fact.upvotes + 1 } : fact
            )
        );
    };

    const handleDownvote = (factId) => {
        setPastFacts((prevFacts) =>
            prevFacts.map((fact) =>
                fact._id === factId ? { ...fact, downvotes: fact.downvotes + 1 } : fact
            )
        );
    };

    const handleCommentSubmit = (factId) => {
        setPastFacts((prevFacts) =>
            prevFacts.map((fact) =>
                fact._id === factId
                    ? {
                          ...fact,
                          comments: [
                              ...fact.comments,

                          ],
                      }
                    : fact
            )
        );
        setNewComment("");
    };

    const handleFactFlagClick = (factId) => {
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

    const handleToggleComments = (factId) => {
        setFactComments((prevComments) => ({
            ...prevComments,
            [factId]: !prevComments[factId],
        }));
    };

    return (
        <div>
            <Navbar
                primaryButton="Login"
                primaryButtonOnClick={() => navigate('/login')}
                secondaryButton="Home"
                secondaryButtonOnClick={() => navigate('/')}
                thirdButton="About Us" 
                thirdButtonOnClick={() => navigate("/about")} 
            />

            <div className={styles.flexContainer}>
                <div className={styles.factsContainer}>
                    <h1>Past Facts</h1>

                    <div className={styles.sortOptions}>
                        <label>
                            Sort by:
                            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </label>
                    </div>

                    {pastFacts.map((fact) => (
                        <div key={fact._id} className={styles.fact}>
                            Did you know: {fact.fact}
                            
                            <div>
                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => handleUpvote(fact._id)} />
                                <span>{fact.upvotes}</span>

                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => handleDownvote(fact._id)} />
                                <span>{fact.downvotes}</span>

                                <FontAwesomeIcon icon={faCommentDots} onClick={() => handleToggleComments(fact._id)} />
                                <span>{fact.comments.length}</span>

                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={() => handleFactFlagClick(fact._id)} />
                                <span>{isFactFlagged}</span>
                            </div>

                            {factComments[fact._id] && (
                                <div className={styles.commentsContainer}>
                                    <div>
                                        <textarea
                                            rows="4"
                                            cols="150"
                                            placeholder="Enter your comment here.."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button onClick={() => handleCommentSubmit(fact._id)}>Submit</button>
                                    </div>

                                    {fact.comments.map((comment, index) => (
                                        <div key={index}>
                                            <div>
                                                <strong>{comment.username}:</strong> {comment.content}
                                            </div>
                                            <div>
                                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => {}} />
                                                <span>{comment.upvotes}</span>

                                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => {}} />
                                                <span>{comment.downvotes}</span>

                                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleUserFlagClick} />
                                                <span>{isUserFlagged}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

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
        </div>
    );
}
