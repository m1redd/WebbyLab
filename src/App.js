import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterForm from "./components/register";
import Movies from "./components/movies";
import DnD from "./components/DnD";
import "./style.css";
import ModalNotification from "./utils/modalWindow";
import Header from "./utils/header";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="app-container">
          <DnD />
          <ModalNotification />
          <Header />
          <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/register" element={<RegisterForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
