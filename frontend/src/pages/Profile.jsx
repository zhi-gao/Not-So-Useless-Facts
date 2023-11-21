import { useEffect, useState } from "react"
import { authRequest } from "../requests/authRequest";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../requests/logoutRequest";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const auth = async () => {
            try {
                const data = await authRequest();

                console.log(data);
                setUser(data);
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