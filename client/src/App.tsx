import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ContactVet from "./pages/ContactVet";
import UpdateMedical from "./pages/UpdateMedical";
import LiveChat from "./pages/LiveChat";
import Forum from "./pages/Forum";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact-vet" element={<ContactVet />} />
        <Route path="/update-medical" element={<UpdateMedical />} />
        <Route path="/live-chat" element={<LiveChat />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </Router>
  );
}

export default App;
