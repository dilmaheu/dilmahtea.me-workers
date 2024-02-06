// @ts-check

export default async function getCustomerID(stripe, paymentData, CMSData) {
  const {
    email,
    billing_first_name,
    billing_last_name,
    billing_country,
    billing_city,
    billing_street,
    billing_postal_code,
  } = paymentData;

  const countryCode = CMSData.countries.data.find(
    ({ attributes: { name } }) => name === billing_country,
  ).attributes.code;

  const name = billing_first_name + " " + billing_last_name,
    address = {
      country: countryCode,
      city: billing_city,
      postal_code: billing_postal_code,
      line1: billing_street,
    };

  const customer = {
    email,
    name,
    address,
    shipping: {
      name,
      address,
    },
  };

  const {
    data: [existingCustomer],
  } = await stripe.customers.list({ email });

  const hasToUpdateCustomer =
    existingCustomer &&
    JSON.stringify(customer) !==
      JSON.stringify({
        email: existingCustomer.email,
        name: existingCustomer.name,
        address: {
          country: existingCustomer.address?.country,
          city: existingCustomer.address?.city,
          postal_code: existingCustomer.address?.postal_code,
          line1: existingCustomer.address?.line1,
        },
        shipping: {
          name: existingCustomer.shipping?.name,
          address: {
            country: existingCustomer.shipping?.address?.country,
            city: existingCustomer.shipping?.address?.city,
            postal_code: existingCustomer.shipping?.address?.postal_code,
            line1: existingCustomer.shipping?.address?.line1,
          },
        },
      });

  if (!existingCustomer || hasToUpdateCustomer) {
    const createdCustomer = await stripe.customers.create(customer);

    return createdCustomer;
  } else {
    return existingCustomer;
  }
}