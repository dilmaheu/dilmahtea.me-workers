import env from "../env";

import getHTMLEmail from "./getHTMLEmail.js";

import D1Strapi from "../../../../utils/D1Strapi";

export default async function updateMailsStore() {
  const { eMails, recurringElement } = await D1Strapi();

  const recurringElementData = Object.fromEntries(
    [
      recurringElement.data,
      ...recurringElement.data.attributes.localizations.data,
    ].map(({ attributes }) => [attributes.locale, attributes]),
  );
  const {
    crowdfunding_payment_confirmation_email,
    ecommerce_payment_confirmation_email,
    magic_link_email,
  } = Object.fromEntries(
    eMails.data.map((data) => [data.attributes.Type, data]),
  );

  const mails = {
    "Crowdfunding Email": [
      crowdfunding_payment_confirmation_email,
      ...crowdfunding_payment_confirmation_email.attributes.localizations.data,
    ].map(({ attributes }) => attributes),
    "Ecommerce Payment Confirmation Mail": [
      ecommerce_payment_confirmation_email,
      ...ecommerce_payment_confirmation_email.attributes.localizations.data,
    ].map(({ attributes }) => attributes),
    "Magic Link Email": [
      magic_link_email,
      ...magic_link_email.attributes.localizations.data,
    ].map(({ attributes }) => attributes),
  };

  await Promise.all(
    Object.keys(mails).map(async (mailKey) => {
      const htmlMailsEntries = mails[mailKey].map((mail) => {
        const {
          locale,
          Subject,
          Preview_text,
          Preheader_text,
          Body,
          VAT,
          Overview_Title,
          Billing_Details_Title,
        } = mail;

        const {
          Company_email: From_email,
          Footer_text,
          Company_address,
          text_shipping_address,
          text_billing_address,
          text_total: Total,
          text_shipping: Shipping,
        } = recurringElementData[locale];

        const previewText = Preview_text + "&nbsp;".repeat(100),
          preheaderText = Preheader_text.replaceAll("\n", "<br />"),
          bodyText = Body.replaceAll("\n", "<br />")
            .replaceAll("<first_name>", "${first_name}")
            .replaceAll(
              "<from_email>",
              `
                <a
                  href="mailto:${From_email}"
                  style="color: #1E4848; font-weight: 700;"
                  >${From_email}</a
                >
              `,
            );

        const footerText = Footer_text.replaceAll(
          "<current_year>",
          new Date().getFullYear(),
        );

        const htmlEmail = getHTMLEmail({
          previewText,
          preheaderText,
          bodyText,
          footerText,
          VAT,
          Overview_Title,
          Billing_Details_Title,
          Total,
          Shipping,
          Company_address,
          text_shipping_address,
          text_billing_address,
        });

        const mailData = {
          Subject,
          htmlEmail,
          SMS: mailKey === "Magic Link Email" ? Body : undefined,
        };

        return [locale.substring(0, 2), mailData];
      });

      await env.MAILS.put(
        mailKey,
        JSON.stringify(Object.fromEntries(htmlMailsEntries)),
      );
    }),
  );

  console.log("Updated 'Mails' KV Namespace");

  return true;
}
