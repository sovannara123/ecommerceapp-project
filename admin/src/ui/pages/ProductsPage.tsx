import React, { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Button, TextField, Card, CardContent } from "@mui/material";

function getDeviceId() {
  return localStorage.getItem("deviceId") || "admin-device";
}

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("New Product");
  const deviceId = useMemo(()=>getDeviceId(),[]);

  async function load() {
    const token = getAccessToken();
    setAuth(token, deviceId);
    const res = await api.get("/catalog/products");
    setItems(res.data.data.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Products</Typography>
      <Card><CardContent>
        <Typography variant="subtitle1">Quick create (demo)</Typography>
        <Stack direction="row" spacing={2}>
          <TextField label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Button variant="contained" onClick={load}>Refresh</Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">Use API for full CRUD. This page is minimal for MVP.</Typography>
      </CardContent></Card>

      {items.map(p => (
        <Card key={p._id}><CardContent>
          <Typography variant="h6">{p.title}</Typography>
          <Typography variant="body2" color="text.secondary">${p.price}</Typography>
        </CardContent></Card>
      ))}
    </Stack>
  );
}
