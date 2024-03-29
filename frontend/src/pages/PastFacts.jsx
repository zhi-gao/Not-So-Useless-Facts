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
import { factUpvoteRequest } from "../requests/factUpvoteRequest";
import { factDownvoteRequest } from "../requests/factDownvoteRequest";
import { commentUpvoteRequest } from "../requests/commentUpvoteRequest";
import { commentDownvoteRequest } from "../requests/commentDownvoteRequest";
import { postCommentRequest } from "../requests/postCommentRequest";
import { getFactCommentsRequest } from "../requests/getFactCommentsRequest";
import { getUsernameRequest } from "../requests/getUsernameRequest";
import loadingStyles from "./Loading.module.css";
import {errMsg} from "./UserLogin.module.css";

export default function PastFacts() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [factComments, setFactComments] = useState({});
    const [isFactFlagged, setIsFactFlagged] = useState(false);
    const [showFactReportModal, setShowFactReportModal] = useState(false);
    const [isUserFlagged, setIsUserFlagged] = useState(false);
    const [showUserReportModal, setShowUserReportModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const portalContainerRef = useRef(null);
    const [pastFacts, setPastFacts] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [sortBy, setSortBy] = useState('latest');
    const [selectedFactId, setSelectedFactId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

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

        {/** Fetch past facts */}
        async function fetchPastFacts() {
            try {
                const response = await fetch('http://localhost:4000/facts');
                if (response.ok) {
                    let data = await response.json();
                    const options = { timeZone: 'UTC' };
                
                    // Filter out the latest fact for the current day
                    const today = new Date().toLocaleDateString('en-US', options);
                    data = data.filter((fact) => {
                        const factDate = new Date(fact.createdAt).toLocaleDateString('en-US', options);
                        return factDate !== today;
                    });
                    
                    // Update each fact with comments from the fetched JSON
                    const updatedFacts = await Promise.all(data.map(async fact => {
                        const factComments = await getFactCommentsRequest(fact._id);
                        const commentsWithUsernames = await Promise.all(factComments.map(async comment => {
                            const user = await getUsernameRequest(comment.userId);
                            return {
                                ...comment,
                                userId: comment.userId,
                                userName: user,
                                comment: comment.comment
                            };
                        }));
                        return {
                            ...fact,
                            comments: commentsWithUsernames
                        };
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
                            updatedFacts.sort((a, b) => b.totalUpvotes - a.totalUpvotes);
                            break;
                        case 'most_downvoted':
                            // Sorting by most downvoted
                            updatedFacts.sort((a, b) => b.totalDownvotes - a.totalDownvotes);
                            break;
                        case 'most_commented':
                            // Sorting by most commented
                            updatedFacts.sort((a, b) => b.comments.length - a.comments.length);
                            break;
                        default:
                            break;
                    }
    
                    setPastFacts(updatedFacts);
                } else {
                    setErrorMessage("Internal server occured");
                }
            } catch (error) {
                setErrorMessage("Internal server occured");
            }
        }

        async function helper() {
            await fetchPastFacts();
            await auth();
            setLoading(false);
        }

        helper();
    }, [sortBy]);

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    async function factUpvoteHandler(factId) {
        if(!factId) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedFact = await factUpvoteRequest(factId, currentUser.user_id);
            const updatedFacts = pastFacts.map(fact => {
                if (fact._id === factId) {
                    return {
                        ...fact,
                        totalUpvotes: updatedFact.totalUpvotes,
                        totalDownvotes: updatedFact.totalDownvotes
                    };
                }
                return fact;
            });
            setPastFacts(updatedFacts);
        } catch(err) {
            setErrorMessage("Cannot upvote fact, internal server error");
        }
    }

    async function factDownvoteHandler(factId) {
        if(!factId) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedFact = await factDownvoteRequest(factId, currentUser.user_id);
            const updatedFacts = pastFacts.map(fact => {
                if (fact._id === factId) {
                    return {
                        ...fact,
                        totalUpvotes: updatedFact.totalUpvotes,
                        totalDownvotes: updatedFact.totalDownvotes
                    };
                }
                return fact;
            });
            setPastFacts(updatedFacts);
        } catch (err) {
            setErrorMessage("Cannot downvote fact, internal server error");
        }
    }

    async function commentUpvoteHandler(comment) {
        if(!comment) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedComment = await commentUpvoteRequest(comment._id, currentUser.user_id);
            const updatedFacts = pastFacts.map(fact => {
                if (fact._id === updatedComment.factId) {
                    const updatedComments = fact.comments.map(comment => {
                        if (comment._id === updatedComment._id) {
                            return {
                                ...comment,
                                totalUpvotes: updatedComment.totalUpvotes,
                                totalDownvotes: updatedComment.totalDownvotes
                            };
                        }
                        return comment;
                    });
            
                    return {
                        ...fact,
                        comments: updatedComments
                    };
                }
                return fact;
            });

            setPastFacts(updatedFacts)
        } catch(err) {
            setErrorMessage("Cannot upvote comment, internal server error");
        }
    }

    async function commentDownvoteHandler(comment) {
        if(!comment) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedComment = await commentDownvoteRequest(comment._id, currentUser.user_id);
            const updatedFacts = pastFacts.map(fact => {
                if (fact._id === updatedComment.factId) {
                    const updatedComments = fact.comments.map(comment => {
                        if (comment._id === updatedComment._id) {
                            return {
                                ...comment,
                                totalUpvotes: updatedComment.totalUpvotes,
                                totalDownvotes: updatedComment.totalDownvotes
                            };
                        }
                        return comment;
                    });
            
                    return {
                        ...fact,
                        comments: updatedComments
                    };
                }
                return fact;
            });

            setPastFacts(updatedFacts)
        } catch (err) {
            setErrorMessage("Cannot downvote comment, internal server error");
        }
    }

    const handleCommentSubmit = async (factId) => {
        if (newComment === "") return;
    
        if (JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }
    
        try {
            const res = await postCommentRequest(factId, currentUser.user_id, newComment);
    
            const updatedFacts = pastFacts.map(fact => {
                if (fact._id === res.factId) {
                    res.userName = currentUser.username;
                    fact.comments.push(res);
                }
                return fact;
            });
    
            setPastFacts(updatedFacts);
        } catch (err) {
            setErrorMessage("Cannot post comment, internal server error");
        }
    };
    
    const handleFactFlagClick = (factId) => {
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        setSelectedFactId(factId);
        setIsFactFlagged(true);
        setShowFactReportModal(true);
    };

    const handleCloseFactReportModal = () => {
        setIsFactFlagged(false);
        setShowFactReportModal(false);
    };

    const handleUserFlagClick = (userId) => {
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }
        
        setSelectedUserId(userId);
        setIsUserFlagged(true);
        setShowUserReportModal(true);
    };

    const handleCloseUserReportModal = () => {
        setIsUserFlagged(false);
        setShowUserReportModal(false);
    };

    const handleShowComments = (factId) => {
        setFactComments((prevComments) => ({
            ...prevComments,
            [factId]: !prevComments[factId],
        }));
    };

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
    };

    if(loading) {
        return <div className={loadingStyles.ldsRing}><div></div><div></div><div></div><div></div></div>
    }

    return (
            <div>
            {(showLoginModal || showUserReportModal || showFactReportModal) && <div className={styles.backdrop}></div>}
            {showLoginModal && <dialog open className={styles.loginDialog}>
                <p>You have to login in order to perform this action</p>
                <form method="dialog">  
                    <button onClick={() => setShowLoginModal(false)}>OK</button>
                    <button onClick={() => navigate("/login")}>Login</button>
                </form>
            </dialog>}
            {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Home" secondaryButtonOnClick={() => navigate("/")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> : <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate(`/profile/${currentUser.user_id}`)} secondaryButton="Home" secondaryButtonOnClick={() => navigate("/")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />}
            <div className={styles.flexContainer}>
                {errorMessage && <div className={errMsg}>{errorMessage}</div>}
                <div>
                <div className={styles.factTitle}>Past Facts</div>
                    {/** Sort Facts */}
                    
                    <div className={styles.sortRow}>
                        <label>
                            <strong>Sort by:</strong>
                            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="most_upvoted">Most Upvoted</option>
                                <option value="most_downvoted">Most Downvoted</option>
                                <option value="most_commented">Most Commented</option>
                            </select>
                        </label>
                    </div>
                    

                    {/** Past Facts */}
                    {pastFacts.map((fact) => (
                        <div key={fact._id} className={styles.factContent}>
                            <div className={styles.factSection}>
                            <div style={{fontSize : "20px"}}>Date: {new Date(fact.createdAt).toDateString()}</div>
                                Did you know: {fact.fact}
                                
                                <div className={styles.iconsRow}>
                                    {/** Upvote Fact Button */}
                                    <FontAwesomeIcon icon={faAnglesUp} onClick={() => factUpvoteHandler(fact._id)} />
                                    <span>{fact.totalUpvotes}</span>

                                    {/** Downvote Fact Button */}
                                    <FontAwesomeIcon icon={faAnglesDown} onClick={() => factDownvoteHandler(fact._id)} />
                                    <span>{fact.totalDownvotes}</span>

                                    {/** Comment Fact Button */}
                                    <FontAwesomeIcon icon={faCommentDots} onClick={() => handleShowComments(fact._id)} />
                                    <span>{fact.comments.length}</span>

                                    {/** Flag Fact Button */}
                                    <FontAwesomeIcon icon={faExclamationTriangle} onClick={() => handleFactFlagClick(fact._id)} />
                                    <span>{isFactFlagged}Flag</span>
                                </div>
                            </div>
                            {/** Comments */}
                            {factComments[fact._id] && (
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
                                        <button onClick={() => handleCommentSubmit(fact._id)}>Submit</button>
                                    </div>

                                    {/** Show comments */}
                                    <div><strong><h2>Comments</h2></strong></div>
                                    <div className={styles.comment}>
                                        {fact.comments.map((comment, index) => (
                                            <div key={index}>
                                                <div>
                                                    <strong>
                                                        <a href="#" onClick={() => handleUserClick(comment.userId)}>
                                                            {comment.userName}
                                                        </a>
                                                    </strong>: {comment.comment}
                                                </div>
                                                <div className={styles.iconsContainer}>
                                                    {/** Upvote Comment Button */}
                                                    <FontAwesomeIcon icon={faAnglesUp} onClick={() => commentUpvoteHandler(comment)} />
                                                    <span>{comment.totalUpvotes}</span>

                                                    {/** Downvote Comment Button */}
                                                    <FontAwesomeIcon icon={faAnglesDown} onClick={() => commentDownvoteHandler(comment)} />
                                                    <span>{comment.totalDownvotes}</span>

                                                    {/** Flag User Button */}
                                                    <FontAwesomeIcon icon={faExclamationTriangle} onClick={() => handleUserFlagClick(comment.userId)} />
                                                    <span>{isUserFlagged}Flag</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/** Portal for Fact Report Modal */}
                    {showFactReportModal && portalContainerRef.current && (
                            <FactReportModal onClose={handleCloseFactReportModal}
                            currentUserId={currentUser.user_id} reportFactId={selectedFactId} />
                    )}

                    {/** Portal for User Report Modal */}
                    {showUserReportModal && portalContainerRef.current && (
                            <UserReportModal onClose={handleCloseUserReportModal}
                            currentUserId={currentUser.user_id} reportUserId={selectedUserId} />
                    )}

                    {/**  Portal container */}
                    <div ref={portalContainerRef}></div>
                </div>
            </div>
        </div>
    );
}
