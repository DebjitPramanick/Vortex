import { lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { useAuthStore } from "./store/useAuthStore.ts";

const ApplicationDetails = lazy(
  () => import("./pages/applicationDetails/index.tsx"),
);
const Applications = lazy(() => import("./pages/applications/index.tsx"));
const Login = lazy(() => import("./pages/login/index.tsx"));
const Signup = lazy(() => import("./pages/signup/index.tsx"));
const Dashboard = lazy(() => import("./pages/dashboard/index.tsx"));

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
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/applications" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
