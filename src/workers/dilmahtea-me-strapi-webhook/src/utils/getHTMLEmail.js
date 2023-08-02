// @ts-check

const getHTMLEmail = ({
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
            <div style="display: block; margin: 0 auto; max-width: 490px">
              <h1
                style="
                  max-width: 490px;
                  padding: 45px 0;
                  margin: auto;
                  font-family: Alice;
                  font-size: 24px;
                  font-weight: 400;
                  line-height: 120%;
                  text-align: center;
                  color: #e3dfde;
                "
              >
                ${preheaderText}
              </h1>
            </div>
  
            <!-- Text content -->
            <div style="display: block; margin: 0 auto; max-width: 490px">
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
                  style="
                    background: #e3dfde;
                    border-radius: 15px;
                    max-width: 100%;
                    padding: 28px 24px;
                    margin-bottom: 40px;
                    color: #000;
                  "
                >
                  ${bodyText}
                </div>
  
                <div
                  style="
                    background: #e3dfde;
                    border-radius: 15px;
                    max-width: 100%;
                    margin-bottom: 40px;
                    padding: 28px 24px;
                    color: #2b4b50;
                  "
                >
                  <h2 style="font-weight: 600; line-height: 140%">
                    ${Overview}
                  </h2>

                  <table width="100%" style="padding-top: 15px;">
                    <tbody>
                      \${line_items}

                      ${
                        !Shipping
                          ? ""
                          : `<tr>
                              <td
                                style="vertical-align: middle; padding-top: 15px"
                              >
                                ${Shipping}
                              </td>
                              
                              <td
                                align="right"
                                style="vertical-align: middle; padding-top: 15px; padding-left: 10px;"
                              >
                                €\${shipping_cost}
                              </td>
                            </tr>`
                      }
                    </tbody>
                  </table>

                  <div
                    style="
                      display: block;
                      margin-top: 40px;
                      border: 1px solid rgba(43, 75, 80, 0.3);
                    "
                  ></div>

                  <p style="padding-top: 15px; font-size: 28px; font-weight: 600;">
                    <span style="float: left">${Total}</span>
                    <span style="float: right; padding-left: 10px;">€\${price}</span>
                  </p>

                  <p style="padding-top: 20px;">
                    <span style="float: left">${VAT}</span>
                    <span style="float: right; padding-left: 10px;">€\${tax}</span>
                  </p>
                </div>
  
                <div
                  style="
                    background: #e3dfde;
                    border-radius: 15px;
                    max-width: 100%;
                    padding: 28px 24px;
                    color: #2b4b50;
                  "
                >
                  <h3 style="font-weight: 600; line-height: 120%">
                    ${Invoice}
                  </h3>

                  <address
                    style="
                      font-style: normal;
                      line-height: 120%;  
                      padding-top: 20px;                
                    "
                  >
                    \${name}<br>\${street}<br>\${postal_code} \${city}<br>\${country}
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Footer Section -->
        <div style="display: block; background-color: #2b4b50">
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
              color: #e3dfde;
            "
            role="contentinfo"
          >
            <div style="margin-top: 15px">
              ${Company_address}
            </div>
            <div style="margin-top: 15px">
              ${footerText}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export default getHTMLEmail;
