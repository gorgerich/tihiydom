import React from "react";
import ReactDOM from "react-dom/client";

// главный компонент приложения
import App from "../ui/App";

// если глобальных стилей нет — эту строку можно удалить
import "../globals.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
