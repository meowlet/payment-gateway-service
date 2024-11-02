import Elysia, { t } from "elysia";
import { TransactionType, PaymentProvider } from "../service/PaymentService";

export const PaymentModel = new Elysia().model({
  CreatePaymentBody: t.Object({
    amount: t.String({
      minLength: 1,
      pattern: "^[0-9]+$",
      error: "Amount must be a positive number in string format",
    }),
    orderInfo: t.Object({
      userId: t.String({
        minLength: 24,
        maxLength: 24,
        error: "User ID must be 24 characters long",
      }),
      message: t.String({
        minLength: 1,
        error: "Order message must not be empty",
      }),
      type: t.Enum(TransactionType),
      metadata: t.Optional(t.Record(t.String(), t.Any())),
    }),
    paymentItems: t.Optional(
      t.Array(
        t.Object({
          id: t.Optional(t.String()),
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          category: t.Optional(t.String()),
          imageUrl: t.Optional(t.String()),
          manufacturer: t.Optional(t.String()),
          price: t.Number({ minimum: 0 }),
          currency: t.String({ minLength: 1 }),
          quantity: t.Number({ minimum: 1 }),
          unit: t.Optional(t.String()),
          totalPrice: t.Number({ minimum: 0 }),
          taxAmount: t.Optional(t.Number({ minimum: 0 })),
        }),
        {
          minItems: 1,
          error: "Payment items array must not be empty when provided",
        }
      )
    ),
    options: t.Optional(
      t.Object({
        redirectUrl: t.Optional(t.String({ format: "uri" })),
        ipnUrl: t.Optional(t.String({ format: "uri" })),
        lang: t.Optional(
          t.String({
            default: "vi",
            enum: ["vi", "en"],
          })
        ),
        paymentProvider: t.Optional(t.Enum(PaymentProvider)),
      })
    ),
  }),

  PaymentStatusParams: t.Object({
    orderId: t.String({
      minLength: 24,
      maxLength: 24,
      error: "Order ID must be 24 characters long",
    }),
  }),

  UserTransactionsParams: t.Object({
    userId: t.String({
      minLength: 24,
      maxLength: 24,
      error: "User ID must be 24 characters long",
    }),
  }),
});
