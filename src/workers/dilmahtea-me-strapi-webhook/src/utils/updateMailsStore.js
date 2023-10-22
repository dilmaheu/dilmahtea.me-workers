// @ts-check

import getHTMLEmail from "./getHTMLEmail.js";
import { reply } from "../../../../utils/createModuleWorker.js";

const query = `
  fragment EmailAttributes on EMail {
    locale
    Type
    Subject
    Preview_text
    Preheader_text
    Body
    VAT
    Overview_Title
    Billing_Details_Title
  }

  fragment RecurringElementAttributes on RecurringElement {
    locale
    Footer_text
    From_name
    Company_email
    Company_address
  }

  fragment CheckoutRecurringElementAttributes on CheckoutRecurringElement {
    locale
    text_total
    text_shipping
  }

  {
    eMails {
      data {
        attributes {
          ...EmailAttributes
          localizations {
            data {
              attributes {
                ...EmailAttributes
              }
            }
          }
        }
      }
    }

    recurringElement {
      data {
        attributes {
          ...RecurringElementAttributes
          localizations {
            data {
              attributes {
                ...RecurringElementAttributes
              }
            }
          }
        }
      }
    }

    checkoutRecurringElement {
      data {
        attributes {
          ...CheckoutRecurringElementAttributes
          localizations {
            data {
              attributes {
                ...CheckoutRecurringElementAttributes
              }
            }
          }
        }
      }
    }
  }
`;

export async function updateMailsStore(env) {
  const response = await fetch(env.STRAPI_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.STRAPI_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  const {
    data: { eMails, recurringElement, checkoutRecurringElement },
  } = await response.json();

  const recurringElementData = Object.fromEntries(
      [
        recurringElement.data,
        ...recurringElement.data.attributes.localizations.data,
      ].map(({ attributes }) => [attributes.locale, attributes]),
    ),
    checkoutRecurringElementData = Object.fromEntries(
      [
        checkoutRecurringElement.data,
        ...checkoutRecurringElement.data.attributes.localizations.data,
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
          From_name,
          Company_email: From_email,
          Footer_text,
          Company_address,
        } = recurringElementData[locale];

        const { text_total: Total, text_shipping: Shipping } =
          checkoutRecurringElementData[locale];

        const previewText = Preview_text + "&nbsp;".repeat(100),
          preheaderText = Preheader_text.replaceAll("\n", "<br />"),
          bodyText = Body.replaceAll("\n", "<br />")
            .replaceAll("<first_name>", "${first_name}")
            .replaceAll(
              "<from_email>",
              `
                <a
                  href="mailto:${From_email}"
                  style="font-style: italic;display: inline;border-bottom: 1px solid #4e878a;text-decoration: none;color: #4e878a;"
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
        });

        const mailData = { Subject, From_name, From_email, htmlEmail };

        return [locale.substring(0, 2), mailData];
      });

      await env.MAILS.put(
        mailKey,
        JSON.stringify(Object.fromEntries(htmlMailsEntries)),
      );
    }),
  );

  return reply({ message: `Updated 'Mails' KV Namespace` }, 200);
}
