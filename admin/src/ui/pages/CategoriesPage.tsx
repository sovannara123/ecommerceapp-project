import React, { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";
import { Stack, Typography, Card, CardContent } from "@mui/material";

function getDeviceId() {
  return localStorage.getItem("deviceId") || "admin-device";
}

export default function CategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const deviceId = useMemo(()=>getDeviceId(),[]);

  useEffect(() => {
    const token = getAccessToken();
    setAuth(token, deviceId);
    api.get("/catalog/categories").then(r => setItems(r.data.data)).catch(()=>setItems([]));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Categories</Typography>
      {items.map(c => (
        <Card key={c._id}><CardContent>
          <Typography variant="h6">{c.name}</Typography>
          <Typography variant="body2" color="text.secondary">{c.slug}</Typography>
        </CardContent></Card>
      ))}
    </Stack>
  );
}
