import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/AuthPages/LoginPage/LoginPage";
import RegisterPage from "../pages/AuthPages/RegisterPage/ RegisterPage";
import VerifyOtpPage from "../pages/VerificationPages/VerifyOtpPage";
import DashboardPage from "../pages/DashboardPages/DashboardPage/DashboardPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
