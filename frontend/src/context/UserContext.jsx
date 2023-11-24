import {createContext, useState} from "react";

export const UserContext = createContext({});

export function UserProvider({children}) {
    const [user, setUser] = useState({});
    
    return <UserContext.Provider value={{currentUser : user, setCurrentUser: setUser}}>
        {children}
    </UserContext.Provider>
}