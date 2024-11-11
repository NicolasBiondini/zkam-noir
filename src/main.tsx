import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import CameraCapture from "./components/CameraCapture.tsx";
import VerifyPage from "./components/VerifyPage.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppKitProvider } from "./components/WagmiProvider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppKitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<CameraCapture />} />
            <Route path="verify" element={<VerifyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AppKitProvider>
  </StrictMode>
);
