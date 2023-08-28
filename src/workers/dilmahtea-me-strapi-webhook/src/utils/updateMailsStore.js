// @ts-check

import getHTMLEmail from "./getHTMLEmail.js";
import { reply } from "../../../../utils/createModuleWorker.js";

const query = `
  fragment EcommercePaymentConfirmationMailAttributes on EcommercePaymentConfirmationMail {
    locale
    From_name
    From_email
    Subject
    Preview_text
    Preheader_text
    Body
    Overview
    Total
    Invoice
    VAT
    Shipping
  }

  fragment CrowdfundingEmailAttributes on CrowdfundingEmail {
    locale
    From_name
    From_email
    Subject
    Preview_text
    Preheader_text
    Body
    Overview
    Total
    Invoice
    VAT
  }

  fragment RecurringElementAttributes on RecurringElement {
    locale
    Footer_text
    Company_address
  }

  {
    ecommercePaymentConfirmationMail {
      data {
        attributes {
          ...EcommercePaymentConfirmationMailAttributes
          localizations {
            data {
              attributes {
                ...EcommercePaymentConfirmationMailAttributes
              }
            }
          }
        }
      }
    }

    crowdfundingEmail {
      data {
        attributes {
          ...CrowdfundingEmailAttributes
          localizations {
            data {
              attributes {
                ...CrowdfundingEmailAttributes
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
    data: {
      ecommercePaymentConfirmationMail,
      crowdfundingEmail,
      recurringElement,
    },
  } = await response.json();

  const recurringElementData = [
    recurringElement.data,
    ...recurringElement.data.attributes.localizations.data,
  ];

  const mails = {
    "Crowdfunding Email": [
      crowdfundingEmail.data,
      ...crowdfundingEmail.data.attributes.localizations.data,
    ].map(({ attributes }) => attributes),
    "Ecommerce Payment Confirmation Mail": [
      ecommercePaymentConfirmationMail.data,
      ...ecommercePaymentConfirmationMail.data.attributes.localizations.data,
    ].map(({ attributes }) => attributes),
  };

  await Promise.all(
    Object.keys(mails).map(async (mailKey) => {
      const htmlMailsEntries = mails[mailKey].map((mail) => {
        const {
          locale,
          From_name,
          From_email,
          Subject,
          Preview_text,
          Preheader_text,
          Body,
          Overview,
          Total,
          Invoice,
          VAT,
          Shipping,
        } = mail;

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

        const { Footer_text, Company_address } = recurringElementData.find(
          ({ attributes }) => attributes.locale === locale,
        ).attributes;

        const footerText = Footer_text.replaceAll(
          "<current_year>",
          new Date().getFullYear(),
        );

        const htmlEmail = getHTMLEmail({
          Overview,
          Total,
          Invoice,
          Shipping,
          VAT,
          Company_address,
          previewText,
          preheaderText,
          bodyText,
          footerText,
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
