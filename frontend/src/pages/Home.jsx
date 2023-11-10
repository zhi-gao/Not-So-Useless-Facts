import { useNavigate } from "react-router-dom"


export default function Home() {
    const navigate = useNavigate();
    
    return <div>
        Fact of the Day: No matter how hard you try, there will always be an asian smarter than you

        <div>
            <button onClick={() => navigate("/login")}>Login</button>
        </div>
    </div>
}