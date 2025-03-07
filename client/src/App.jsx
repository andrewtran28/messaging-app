import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import "./styles/App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import UserPage from "./pages/UserPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ErrorPage from "./pages/ErrorPage";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="/user/:username" element={<UserPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App
