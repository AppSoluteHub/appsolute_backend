import axios from "axios";
import { PrismaClient, PaymentStatus } from "@prisma/client";
import { BadRequestError } from "../../lib/appError";

const prisma = new PrismaClient();

export class PayStackService {
  private paystackSecretKey: string;

  constructor(secretKey: string) {
    this.paystackSecretKey = secretKey;
  }

  async initiatePayment(
    userId: string,
    orderId: string,
    amount: number,
    email: string
  ): Promise<string> {
    try {
      if (!this.isValidCurrencyAmount(amount)) {
        throw new BadRequestError("Amount must have at most 2 decimal places");
      }

      const amountInKobo = Math.round(amount * 100);

      const response: any = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          amount: amountInKobo,
          email,
          callback_url: "http://localhost:3000/success",
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { reference } = response.data.data;

      await prisma.payment.upsert({
        where: { orderId },
        update: {
          amount,
          reference,
          status: PaymentStatus.PENDING,
          updatedAt: new Date(),
        },
        create: {
          userId,
          orderId,
          email,
          amount,
          reference,
          status: PaymentStatus.PENDING,
        },
      });

      return response.data.data.authorization_url;
    } catch (error: any) {
      console.error(
        "Payment initiation failed:",
        error.response?.data || error.message
      );
      throw new BadRequestError(
        `Payment initiation failed => ${
          error.response?.data?.message || error.message
        }`,
        500
      );
    }
  }

  private isValidCurrencyAmount(amount: number): boolean {
    return /^\d+(\.\d{1,2})?$/.test(amount.toFixed(2));
  }

  async verifyPayment(reference: string): Promise<boolean> {
    try {
      const response: any = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        }
      );

      const { status } = response.data.data;
      const isSuccessful = status === "success";

      // Update the payment and get its related order
      const payment = await prisma.payment.update({
        where: { reference },
        data: {
          status: isSuccessful ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        },
        include: { order: true },
      });

      // If successful and linked to an order, mark order as CONFIRMED
      if (isSuccessful && payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      }

      return isSuccessful;
    } catch (error: any) {
      console.error("Payment verification failed:", error.message);
      return false;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    const { event, data } = payload;

    switch (event) {
      case "charge.success":
        await prisma.payment.update({
          where: { reference: data.reference },
          data: { status: PaymentStatus.SUCCESS },
        });
        break;
      case "charge.failed":
        await prisma.payment.update({
          where: { reference: data.reference },
          data: { status: PaymentStatus.FAILED },
        });
        break;
    }
  }

  async getPaymentStatus() {
    const status = await prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS },
    });
    return status;
  }

  async getUserDetails() {
    const users = await prisma.user.findMany({
      where: {
        payments: {
          some: {
            status: PaymentStatus.SUCCESS,
          },
        },
      },
      include: {
        payments: {
          where: {
            status: PaymentStatus.SUCCESS,
          },
        },
      },
    });
    return users;
  }
}
