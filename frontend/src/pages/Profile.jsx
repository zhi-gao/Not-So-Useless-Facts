import { useEffect, useState } from "react"
import { authRequest } from "../requests/authRequest";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = async () => {
            try {
                const data = await authRequest();

                console.log(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate("/login");
            }
        };

        auth();
    }, []);

    if(loading) {
        return <div>
            Profile loading...
        </div>
    }

    return <div>
        Profile
    </div>
}