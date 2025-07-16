import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const Payment = () => {
  const createOrder = (data, actions) => {
    return fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Your order details here
      }),
    })
    .then((response) => response.json())
    .then((order) => order.id);
  };

  const onApprove = (data, actions) => {
    return fetch(`/api/orders/${data.orderID}/capture`, {
      method: "POST",
    })
    .then((response) => response.json())
    .then((details) => {
      alert("Transaction completed by " + details.payer.name.given_name);
    });
  };

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
      <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
    </PayPalScriptProvider>
  );
};

export default Payment;