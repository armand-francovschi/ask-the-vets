import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ContactVet from "./pages/ContactVet.tsx";
import UpdateMedical from "./pages/UpdateMedical";
import Forum from "./pages/Forum";
import ForumTopics from "./pages/ForumTopics";
import ForumArticleView from "./pages/ForumArticleView";
import DoctorSchedule from "./pages/DoctorSchedule";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Navbar from "./components/Navbar/Navbar";
import LiveChatPopup from "./components/LiveChat/LiveChatPopup";
import ChatLauncher from "./components/LiveChat/ChatLauncher";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import TextChat from "./components/ContactVet/TextChat";
import MedicalAnalysis from "./components/ContactVet/MedicalAnalysis";
import VideoCall from "./components/ContactVet/VideoCall";

function GlobalRouteAnimator() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const root = document.getElementById("route-content");
    if (!root) return;

    const selector = [
      "h1",
      "h2",
      "h3",
      "p",
      "button",
      "a",
      "input",
      "select",
      "textarea",
      "label",
      "img",
      "li",
      ".rounded",
      ".shadow",
      "section",
      "article",
    ].join(",");

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).slice(0, 140);

    items.forEach((item, index) => {
      item.classList.remove("global-reveal-item");
      item.style.setProperty("--global-reveal-delay", `${Math.min(index * 16, 480)}ms`);
      void item.offsetWidth;
      item.classList.add("global-reveal-item");
    });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <Navbar />
      <GlobalRouteAnimator />
      <div id="route-content" className="md:pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact-vet" element={<ContactVet />} />
          <Route path="/contact-vet/medical-analysis" element={<MedicalAnalysis />} />
          <Route path="/contact-vet/chat" element={<TextChat />} />
          <Route path="/contact-vet/video" element={<VideoCall />} />
          <Route path="/update-medical" element={<UpdateMedical />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/topics" element={<ForumTopics />} />
          <Route path="/forum/:slug" element={<ForumArticleView />} />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
        </Routes>
      </div>
      <ChatLauncher />
      <LiveChatPopup />
    </>
  );
}

export default App;
