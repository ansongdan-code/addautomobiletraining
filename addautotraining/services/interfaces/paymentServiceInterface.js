class PaymentServiceInterface {
  async initializePaystackPayment() {
    throw new Error('initializePaystackPayment must be implemented');
  }

  async verifyPaystackPayment() {
    throw new Error('verifyPaystackPayment must be implemented');
  }

  async processPaystackWebhook() {
    throw new Error('processPaystackWebhook must be implemented');
  }

  async getPaymentHistory() {
    throw new Error('getPaymentHistory must be implemented');
  }
}

module.exports = PaymentServiceInterface;
