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
import { factDownvoteRequest } from "../requests/factDownvoteRequest";
import { commentUpvoteRequest } from "../requests/commentUpvoteRequest";
import { commentDownvoteRequest } from "../requests/commentDownvoteRequest";
import { postCommentRequest } from "../requests/postCommentRequest";
import { getFactCommentsRequest } from "../requests/getFactCommentsRequest";
import { getUsernameRequest } from "../requests/getUsernameRequest";
import { logoutRequest } from "../requests/logoutRequest";

export default function Home() {
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [factUpvotes, setFactUpvotes] = useState(0);
    const [factDownvotes, setFactDownvotes] = useState(0);
    const [commentUpvotes, setCommentUpvotes] = useState(0);
    const [commentDownvotes, setCommentDownvotes] = useState(0);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [isFactFlagged, setIsFactFlagged] = useState(false);
    const [showFactReportModal, setShowFactReportModal] = useState(false);
    const [isUserFlagged, setIsUserFlagged] = useState(false);
    const [showUserReportModal, setShowUserReportModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const portalContainerRef = useRef(null);
    const [fact, setFact] = useState({});
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

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

        {/** Fetch today's fact */}
        async function fetchFact() {
            try {
                const response = await axios.get("http://localhost:4000/facts/today");
                const data = response.data;

                // Update the state with fetched upvote, downvote and comment counts
                setFactUpvotes(data.fact.totalUpvotes);
                setFactDownvotes(data.fact.totalDownvotes);
                setComments(data.fact.comments);

                setFact(data.fact);
            } catch (error) {
                console.error("Error fetching fact:", error);
            }
        }

        async function helper() {
            await fetchFact();
            await auth();

            setLoading(false);
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

    const handleCommentSubmit = async () => {
        if(newComment === "") return;

        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const res = await postCommentRequest(fact._id, currentUser.user_id, newComment);
            console.log(res);
            console.log(comments);
        } catch (err) {
            console.log(err);
        }
    }
    
    async function updateCommentsWithUsername(commentsData) {
        const updatedCommentsData = [];
        for (const comment of commentsData) {
            try {
                const userData = await getUsernameRequest(comment.userId);
                const updatedComment = { ...comment, userName: userData };
                updatedCommentsData.push(updatedComment);
            } catch (error) {
                console.error(`Error fetching username for userId ${comment.userId}:`, error);
                updatedCommentsData.push(comment);
            }
        }
        setComments(updatedCommentsData) 
    }

    const handleShowComments = async () => {
        if (!fact || !fact._id) return;

        setShowComments(!showComments);
        if (!showComments) {
            const commentsData = await getFactCommentsRequest(fact._id);
            await updateCommentsWithUsername(commentsData);      
        }
    };

    async function factUpvoteHandler(fact) {
        if(!fact) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedFact = await factUpvoteRequest(fact._id, currentUser.user_id);
            setFactUpvotes(updatedFact.totalUpvotes);
            setFactDownvotes(updatedFact.totalDownvotes);
            setFact(updatedFact);
            console.log(updatedFact);
        } catch(err) {
            console.error(err);
        }
    }

    async function factDownvoteHandler(fact) {
        if(!fact) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
            const updatedFact = await factDownvoteRequest(fact._id, currentUser.user_id);
            setFactUpvotes(updatedFact.totalUpvotes);
            setFactDownvotes(updatedFact.totalDownvotes);
            setFact(updatedFact);
            console.log(updatedFact);
        } catch (err) {
            console.log(err);
        }
    }

    async function commentUpvoteHandler(comment) {
        if(!comment) return;
        if(JSON.stringify(currentUser) === "{}") {
            setShowLoginModal(true);
            return;
        }

        try {
<<<<<<< Updated upstream
            console.log("comment id:", comment._id);
=======
>>>>>>> Stashed changes
            const updatedComment = await commentUpvoteRequest(comment._id, currentUser.user_id);
            // setCommentUpvotes(updatedComment.totalUpvotes);
            // setCommentDownvotes(updatedComment.totalDownvotes);
            // setFact(updatedComment);
            console.log(updatedComment);
        } catch(err) {
            console.error(err);
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
            // setCommentUpvotes(updatedComment.totalUpvotes);
            // setCommentDownvotes(updatedComment.totalDownvotes);
            // setFact(updatedComment);
            console.log(updatedComment);
        } catch (err) {
            console.log(err);
        }
    }

    async function logoutHandler() {
        try {
            await logoutRequest(currentUser.email);
            localStorage.removeItem("token");
            setCurrentUser({});
            navigate("/login");
        } catch (err) {
            console.error(err);
        }
    }

    const handleUserClick = (id) => {
        navigate(`/profile/${id}`);
    };

    if(loading) {
        return <div>Loading...</div>
    }

    return <div>
        {(showLoginModal || showUserReportModal || showFactReportModal) && <div className={styles.backdrop}></div>}
        {showLoginModal && <dialog open className={styles.loginDialog}>
            <p>You have to login in order to perform this action</p>
            <form method="dialog">  
                <button onClick={() => setShowLoginModal(false)}>OK</button>
                <button onClick={() => navigate("/login")}>Login</button>
            </form>
        </dialog>}
        {!isUserLoggedIn ? <Navbar primaryButton="Login" primaryButtonOnClick={() => navigate("/login")} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} /> :  <Navbar primaryButton="Profile" primaryButtonOnClick={() => navigate(`/profile/${currentUser.user_id}`)} secondaryButton="Past Facts" secondaryButtonOnClick={() => navigate("/all-facts")}thirdButton="About Us" thirdButtonOnClick={() => navigate("/about")} />}
        {/** Fact */}
        <div className={`${styles.flexContainer} ${styles.factSection}`}>
            <div>
                <div className={styles.factTitle}>Fact of the Day #1</div>
                <div className={styles.factContent}>
                    {fact.fact}
                </div>
                <div className={styles.iconsRow}>
                    {/** Upvote Fact Button */}
                    <FontAwesomeIcon icon={faAnglesUp} onClick={() => factUpvoteHandler(fact)} />
                    <span>{factUpvotes}</span>

                    {/** Downvote Fact Button */}
                    <FontAwesomeIcon icon={faAnglesDown} onClick={() => factDownvoteHandler(fact)} />
                    <span>{factDownvotes}</span>

                    {/** Comment Fact Button */}
                    <FontAwesomeIcon icon={faCommentDots} onClick={handleShowComments} />
                    <span>{comments.length}</span>

                    {/** Flag Fact Button */}
                    <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleFactFlagClick} />
                    <span>{isFactFlagged}Flag</span>
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
                                <strong>
                                    <a href="#" onClick={() => handleUserClick(comment.userId)}>
                                        {(comment.userName)}
                                    </a>
                                </strong>: {comment.comment}
                            </div>
                            <div className={styles.iconsContainer}>
                                {/** Upvote Comment Button */}
                                <FontAwesomeIcon icon={faAnglesUp} onClick={() => commentUpvoteHandler(comment)} />
                                <span>{comment.totalUpvotes}</span>

                                {/** Downvote Comment Button */}
                                <FontAwesomeIcon icon={faAnglesDown} onClick={() => commentDownvoteHandler(comment)}  />
                                <span>{comment.totalDownvotes}</span>

                                {/** Flag User Button */}
                                <FontAwesomeIcon icon={faExclamationTriangle} onClick={handleUserFlagClick} />
                                <span>{isUserFlagged}Flag</span>
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