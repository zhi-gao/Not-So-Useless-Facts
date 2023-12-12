import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nabar";
import styles from "./PastFacts.module.css";
import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { authRequest } from "../requests/authRequest";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesUp, faAnglesDown, faCommentDots, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import FactReportModal from "../components/FactReportModal";
import UserReportModal from "../components/UserReportModal";

export default function PastFacts() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
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
                    
                    // Update each fact with totalUpvotes and totalDownvotes from the fetched JSON
                    const updatedFacts = data.map(fact => ({
                        ...fact,
                        upvotes: fact.totalUpvotes,
                        downvotes: fact.totalDownvotes,
                        commentCount: fact.comments.length,
                    }));

                    // Sort the facts based on the selected sorting option
                    switch (sortBy) {
                        case 'latest':
                            // Sorting by latest
                            updatedFacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            break;
                        case 'oldest':
                            // Sorting by oldest
                            updatedFacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            break;
                        case 'most_upvoted':
                            // Sorting by most upvoted
                            updatedFacts.sort((a, b) => b.upvotes - a.upvotes);
                            break;
                        case 'most_downvoted':
                            // Sorting by most downvoted
                            updatedFacts.sort((a, b) => b.downvotes - a.downvotes);
                            break;
                        case 'most_commented':
                            // Sorting by most commented
                            updatedFacts.sort((a, b) => b.commentCount - a.commentCount);
                            break;
                        default:
                            break;
                    }
    
                    setPastFacts(updatedFacts);
                } else {
                    console.error('Failed to fetch past facts');
                }
            } catch (error) {
                console.error('Error fetching past facts:', error);
            }
        }

        async function helper() {
            await fetchPastFacts();
            await auth();
        }

        helper();
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

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
    };

    return (
        <div>
            {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Home" secondaryButtonOnClick={() => navigate("/")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> : <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate("/profile")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />}
            <div className={`${styles.flexContainer} ${styles.factSection}`}>
                <div>
                <div className={styles.factTitle}>Past Facts</div>

                    <div className={styles.sortRow}>
                        <label>
                            Sort by:
                            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="most_upvoted">Most Upvoted</option>
                                <option value="most_downvoted">Most Downvoted</option>
                                <option value="most_commented">Most Commented</option>
                            </select>
                        </label>
                    </div>

                    {pastFacts.map((fact) => (
                        <div key={fact._id} className={styles.factContent}>
                            Did you know: {fact.fact}
                            
                            <div className={styles.iconsRow}>
                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => handleUpvote(fact._id)} />
                                <span>{fact.upvotes}</span>

                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => handleDownvote(fact._id)} />
                                <span>{fact.downvotes}</span>

                                <FontAwesomeIcon icon={faCommentDots} onClick={() => handleToggleComments(fact._id)} />
                                <span>{fact.comments.length}</span>

                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={() => handleFactFlagClick(fact._id)} />
                                <span>{isFactFlagged}Flag</span>
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
                                                <strong>
                                                    <a href="#" onClick={() => handleUserClick(comment.username)}>
                                                        {comment.username}
                                                    </a>
                                                </strong>: {comment.content}
                                            </div>
                                            <div>
                                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => {}} />
                                                <span>{comment.upvotes}</span>

                                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => {}} />
                                                <span>{comment.downvotes}</span>

                                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleUserFlagClick} />
                                                <span>{isUserFlagged}Flag</span>
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
