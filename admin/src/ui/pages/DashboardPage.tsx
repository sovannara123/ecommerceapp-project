import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { api, setAuth } from "../api";
import { getAccessToken } from "../../stores/authStore";

function getDeviceId() {
  return localStorage.getItem("deviceId") || "admin-device";
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const deviceId = useMemo(()=>getDeviceId(),[]);

  useEffect(() => {
    const token = getAccessToken();
    setAuth(token, deviceId);
    api.get("/orders/admin/all").then(r => setOrders(r.data.data)).catch(()=>setOrders([]));
  }, []);

  const pending = orders.filter(o => o.status === "pending_payment").length;
  const revenue = orders.filter(o => o.status !== "pending_payment" && o.status !== "cancelled").reduce((s,o)=>s+(o.total||0),0);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card><CardContent><Typography variant="overline">Orders</Typography><Typography variant="h4">{orders.length}</Typography></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card><CardContent><Typography variant="overline">Pending Payment</Typography><Typography variant="h4">{pending}</Typography></CardContent></Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card><CardContent><Typography variant="overline">Revenue</Typography><Typography variant="h4">{revenue.toFixed(2)}</Typography></CardContent></Card>
      </Grid>
    </Grid>
  );
}
