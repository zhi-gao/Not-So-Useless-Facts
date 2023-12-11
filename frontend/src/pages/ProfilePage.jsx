import { useParams } from 'react-router-dom';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const { username } = useParams();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Profile: {username}</h1>
                <div className={styles.buttons}>
                    <button>Comments</button>
                    <button>Upvoted Facts</button>
                    <button>Downvoted Facts</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
