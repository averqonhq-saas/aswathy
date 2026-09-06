import { BookingProvider } from "./types";
import { InternalBookingProvider } from "./internal-provider";
import { ZohoBookingProvider } from "./zoho-provider";

export * from "./types";

class BookingServiceManager {
  private activeProvider: BookingProvider;

  constructor() {
    const providerType = process.env.BOOKING_PROVIDER || "internal";
    if (providerType === "zoho") {
      this.activeProvider = new ZohoBookingProvider();
    } else {
      this.activeProvider = new InternalBookingProvider();
    }
  }

  getProvider(): BookingProvider {
    return this.activeProvider;
  }

  setProvider(provider: "internal" | "zoho") {
    if (provider === "zoho") {
      this.activeProvider = new ZohoBookingProvider();
    } else {
      this.activeProvider = new InternalBookingProvider();
    }
  }
}

export const bookingService = new BookingServiceManager().getProvider();
