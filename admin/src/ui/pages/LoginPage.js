import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, TextField, Button, Typography, Stack } from "@mui/material";
import { api, setAuth } from "../api";
function getDeviceId() {
    const key = "deviceId";
    let v = localStorage.getItem(key);
    if (!v) {
        v = Math.random().toString(16).slice(2) + Date.now().toString(16);
        localStorage.setItem(key, v);
    }
    return v;
}
export default function LoginPage() {
    const navigate = useNavigate();
    const deviceId = useMemo(() => getDeviceId(), []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    async function login() {
        setErr(null);
        try {
            setAuth(null, deviceId);
            const res = await api.post("/auth/login", { email, password });
            const data = res.data.data;
            setAuth(data.accessToken, deviceId);
            navigate("/dashboard");
        }
        catch (e) {
            setErr(e?.response?.data?.error?.message ?? "Login failed");
        }
    }
    return (_jsx(Card, { sx: { maxWidth: 480, mx: "auto" }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h5", gutterBottom: true, children: "Admin Login" }), _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx(TextField, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value) }), err && _jsx(Typography, { color: "error", children: err }), _jsx(Button, { variant: "contained", onClick: login, children: "Login" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Seed admin: admin@example.com / Admin1234!" })] })] }) }));
}
