import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { ApplicationDetails } from "./pages/applicationDetails";
import { Applications } from "./pages/applications";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { useAuthStore } from "./store/useAuthStore.ts";

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/applications" replace />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
        </Route>
        <Route path="*" element={<Navigate to="/applications" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
