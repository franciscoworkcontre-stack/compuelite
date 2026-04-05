import {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  Environment,
  IntegrationCommerceCodes,
} from "transbank-sdk";

function getWebpay() {
  const isIntegration = process.env.TRANSBANK_ENV !== "production";

  if (isIntegration) {
    return new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    );
  }

  return new WebpayPlus.Transaction(
    new Options(
      process.env.TRANSBANK_COMMERCE_CODE!,
      process.env.TRANSBANK_API_KEY!,
      Environment.Production
    )
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createWebpayTransaction(orderId: string, amount: number) {
  const tx = getWebpay();
  const buyOrder = `CE-${orderId.slice(-8).toUpperCase()}`;
  const sessionId = orderId;
  const returnUrl = `${BASE_URL}/api/pagos/webpay/retorno`;

  const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
  return response as { token: string; url: string };
}

export async function confirmWebpayTransaction(token: string) {
  const tx = getWebpay();
  const response = await tx.commit(token);
  return response as {
    vci: string;
    amount: number;
    status: string;
    buy_order: string;
    session_id: string;
    card_detail: { card_number: string };
    accounting_date: string;
    transaction_date: string;
    authorization_code: string;
    payment_type_code: string;
    response_code: number;
    installments_number: number;
  };
}
