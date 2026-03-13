import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
function getDeviceId() {
    return localStorage.getItem("deviceId") || "admin-device";
}
export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const deviceId = useMemo(() => getDeviceId(), []);
    useEffect(() => {
        const token = getAccessToken();
        setAuth(token, deviceId);
        api.get("/orders/admin/all").then(r => setOrders(r.data.data)).catch(() => setOrders([]));
    }, []);
    const pending = orders.filter(o => o.status === "pending_payment").length;
    const revenue = orders.filter(o => o.status !== "pending_payment" && o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "overline", children: "Orders" }), _jsx(Typography, { variant: "h4", children: orders.length })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "overline", children: "Pending Payment" }), _jsx(Typography, { variant: "h4", children: pending })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "overline", children: "Revenue" }), _jsx(Typography, { variant: "h4", children: revenue.toFixed(2) })] }) }) })] }));
}
