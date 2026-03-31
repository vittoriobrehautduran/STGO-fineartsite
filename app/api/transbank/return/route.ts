import { NextRequest, NextResponse } from "next/server";

// Receive the POST callback from Transbank and normalize it to a GET redirect
// that the success page can read reliably in the browser.
export async function POST(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const orderIdFromQuery = incomingUrl.searchParams.get("order_id");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || incomingUrl.origin;

  const formData = await request.formData();
  const tokenWs = formData.get("token_ws")?.toString();
  const tbkToken = formData.get("TBK_TOKEN")?.toString();
  const tbkOrder = formData.get("TBK_ORDEN_COMPRA")?.toString();
  const tbkSession = formData.get("TBK_ID_SESION")?.toString();

  const redirectUrl = new URL("/checkout/success", siteUrl);
  if (orderIdFromQuery) {
    redirectUrl.searchParams.set("order_id", orderIdFromQuery);
  }

  if (tokenWs) {
    redirectUrl.searchParams.set("token_ws", tokenWs);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (tbkToken) {
    redirectUrl.searchParams.set("tbk_token", tbkToken);
  }
  if (tbkOrder) {
    redirectUrl.searchParams.set("tbk_orden_compra", tbkOrder);
  }
  if (tbkSession) {
    redirectUrl.searchParams.set("tbk_id_sesion", tbkSession);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function GET(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || incomingUrl.origin;
  const redirectUrl = new URL("/checkout/success", siteUrl);

  const orderId = incomingUrl.searchParams.get("order_id");
  const tokenWs = incomingUrl.searchParams.get("token_ws");
  const tbkToken = incomingUrl.searchParams.get("TBK_TOKEN");

  if (orderId) {
    redirectUrl.searchParams.set("order_id", orderId);
  }
  if (tokenWs) {
    redirectUrl.searchParams.set("token_ws", tokenWs);
  }
  if (tbkToken) {
    redirectUrl.searchParams.set("tbk_token", tbkToken);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
