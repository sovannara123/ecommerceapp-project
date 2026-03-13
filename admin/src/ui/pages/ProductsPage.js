import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Button, TextField, Card, CardContent } from "@mui/material";
function getDeviceId() {
    return localStorage.getItem("deviceId") || "admin-device";
}
export default function ProductsPage() {
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("New Product");
    const deviceId = useMemo(() => getDeviceId(), []);
    async function load() {
        const token = getAccessToken();
        setAuth(token, deviceId);
        const res = await api.get("/catalog/products");
        setItems(res.data.data.items || []);
    }
    useEffect(() => { load(); }, []);
    return (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "h5", children: "Products" }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle1", children: "Quick create (demo)" }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(TextField, { label: "Title", value: title, onChange: (e) => setTitle(e.target.value) }), _jsx(Button, { variant: "contained", onClick: load, children: "Refresh" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Use API for full CRUD. This page is minimal for MVP." })] }) }), items.map(p => (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: p.title }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["$", p.price] })] }) }, p._id)))] }));
}
