import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from "./pages/About"
import PastFacts from "./pages/PastFacts"
import Profile from "./pages/Profile"
import ProfilePage from './pages/ProfilePage'; 
import { UserProvider } from "./context/UserContext"

function App() {
  return <div>
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Home />}/>
        <Route exact path='/login' element={<Login />}/>
        <Route exact path='/register' element={<Register />}/>
        <Route exact path='/about' element={<About />}/>
        <Route exact path='/all-facts' element={<PastFacts />}/>
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  </div>
}

export default App
