import styles from "./Navbar.module.css"

export default function Navbar(props) {
    return <nav id={styles.navbar}>
        <button onClick={() => props.thirdButtonOnClick}>{props.thirdButton || "About Us"}</button>
        <button onClick={() => props.secondaryButtonOnClick}>{props.secondaryButton || "Past Facts"}</button>
        <button onClick={() => props.primaryButtonOnClick}>{props.primaryButton || "Login"}</button>
    </nav>
}