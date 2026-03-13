import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import { useAccessToken } from "../stores/authStore";
import { api, setAuth } from "./api";
import { useInactivityTimeout } from "../hooks/useInactivityTimeout";
function getDeviceId() {
    return localStorage.getItem("deviceId") || "admin-device";
}
export default function App() {
    useInactivityTimeout();
    const accessToken = useAccessToken();
    const deviceId = useMemo(() => getDeviceId(), []);
    const [checking, setChecking] = useState(true);
    const authed = Boolean(accessToken);
    useEffect(() => {
        const token = accessToken;
        setAuth(token, deviceId);
        if (token) {
            setChecking(false);
            return;
        }
        api.post("/auth/refresh", {})
            .then((res) => {
            const nextToken = res?.data?.data?.accessToken;
            setAuth(nextToken ?? null, deviceId);
        })
            .catch(() => {
            setAuth(null, deviceId);
        })
            .finally(() => setChecking(false));
    }, [accessToken, deviceId]);
    if (checking) {
        return _jsx(Container, { sx: { py: 3 }, children: _jsx(Typography, { color: "text.secondary", children: "Checking session..." }) });
    }
    return (_jsxs(_Fragment, { children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "Admin" }), authed && (_jsxs(_Fragment, { children: [_jsx(Button, { color: "inherit", component: Link, to: "/dashboard", children: "Dashboard" }), _jsx(Button, { color: "inherit", component: Link, to: "/products", children: "Products" }), _jsx(Button, { color: "inherit", component: Link, to: "/categories", children: "Categories" }), _jsx(Button, { color: "inherit", component: Link, to: "/orders", children: "Orders" })] }))] }) }), _jsx(Container, { sx: { py: 3 }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: authed ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: authed ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/products", element: authed ? _jsx(ProductsPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/categories", element: authed ? _jsx(CategoriesPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/orders", element: authed ? _jsx(OrdersPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] }) })] }));
}
