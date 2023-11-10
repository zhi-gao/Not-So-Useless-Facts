import { useRef } from "react";
import { useNavigate } from "react-router-dom"

export default function Register() {
    const navigate = useNavigate();

    const formRefs = {
        username : useRef(),
        email : useRef(),
        password : useRef(),
        confirmPassword : useRef()
    }
    
    async function submitHandler(e) {
        e.preventDefault();

        const username = formRefs.username.current?.value;
        const email = formRefs.email.current?.value;
        const password = formRefs.password.current?.value;
        const confirmPassword = formRefs.confirmPassword.current?.value;

        if(!username) {

        }

        if(!email) {

        }

        if(!password) {

        }

        if(!confirmPassword) {

        }

        // make request
    }

    return <div>
        Register

        <form onSubmit={submitHandler}>
            <label>Username</label><br></br>
            <input ref={formRefs.username} /><br></br>

            <label>Email</label><br></br>
            <input ref={formRefs.email} /><br></br>

            <label>Password</label><br></br>
            <input ref={formRefs.password}/><br></br>

            <label>Confirm Password</label><br></br>
            <input ref={formRefs.confirmPassword}/><br></br>

            <a onClick={() => navigate("/login")}>Existing User? Login</a>
            <button>Register</button>


        </form>
    </div>
}