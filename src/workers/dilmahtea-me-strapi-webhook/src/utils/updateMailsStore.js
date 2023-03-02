import getHTMLEmail from "./getHTMLEmail.js";

export async function updateMailsStore(model, reply) {
  const query = `
    {
      ${
        model === "ecommerce-payment-confirmation-mail"
          ? `
              ecommercePaymentConfirmationMail {
                data {
                  attributes {
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
                    localizations {
                      data {
                        attributes {
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
                      }
                    }
                  }
                }
              }
            `
          : ""
      }

      ${
        model === "crowdfunding-email"
          ? `
              crowdfundingEmail {
                data {
                  attributes {
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
                    localizations {
                      data {
                        attributes {
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
                      }
                    }
                  }
                }
              }
            `
          : ""
      }

      recurringElement {
        data {
          attributes {
            Footer_text
            Company_address
          }
        }
      }
    }
  `;

  const response = await fetch(CMS_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CMS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query,
    }),
  });

  const {
    data: {
      ecommercePaymentConfirmationMail,
      crowdfundingEmail,
      recurringElement,
    },
  } = await response.json();

  const { Footer_text, Company_address } = recurringElement.data.attributes;

  const footerText = Footer_text.replaceAll(
    "<current_year>",
    new Date().getFullYear()
  );

  const mails = [
    crowdfundingEmail?.data,
    ecommercePaymentConfirmationMail?.data,
  ]
    .concat(crowdfundingEmail?.data.attributes.localizations.data)
    .concat(
      ecommercePaymentConfirmationMail?.data.attributes.localizations.data
    )
    .filter(Boolean)
    .map(({ attributes }) => attributes);

  const htmlMailsEntries = mails.map((mail) => {
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
        `
        );

    console.log({ preheaderText });

    const htmlEmail = getHTMLEmail({
      Overview,
      Total,
      Invoice,
      VAT,
      Company_address,
      previewText,
      preheaderText,
      bodyText,
      footerText,
    });

    const mailData = {
      Subject,
      From_name,
      From_email,
      htmlEmail,
    };

    return [locale.substring(0, 2), mailData];
  });

  const htmlMails = Object.fromEntries(htmlMailsEntries),
    mailKey = model
      .split("-")
      .map((string) => string[0].toUpperCase() + string.slice(1))
      .join(" ");

  await MAILS.put(mailKey, JSON.stringify(htmlMails));

  return reply(
    JSON.stringify({
      message: `${mailKey} Saved to 'Mails' KV Namespace`,
    }),
    200
  );
}