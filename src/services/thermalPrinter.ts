// Thermal Printer Service untuk BP-ECO58D
export interface PrinterConfig {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: string;
}

export interface ReceiptData {
  id: string;
  PaymentMethod: string;
  TotalPrice: number;
  user: {
    name: string;
    username: string;
    phoneNumber: string;
    role: string;
  };
  tenant: {
    name: string;
    location: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  created_at: string;
}

export class ThermalPrinter {
  private isConnected: boolean = false;
  private printer: any = null;

  // ESC/POS Commands untuk BP-ECO58D
  private readonly ESC = "\x1B";
  private readonly GS = "\x1D";

  // Command constants
  private readonly COMMANDS = {
    INIT: "\x1B\x40", // Initialize printer
    FEED_LINE: "\x0A", // Line feed
    FEED_PAPER: "\x1B\x64\x03", // Feed 3 lines
    CUT_PAPER: "\x1B\x69", // Cut paper (full cut)
    CUT_PAPER_PARTIAL: "\x1B\x6D", // Cut paper (partial cut)

    // Text formatting
    BOLD_ON: "\x1B\x45\x01", // Bold on
    BOLD_OFF: "\x1B\x45\x00", // Bold off
    UNDERLINE_ON: "\x1B\x2D\x01", // Underline on
    UNDERLINE_OFF: "\x1B\x2D\x00", // Underline off
    DOUBLE_WIDTH_ON: "\x1B\x57\x01", // Double width on
    DOUBLE_WIDTH_OFF: "\x1B\x57\x00", // Double width off

    // Alignment
    ALIGN_LEFT: "\x1B\x61\x00",
    ALIGN_CENTER: "\x1B\x61\x01",
    ALIGN_RIGHT: "\x1B\x61\x02",

    // Character size
    NORMAL_SIZE: "\x1D\x21\x00",
    DOUBLE_SIZE: "\x1D\x21\x11",
    LARGE_SIZE: "\x1D\x21\x22",
  };

  constructor(config?: PrinterConfig) {
    // Check if Web Serial API is available
    if (!("serial" in navigator)) {
      console.warn("Web Serial API not supported in this browser");
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!("serial" in navigator)) {
        throw new Error("Web Serial API not supported");
      }

      // Request a port and open it
      const port = await (navigator as any).serial.requestPort();
      await port.open({
        baudRate: 9600, // Standard baud rate untuk BP-ECO58D
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      this.printer = port;
      this.isConnected = true;

      // Initialize printer
      await this.sendCommand(this.COMMANDS.INIT);

      console.log("✅ Thermal printer connected successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to thermal printer:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.printer) {
      try {
        await this.printer.close();
        this.printer = null;
        this.isConnected = false;
        console.log("✅ Thermal printer disconnected");
      } catch (error) {
        console.error("❌ Failed to disconnect thermal printer:", error);
      }
    }
  }

  private async sendCommand(command: string): Promise<void> {
    if (!this.isConnected || !this.printer) {
      throw new Error("Printer not connected");
    }

    const writer = this.printer.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(command));
    } finally {
      writer.releaseLock();
    }
  }

  private async sendText(text: string): Promise<void> {
    await this.sendCommand(text);
  }

  private formatCurrency(amount: number): string {
    // Format dengan Rp tanpa karakter khusus untuk thermal printer
    const formatted = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `Rp ${formatted}`;
  }

  private padLine(left: string, right: string, width: number = 32): string {
    const totalLength = left.length + right.length;
    const padding = Math.max(0, width - totalLength);
    return left + " ".repeat(padding) + right;
  }

  private centerText(text: string, width: number = 32): string {
    const padding = Math.max(0, (width - text.length) / 2);
    return " ".repeat(Math.floor(padding)) + text;
  }

  async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error("Failed to connect to printer");
        }
      }

      // Initialize printer
      await this.sendCommand(this.COMMANDS.INIT);

      // Header
      await this.sendCommand(this.COMMANDS.ALIGN_CENTER);
      await this.sendCommand(this.COMMANDS.DOUBLE_SIZE);
      await this.sendCommand(this.COMMANDS.BOLD_ON);
      await this.sendText("PET SHOP POS\n");

      await this.sendCommand(this.COMMANDS.NORMAL_SIZE);
      await this.sendCommand(this.COMMANDS.BOLD_OFF);
      await this.sendText("Jalan Imogiri Barat - Sewon\n");
      await this.sendText("09239829203923\n");
      await this.sendText(`${receiptData.tenant.name}\n`);
      //   await this.sendText(`${receiptData.tenant.location}\n`);

      // Separator line
      await this.sendCommand(this.COMMANDS.ALIGN_LEFT);
      await this.sendText("=".repeat(32) + "\n");

      //Transaction info
      const date = new Date(receiptData.created_at).toLocaleString("id-ID");
      await this.sendText(`Tanggal: ${date}\n`);
      await this.sendText(`ID Trans: ${receiptData.id.substring(0, 16)}\n`);
      await this.sendText(`Kasir   : ${receiptData.user.name}\n`);
      await this.sendText(
        `Pembayaran: ${receiptData.PaymentMethod.replace(
          "_",
          " "
        ).toUpperCase()}\n`
      );

      // Separator
      await this.sendText("-".repeat(32) + "\n");

      // Products header
      await this.sendText("ITEM\n");
      await this.sendText("-".repeat(32) + "\n");

      // Products
      let subtotal = 0;
      for (const product of receiptData.products) {
        const productTotal = product.price * product.quantity;
        subtotal += productTotal;

        // Product name (bisa multiline jika panjang)
        await this.sendText(`${product.name}\n`);

        // Quantity x Price = Total
        const qtyPriceText = `${product.quantity} x ${this.formatCurrency(
          product.price
        )}`;
        const totalText = this.formatCurrency(productTotal);
        await this.sendText(this.padLine(qtyPriceText, totalText) + "\n");
      }

      // Separator
      await this.sendText("-".repeat(32) + "\n");

      // Total
      await this.sendCommand(this.COMMANDS.BOLD_ON);
      await this.sendCommand(this.COMMANDS.DOUBLE_WIDTH_ON);
      const totalLine = this.padLine(
        "TOTAL:",
        this.formatCurrency(receiptData.TotalPrice)
      );
      await this.sendText(totalLine + "\n");
      await this.sendCommand(this.COMMANDS.BOLD_OFF);
      await this.sendCommand(this.COMMANDS.DOUBLE_WIDTH_OFF);

      // Footer
      await this.sendText("=".repeat(32) + "\n");
      await this.sendCommand(this.COMMANDS.ALIGN_CENTER);
      await this.sendText("Terima Kasih\n");
      await this.sendText("Atas Kunjungan Anda\n");
      await this.sendText("Barang yang sudah dibeli\n");
      await this.sendText("tidak dapat dikembalikan\n");
      await this.sendText("Jagatix.comp\n");

      // Feed paper and cut
      await this.sendCommand(this.COMMANDS.FEED_PAPER);
      await this.sendCommand(this.COMMANDS.CUT_PAPER_PARTIAL);

      console.log("✅ Receipt printed successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to print receipt:", error);
      throw error;
    }
  }

  // Method untuk test print
  async printTest(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error("Failed to connect to printer");
        }
      }

      await this.sendCommand(this.COMMANDS.INIT);
      await this.sendCommand(this.COMMANDS.ALIGN_CENTER);
      await this.sendCommand(this.COMMANDS.DOUBLE_SIZE);
      await this.sendCommand(this.COMMANDS.BOLD_ON);
      await this.sendText("TEST PRINT\n");
      await this.sendCommand(this.COMMANDS.NORMAL_SIZE);
      await this.sendCommand(this.COMMANDS.BOLD_OFF);
      await this.sendText("BP-ECO58D Thermal Printer\n");
      await this.sendText("Connection Test Successful\n");
      await this.sendCommand(this.COMMANDS.FEED_PAPER);
      await this.sendCommand(this.COMMANDS.CUT_PAPER_PARTIAL);

      console.log("✅ Test print successful");
      return true;
    } catch (error) {
      console.error("❌ Test print failed:", error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConnected && this.printer !== null;
  }
}

// Singleton instance
export const thermalPrinter = new ThermalPrinter();
