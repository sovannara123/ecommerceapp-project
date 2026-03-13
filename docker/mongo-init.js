// Initializes single-node replica set for transactions.
db = db.getSiblingDB("admin");
const replicaHost = process.env.MONGO_RS_HOST || "mongo:27017";
let initialized = false;

try {
  const status = rs.status();
  initialized = status.ok === 1 && Array.isArray(status.members) && status.members.length > 0;
} catch (_err) {
  initialized = false;
}

if (!initialized) {
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: replicaHost }],
  });
  printjson(rs.status());
} else {
  print(`Replica set already initialized with host ${replicaHost}`);
}
