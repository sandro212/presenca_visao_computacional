import { useState } from "react";
import { RegisterPage } from "./pages/RegisterPage";
import { AttendancePage } from "./pages/AttendancePage";
import "./App.css";

type Page = "attendance" | "register";

function App() {
  const [page, setPage] = useState<Page>("attendance");

  return (
    <main className="app">
      <h1>Chamada Automática por Reconhecimento Facial</h1>
      <nav>
        <button
          className={page === "attendance" ? "active" : ""}
          onClick={() => setPage("attendance")}
        >
          Chamada
        </button>
        <button
          className={page === "register" ? "active" : ""}
          onClick={() => setPage("register")}
        >
          Cadastro
        </button>
      </nav>
      {page === "attendance" ? <AttendancePage /> : <RegisterPage />}
    </main>
  );
}

export default App;
