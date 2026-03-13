import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Card, CardContent } from "@mui/material";
function getDeviceId() {
    return localStorage.getItem("deviceId") || "admin-device";
}
export default function CategoriesPage() {
    const [items, setItems] = useState([]);
    const deviceId = useMemo(() => getDeviceId(), []);
    useEffect(() => {
        const token = getAccessToken();
        setAuth(token, deviceId);
        api.get("/catalog/categories").then(r => setItems(r.data.data)).catch(() => setItems([]));
    }, []);
    return (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "h5", children: "Categories" }), items.map(c => (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: c.name }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: c.slug })] }) }, c._id)))] }));
}
