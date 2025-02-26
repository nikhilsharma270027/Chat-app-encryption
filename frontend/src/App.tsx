import { createContext, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserAuthForm from "./pages/UserAuthForm";
import './index.css'
// import './output.css '
import './App.css'
import { lookInSession } from "./common/session";
import ChatPage from "./pages/ChatPage";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    // let themeInSession = lookInSession("theme")
    // console.log("App ", userInSession)
    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null }) 

    
    
}, [])

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />

          <Route path="/signin" element={<UserAuthForm type="sign-in"/>}/>
                <Route path="/signup" element={<UserAuthForm type="sign-up"/>}/>
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export default App;
