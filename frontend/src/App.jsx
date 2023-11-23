import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from "./pages/About"
import PastFacts from "./pages/PastFacts"
import Profile from "./pages/Profile"

function App() {
  return <div>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Home />}/>
        <Route exact path='/login' element={<Login />}/>
        <Route exact path='/register' element={<Register />}/>
        <Route exact path='/about' element={<About />}/>
        <Route exact path='/all-facts' element={<PastFacts />}/>
        <Route exact path='/profile' element={<Profile />}/>
      </Routes>
    </BrowserRouter>
  </div>
}

export default App
