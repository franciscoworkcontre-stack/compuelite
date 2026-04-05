import crypto from "crypto";

const FLOW_SANDBOX_URL = "https://sandbox.flow.cl/api";
const FLOW_PROD_URL = "https://www.flow.cl/api";

function getBaseUrl() {
  return process.env.FLOW_ENV === "production" ? FLOW_PROD_URL : FLOW_SANDBOX_URL;
}

function sign(params: Record<string, string>): string {
  const secretKey = process.env.FLOW_SECRET_KEY!;
  // Sign all params sorted alphabetically, concatenated as key+value
  const keys = Object.keys(params).sort();
  const toSign = keys.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", secretKey).update(toSign).digest("hex");
}

async function flowPost(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.FLOW_API_KEY!;
  const allParams = { ...params, apiKey };
  const s = sign(allParams);
  const body = new URLSearchParams({ ...allParams, s });

  const res = await fetch(`${getBaseUrl()}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`Flow API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function flowGet(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.FLOW_API_KEY!;
  const allParams = { ...params, apiKey };
  const s = sign(allParams);
  const qs = new URLSearchParams({ ...allParams, s });

  const res = await fetch(`${getBaseUrl()}/${endpoint}?${qs}`);
  if (!res.ok) throw new Error(`Flow API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createFlowPayment(
  orderId: string,
  amount: number,
  email: string,
  subject: string
) {
  const data = await flowPost("payment/create", {
    commerceOrder: orderId,
    subject,
    currency: "CLP",
    amount: String(Math.round(amount)),
    email,
    paymentMethod: "9", // All payment methods
    urlConfirmation: `${BASE_URL}/api/pagos/flow/confirmacion`,
    urlReturn: `${BASE_URL}/api/pagos/flow/retorno`,
  });

  return data as {
    url: string;
    token: string;
    flowOrder: number;
  };
}

export async function getFlowPaymentStatus(token: string) {
  const data = await flowGet("payment/getStatus", { token });
  return data as {
    flowOrder: number;
    commerceOrder: string;
    requestDate: string;
    status: number; // 1=pending, 2=paid, 3=rejected, 4=cancelled
    subject: string;
    currency: string;
    amount: number;
    payer: string;
    optional: Record<string, unknown>;
    pending_info: Record<string, unknown>;
    paymentData: Record<string, unknown>;
    merchantId: string;
  };
}
