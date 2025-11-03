import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ContactVet from "./pages/ContactVet";
import UpdateMedical from "./pages/UpdateMedical";
import LiveChat from "./pages/LiveChat";
import Forum from "./pages/Forum";
import Navbar from "./components/Navbar/Navbar";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact-vet" element={<ContactVet />} />
        <Route path="/update-medical" element={<UpdateMedical />} />
        <Route path="/live-chat" element={<LiveChat />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </>
  );
}

export default App;
