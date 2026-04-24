export const SHIPPING_FEES = {
  standard: 6.99,
  express: 14.99,
};

export const DELIVERY_METHOD_OPTIONS = [
  {
    value: "standard",
    label: "Standard delivery",
    description: "Reliable shipping for routine orders.",
  },
  {
    value: "express",
    label: "Express delivery",
    description: "Faster dispatch for time-sensitive purchases.",
  },
];

export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "cod",
    label: "Cash on delivery",
    description: "Pay when the order arrives.",
  },
  {
    value: "card",
    label: "Card checkout",
    description: "Simulated instant payment for this project.",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    description: "Place the order and settle payment manually.",
  },
];

export const getShippingFee = (deliveryMethod) =>
  SHIPPING_FEES[deliveryMethod] ?? SHIPPING_FEES.standard;

export const formatDeliveryMethod = (deliveryMethod) => {
  const match = DELIVERY_METHOD_OPTIONS.find((option) => option.value === deliveryMethod);
  return match?.label || "Standard delivery";
};

export const formatPaymentMethod = (paymentMethod) => {
  const match = PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod);
  return match?.label || "Cash on delivery";
};

export const formatShippingAddress = (shippingAddress = {}) =>
  [
    shippingAddress.addressLine1,
    shippingAddress.addressLine2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

export const getInitialCheckoutForm = (user) => ({
  fullName: user?.defaultShippingAddress?.fullName || user?.name || "",
  phone: user?.defaultShippingAddress?.phone || user?.phone || "",
  addressLine1:
    user?.defaultShippingAddress?.addressLine1 || user?.address || "",
  addressLine2: user?.defaultShippingAddress?.addressLine2 || "",
  city: user?.defaultShippingAddress?.city || "",
  state: user?.defaultShippingAddress?.state || "",
  postalCode: user?.defaultShippingAddress?.postalCode || "",
  country: user?.defaultShippingAddress?.country || "",
  deliveryMethod: "standard",
  paymentMethod: user?.defaultPaymentMethod || "cod",
  orderNotes: "",
  saveCheckoutProfile: true,
});

export const calculateCheckoutTotals = (items = [], deliveryMethod = "standard") => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.productId?.price || 0) * Number(item.quantity || 0),
    0,
  );
  const shippingFee = items.length > 0 ? getShippingFee(deliveryMethod) : 0;

  return {
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
  };
};
