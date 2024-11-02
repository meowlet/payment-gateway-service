import { Elysia } from "elysia";
import { PaymentService } from "./service/PaymentService";
import { PaymentModel } from "./model/PaymentModel";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(PaymentModel)
  .post(
    "/payment",
    async ({ body }) => {
      const paymentService = new PaymentService();
      return paymentService.createPayment(body);
    },
    {
      body: "CreatePaymentBody",
    }
  )
  .listen(3000);

console.log("The app should be running at http://localhost:3000");
