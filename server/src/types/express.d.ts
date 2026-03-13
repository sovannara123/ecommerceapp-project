declare namespace Express {
  interface Request {
    rawBody?: Buffer;
    requestId?: string;
  }
}
