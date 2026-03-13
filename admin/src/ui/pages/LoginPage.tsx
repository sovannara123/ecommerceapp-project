import React, { useMemo, useState } from "react";
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
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    try {
      setAuth(null, deviceId);
      const res = await api.post("/auth/login", { email, password });
      const data = res.data.data;
      setAuth(data.accessToken, deviceId);
      navigate("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.error?.message ?? "Login failed");
    }
  }

  return (
    <Card sx={{ maxWidth: 480, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {err && <Typography color="error">{err}</Typography>}
          <Button variant="contained" onClick={login}>Login</Button>
          <Typography variant="body2" color="text.secondary">
            Seed admin: admin@example.com / Admin1234!
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
