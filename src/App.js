import RegisterForm from "./components/register";
import Movies from "./components/movies";
import DnD from "./components/DnD";
import "./style.css";

function App() {
  return (
    <div className="App">
      <div className="app-container">
        <RegisterForm />
        <Movies />
        <DnD />
      </div>
    </div>
  );
}

export default App;
