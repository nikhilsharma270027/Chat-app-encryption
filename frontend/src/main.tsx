import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import ChatState from "./Context/chat/ChatState.tsx";
import MessageState from "./Context/message/MessageState.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <ChatState>
        <MessageState>
          <App />
        </MessageState>
      </ChatState>
    </Provider>
  </StrictMode>
);
