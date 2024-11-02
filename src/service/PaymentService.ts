import crypto from "crypto";
import { ObjectId } from "mongodb";
import { Constant } from "../util/Constant";

export interface PaymentItem {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  currency: string;
  quantity: number;
  unit?: string;
  totalPrice: number;
  taxAmount?: number;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TransactionType {
  PREMIUM_SUBSCRIPTION = "PREMIUM_SUBSCRIPTION",
  AUTHOR_PAYOUT = "AUTHOR_PAYOUT",
}

export interface BaseOrderInfo {
  userId: string;
  message: string;
  type: TransactionType;
  metadata?: Record<string, any>; // Additional data specific to order type
}

export interface PaymentRequest {
  amount: string;
  orderInfo: BaseOrderInfo;
  paymentItems?: PaymentItem[];
  options?: {
    redirectUrl?: string;
    ipnUrl?: string;
    lang?: string;
    paymentProvider?: PaymentProvider;
  };
}

export enum PaymentProvider {
  MOMO = "MOMO",
  // Add other payment providers here
}

interface PaymentProviderConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  defaultRedirectUrl: string;
  defaultIpnUrl: string;
}

export class PaymentService {
  private database: any;
  private paymentProviderConfigs: Record<
    PaymentProvider,
    PaymentProviderConfig
  >;

  constructor() {
    this.paymentProviderConfigs = {
      [PaymentProvider.MOMO]: {
        endpoint: Constant.MOMO_ENDPOINT,
        accessKey: Constant.MOMO_ACCESS_KEY,
        secretKey: Constant.MOMO_SECRET_KEY,
        partnerCode: Constant.MOMO_PARTNER_CODE,
        defaultRedirectUrl: Constant.MOMO_REDIRECT_URL,
        defaultIpnUrl: Constant.MOMO_IPN_URL,
      },
      // Add other provider configs here
    };
  }

  async createPayment(paymentRequest: PaymentRequest): Promise<string> {
    const {
      amount,
      orderInfo,
      paymentItems = [],
      options = {},
    } = paymentRequest;

    const provider = options.paymentProvider || PaymentProvider.MOMO;
    const config = this.paymentProviderConfigs[provider];

    const orderId = new ObjectId().toString();
    const requestId = new ObjectId().toString();

    const {
      redirectUrl = config.defaultRedirectUrl,
      ipnUrl = config.defaultIpnUrl,
      lang = "vi",
    } = options;

    const payUrl = await this.processPaymentRequest(provider, {
      amount,
      orderId,
      requestId,
      redirectUrl,
      ipnUrl,
      orderInfo: orderInfo.message,
      items: paymentItems,
      lang,
    });

    // await this.saveTransaction(orderId, requestId, amount, orderInfo);
    return payUrl;
  }

  private async processPaymentRequest(
    provider: PaymentProvider,
    params: {
      amount: string;
      orderId: string;
      requestId: string;
      redirectUrl: string;
      ipnUrl: string;
      orderInfo: string;
      items: PaymentItem[];
      lang: string;
    }
  ): Promise<string> {
    switch (provider) {
      case PaymentProvider.MOMO:
        return this.processMoMoPayment(params);
      // Add other provider cases here
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  private async processMoMoPayment(params: {
    amount: string;
    orderId: string;
    requestId: string;
    redirectUrl: string;
    ipnUrl: string;
    orderInfo: string;
    items: PaymentItem[];
    lang: string;
  }): Promise<string> {
    const config = this.paymentProviderConfigs[PaymentProvider.MOMO];
    const requestBody = this.createMoMoRequestBody(params, config);
    return this.sendPaymentRequest(config.endpoint + "/create", requestBody);
  }

  private createMoMoRequestBody(
    params: {
      amount: string;
      orderId: string;
      requestId: string;
      redirectUrl: string;
      ipnUrl: string;
      orderInfo: string;
      items: PaymentItem[];
      lang: string;
    },
    config: PaymentProviderConfig
  ): any {
    const requestType = "captureWallet";
    const extraData = "";
    const storeName = Constant.STORE_NAME;

    const rawSignature = this.createRawSignature({
      accessKey: config.accessKey,
      amount: params.amount,
      ipnUrl: params.ipnUrl,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      partnerCode: config.partnerCode,
      redirectUrl: params.redirectUrl,
      requestId: params.requestId,
      requestType,
      extraData,
    });

    const signature = this.createSignature(rawSignature, config.secretKey);

    return {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId: params.requestId,
      storeName,
      amount: params.amount,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      redirectUrl: params.redirectUrl,
      ipnUrl: params.ipnUrl,
      items: params.items,
      requestType,
      signature,
      lang: params.lang,
      extraData,
    };
  }

  private createRawSignature(params: Record<string, string>): string {
    return Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  private createSignature(rawSignature: string, secretKey: string): string {
    return crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
  }

  private async sendPaymentRequest(
    endpoint: string,
    data: any
  ): Promise<string> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();

    if (responseData.payUrl) {
      return responseData.payUrl;
    }
    throw new Error("Failed to create payment");
  }

  private async saveTransaction(
    orderId: string,
    requestId: string,
    amount: string,
    orderInfo: BaseOrderInfo
  ): Promise<void> {
    await this.database.collection(Constant.TRANSACTION_COLLECTION).insertOne({
      user: new ObjectId(orderInfo.userId),
      amount,
      requestId,
      type: orderInfo.type,
      orderInfo: orderInfo.message,
      status: PaymentStatus.PENDING,
      orderId,
      metadata: orderInfo.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateTransactionStatus(orderId: string, status: PaymentStatus) {
    const transaction = await this.database
      .collection(Constant.TRANSACTION_COLLECTION)
      .findOne({ orderId });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await this.database.collection(Constant.TRANSACTION_COLLECTION).updateOne(
      { orderId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );
  }

  async getTransactionByOrderId(orderId: string) {
    return await this.database
      .collection(Constant.TRANSACTION_COLLECTION)
      .findOne({ orderId });
  }

  async getUserTransactions(userId: string) {
    return await this.database
      .collection(Constant.TRANSACTION_COLLECTION)
      .find({ user: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }
}
