import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/App.css";

import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ErrorPage from "./pages/ErrorPage";
// import Footer from "./components/Footer";

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div id="page-layout">
            <div>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  {/* <Route path="/users/" element={<ProtectedRoute element={<UserPage />} />} /> */}
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
              </main>
            </div>
            {/* <Footer /> */}
          </div>
        </Router>
      </AuthProvider>

    </>
  )
}

export default App
