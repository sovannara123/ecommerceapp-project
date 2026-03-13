import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Card, CardContent, Chip } from "@mui/material";
function getDeviceId() {
    return localStorage.getItem("deviceId") || "admin-device";
}
export default function OrdersPage() {
    const [items, setItems] = useState([]);
    const deviceId = useMemo(() => getDeviceId(), []);
    useEffect(() => {
        const token = getAccessToken();
        setAuth(token, deviceId);
        api.get("/orders/admin/all").then(r => setItems(r.data.data)).catch(() => setItems([]));
    }, []);
    return (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "h5", children: "Orders" }), items.map(o => (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "subtitle1", children: ["Order ", o._id] }), _jsx(Chip, { label: o.status, size: "small" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Total: ", o.total, " ", o.currency] })] }) }, o._id)))] }));
}
