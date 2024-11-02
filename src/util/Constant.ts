export class Constant {
  // Momo config
  static readonly MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api";
  static readonly MOMO_ACCESS_KEY = Bun.env.MOMO_ACCESS_KEY || "";
  static readonly MOMO_SECRET_KEY = Bun.env.MOMO_SECRET_KEY || "";
  static readonly MOMO_PARTNER_CODE = Bun.env.MOMO_PARTNER_CODE || "";
  static readonly MOMO_REDIRECT_URL = "https://github.com/meowlet";
  static readonly MOMO_IPN_URL =
    "https://webhook.site/338767c8-4a56-4d5c-9a07-642128ad8410";

  // Store config
  static readonly STORE_NAME = "Himmel";

  // Database config
  static readonly TRANSACTION_COLLECTION = "transactions";
}
