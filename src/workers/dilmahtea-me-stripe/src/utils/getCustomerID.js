// @ts-check

export default async function getCustomerID(stripe, customer) {
  const {
    data: [existingCustomer],
  } = await stripe.customers.list({ email: customer.email });

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
