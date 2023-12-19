import { useContext, useEffect, useState } from "react"
import { authRequest } from "../requests/authRequest";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../requests/logoutRequest";
import { UserContext } from "../context/UserContext";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const {currentUser, setCurrentUser} = useContext(UserContext);

    useEffect(() => {
        const auth = async () => {
            try {
                const data = await authRequest();

                setUser(data);
                setCurrentUser(user);
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate("/login");
            }
        };

        auth();
    }, []);

    async function logoutHandler(e) {
        try {
            await logoutRequest(user.email);
            localStorage.removeItem("token");
            setCurrentUser({});
            navigate("/login");
        } catch (err) {
            console.error(err);
        }
    }

    if(loading) {
        return <div>
            Profile loading...
        </div>
    }

    return <div>
        Profile
        <button onClick={logoutHandler}>Logout</button>
    </div>
}