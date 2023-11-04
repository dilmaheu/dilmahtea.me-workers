// @ts-check

const getHTMLEmail = ({
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
}) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Je betaling is succesvol ontvangen. Dank hiervoor!</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alice&family=Roboto&display=swap"
          rel="stylesheet"
        />

        <style>
          .preheader-text, .preheader-text a {
            color: #e2dfde;
          }

          .body-text a {
            display: inline;
            color: #4e878a;
            text-decoration: none;
            border-bottom: 1px solid #4e878a;
          }
        </style>
      </head>
      
      <body style="padding: 0; margin: 0; background-color: #2b4b50;">
        <!-- Preview Text -->
        <div style="display: none;"><${previewText}></div>
  
        <!-- Background Section -->
        <div
          style="
            position: relative;
            display: block;
            background-image: url(https://imagedelivery.net/BX3RwoS0OdbsyY2M52BQzw/7fa35dcb-abd3-41df-4711-3b9cac1b0500/opengraph);
            background-repeat: no-repeat;
            background-size: 100% 100%;
            height: 160px;
            object-fit: cover;
            overflow: hidden;
          "
        >
          <img
            alt="Dilmah Tea Logo"
            src="https://imagedelivery.net/BX3RwoS0OdbsyY2M52BQzw/c49ecab8-5548-4d65-41e8-efa0e59fb000/opengraph"
            style="display: block; width: auto; height: 100px; padding-top: 20px; margin: 0 auto;"
          />
        </div>
  
        <div
          role="main"
          style="display: block; justify-content: center;"
        >
          <div
            style="
              display: block;
              text-align: center;
              padding: 0 20px;
              margin: 0 auto;
            "
          >
            <!-- Preheader Text -->
            <div style="display: block; margin: 0 auto; max-width: 490px;">
              <h1
                class="preheader-text"
                style="
                  max-width: 490px;
                  padding: 45px 0;
                  margin: auto;
                  font-family: Alice;
                  font-size: 24px;
                  font-weight: 400;
                  line-height: 120%;
                  text-align: center;
                "
              >
                ${preheaderText}
              </h1>
            </div>
  
            <!-- Text content -->
            <div style="display: block; margin: 0 auto; max-width: 490px;">
              <div
                style="
                  font-family: Roboto;
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 140%;
                  letter-spacing: -0.02em;
                  text-align: left;
                "
              >
                <div
                  class="body-text"
                  style="
                    background: #e2dfde;
                    border-radius: 15px;
                    max-width: 100%;
                    padding: 28px 24px;
                    margin-bottom: 40px;
                    color: #000;
                  "
                >
                  ${bodyText}
                </div>
  
                ${
                  !Overview_Title
                    ? ""
                    : `
                      <div
                        style="
                          background: #e2dfde;
                          border-radius: 15px;
                          max-width: 100%;
                          margin-bottom: 40px;
                          padding: 28px 24px;
                          color: #2b4b50;
                        "
                      >
                        <h2 style="font-weight: 600; line-height: 140%;">
                          ${Overview_Title}
                        </h2>

                        <table width="100%" style="padding-top: 15px;">
                          <tbody>
                            \${line_items}
                            ${
                              !Shipping
                                ? ""
                                : `<tr>
                              <td
                                style="vertical-align: middle; padding-top: 15px;"
                              >
                                ${Shipping}
                              </td>
                              
                              <td
                                align="right"
                                style="vertical-align: middle; padding-top: 15px; padding-left: 10px;"
                              >
                                &euro;\${shipping_cost}
                              </td>
                            </tr>`
                            }
                          </tbody>
                        </table>

                        <div
                          style="
                            display: block;
                            margin-top: 40px;
                            margin-bottom: 40px;
                            border: 1px solid rgba(43, 75, 80, 0.3);
                          "
                        ></div>

                        <table width="100%">
                          <tbody>
                            <tr style="font-size: 28px; font-weight: 600;">
                              <td style="vertical-align: middle;">${Total}</td>

                              <td
                                align="right"
                                style="vertical-align: middle; padding-left: 10px;"
                              >
                                &euro;\${price}
                              </td>
                            </tr>

                            <tr>
                              <td
                                style="vertical-align: middle; padding-top: 20px;"
                              >
                                ${VAT}
                              </td>

                              <td
                                align="right"
                                style="vertical-align: middle; padding-top: 20px; padding-left: 10px;"
                              >
                                &euro;\${tax}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    `
                }
  
                ${
                  !Billing_Details_Title
                    ? ""
                    : `
                      <div
                        style="
                          background: #e2dfde;
                          border-radius: 15px;
                          max-width: 100%;
                          padding: 28px 24px;
                          color: #2b4b50;
                        "
                      >
                        <h3 style="font-weight: 600; line-height: 120%;">
                          ${Billing_Details_Title}
                        </h3>

                        <address
                          style="
                            font-style: normal;
                            line-height: 120%;  
                            padding-top: 20px;                
                          "
                        >
                          \${name}<br />\${street}<br />\${postal_code}
                          \${city}<br />\${country}
                        </address>
                      </div>
                    `
                }
              </div>
            </div>
          </div>
        </div>
  
        <!-- Footer Section -->
        <div style="display: block; background-color: #2b4b50;">
          <div
            style="
              display: block;
              max-width: 490px;
              padding: 40px 0;
              margin: auto;
              font-family: Roboto;
              font-size: 16px;
              font-weight: 500;
              line-height: 162%;
              text-align: center;
              color: #e2dfde;
            "
            role="contentinfo"
          >
            <div style="margin-top: 15px;">
              ${Company_address}
            </div>
            <div style="margin-top: 15px;">
              ${footerText}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export default getHTMLEmail;
