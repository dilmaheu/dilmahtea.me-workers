export default async function getPaymentMethodTypes(
  country,
  { paymentMethods: { data: paymentMethods } }
) {
  const supportedPaymentMethods = paymentMethods.filter(
    ({ attributes: { supported_countries } }) =>
      supported_countries.data.length === 0 ||
      supported_countries.data.some(
        ({ attributes: { name } }) => name === country
      )
  );

  return supportedPaymentMethods.map(({ attributes: { method } }) => method);
}
