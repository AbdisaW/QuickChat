import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/AuthPages/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPages/DashboardPage/DashboardPage";



function AppRouter (){
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />}/>
            <Route path="/dashboard" element={<DashboardPage />}/>

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}

export default AppRouter;