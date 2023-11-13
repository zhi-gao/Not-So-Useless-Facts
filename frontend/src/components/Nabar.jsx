import styles from "./Navbar.module.css"

export default function Navbar(props) {
    return <nav id={styles.navbar}>
        <button id={styles.thirdBtn} onClick={props.thirdButtonOnClick}>{props.thirdButton || "About Us"}</button>
        <button id={styles.secondaryBtn}onClick={props.secondaryButtonOnClick}>{props.secondaryButton || "Past Facts"}</button>
        <button id={styles.primaryBtn} onClick={props.primaryButtonOnClick}>{props.primaryButton || "Login"}</button>
    </nav>
}