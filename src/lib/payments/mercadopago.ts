import MercadoPagoConfig, { Preference } from "mercadopago";

function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface MPItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export async function createMercadoPagoPreference(
  orderId: string,
  items: MPItem[],
  payerEmail: string
) {
  const client = getMPClient();
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      external_reference: orderId,
      items: items.map((i) => ({
        id: orderId,
        title: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: "CLP",
      })),
      payer: { email: payerEmail },
      back_urls: {
        success: `${BASE_URL}/api/pagos/mercadopago/retorno?status=success`,
        failure: `${BASE_URL}/api/pagos/mercadopago/retorno?status=failure`,
        pending: `${BASE_URL}/api/pagos/mercadopago/retorno?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
    },
  });

  return response as {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  };
}
