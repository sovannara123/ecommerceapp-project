import React, { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Card, CardContent, Chip } from "@mui/material";

function getDeviceId() {
  return localStorage.getItem("deviceId") || "admin-device";
}

export default function OrdersPage() {
  const [items, setItems] = useState<any[]>([]);
  const deviceId = useMemo(()=>getDeviceId(),[]);

  useEffect(() => {
    const token = getAccessToken();
    setAuth(token, deviceId);
    api.get("/orders/admin/all").then(r => setItems(r.data.data)).catch(()=>setItems([]));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Orders</Typography>
      {items.map(o => (
        <Card key={o._id}><CardContent>
          <Typography variant="subtitle1">Order {o._id}</Typography>
          <Chip label={o.status} size="small" />
          <Typography variant="body2" color="text.secondary">Total: {o.total} {o.currency}</Typography>
        </CardContent></Card>
      ))}
    </Stack>
  );
}
