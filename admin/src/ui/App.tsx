import React, { useEffect, useMemo, useState } from "react";
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
        const nextToken: string | undefined = res?.data?.data?.accessToken;
        setAuth(nextToken ?? null, deviceId);
      })
      .catch(() => {
        setAuth(null, deviceId);
      })
      .finally(() => setChecking(false));
  }, [accessToken, deviceId]);

  if (checking) {
    return <Container sx={{ py: 3 }}><Typography color="text.secondary">Checking session...</Typography></Container>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin</Typography>
          {authed && (
            <>
              <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
              <Button color="inherit" component={Link} to="/products">Products</Button>
              <Button color="inherit" component={Link} to="/categories">Categories</Button>
              <Button color="inherit" component={Link} to="/orders">Orders</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={authed ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={authed ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/products" element={authed ? <ProductsPage /> : <Navigate to="/login" />} />
          <Route path="/categories" element={authed ? <CategoriesPage /> : <Navigate to="/login" />} />
          <Route path="/orders" element={authed ? <OrdersPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </>
  );
}
