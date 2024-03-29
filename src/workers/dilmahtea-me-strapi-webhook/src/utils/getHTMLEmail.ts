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
  text_shipping_address,
  text_billing_address,
}) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Je betaling is succesvol ontvangen. Dank hiervoor!</title>

        <style>
          .preheader-text a, .body-text a {          
            font-weight: 700;
            font-style: normal;
          }

          .preheader-text a {
            color: #FAF4F2;
          }

          .body-text a {
            color: #1E4848;
          }

          h1, h2 {
            font-family: ui-serif, serif;
          }
        </style>
      </head>
      
      <body style="padding: 0; margin: 0; background-color: #1E4848;">
        <!-- Preview Text -->
        <div style="display: none;"><${previewText}></div>

        <div 
          style="
            max-width: 720px;
            padding: 50px 24px;
            margin: 0 auto;
            font-family: ui-sans-serif, system-ui, sans-serif;
            font-size: 24px;
            font-size: clamp(18px, 0.75vw + 13.2px, 24px);
            line-height: 150%;
          "
        >
          <!-- brand logo -->
          <img
            alt="Dilmah Tea Logo"
            src="https://dilmahtea.me/_astro/logo-image.png"
            style="display: block; width: auto; height: 100px; height: clamp(70px, 2.875rem + 3.75vw, 100px); margin: 0 auto;"
          />
    
          <div
            role="main"
            style="display: block; margin: 50px 0;"
          >
            <div>
              <!-- Preheader Text -->
              <h1
                class="preheader-text"
                style="
                  font-size: 42px;
                  font-size: clamp(28px, 1.05rem + 1.75vw, 42px);
                  font-weight: 700;
                  text-align: center;
                  color: #fff;
                  line-height: 140%;
                  margin: 0;
                "
              >
                ${preheaderText}
              </h1>
    
              <!-- Text content -->
              <div style="display: block;">
                <div
                  class="body-text"
                  style="
                    background: #FAF4F2;
                    border-radius: 10px;
                    padding: 35px;
                    padding: clamp(15px, -0.063rem + 2.5vw, 35px);
                    font-size: 16px;
                    font-size: clamp(16px, 0.8rem + 0.5vw, 20px);
                    font-weight: 500;
                    line-height: 150%;
                    color: #474747;
                    margin-top: 30px;
                    margin-top: clamp(25px, 1.313rem + 0.625vw, 30px);
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
                          padding: 35px;
                          padding: clamp(15px, -0.063rem + 2.5vw, 35px);
                          color: #474747;
                          background: #FAF4F2;
                          border-radius: 10px;
                          margin-top: 30px;
                          margin-top: clamp(25px, 1.313rem + 0.625vw, 30px);
                        "
                      >
                        <h2 
                          style="
                            font-size: 32px;
                            font-size: clamp(24px, 1.1rem + 1vw, 32px);
                            font-weight: 700;
                            line-height: 140%;
                            color: #1E4848;
                            margin-top: 0;
                            margin-bottom: 30px;
                            margin-bottom: clamp(25px, 1.313rem + 0.625vw, 30px);
                          "
                        >
                          ${Overview_Title}
                        </h2>

                        <table width="100%">
                          <tbody>
                            \${line_items}
                            ${
                              !Shipping
                                ? ""
                                : `
                                <tr>
                                  <td style="vertical-align:middle;">
                                    ${Shipping}
                                  </td>

                                  <td align="right" style=" vertical-align: middle;">
                                    &euro;\${shipping_cost}
                                  </td>
                                </tr>

                                <tr>
                                  <td colspan="2">
                                    <div 
                                      style="
                                        border-bottom: 1px solid #B2CCCC;
                                        margin: 10px 0;
                                        margin: clamp(5px, 0.063rem + 0.625vw, 10px) 0;
                                      "
                                    ></div>
                                  </td>
                                </tr>
                              `
                            }

                            <tr>
                              <td 
                                style="
                                  vertical-align:middle;
                                  font-size: 28px;
                                  font-size: clamp(20px, 0.893rem + 0.952vw, 28px);
                                  font-weight: 700;
                                "
                              >
                                ${Total}
                              </td>

                              <td 
                                align="right" 
                                style="
                                  vertical-align: middle;
                                  padding-left: 10px;
                                  padding-left: clamp(5px, 0.063rem + 0.625vw, 10px);
                                  font-size: 28px;
                                  font-size: clamp(20px, 0.893rem + 0.952vw, 28px);
                                  font-weight: 700;
                                "
                              >
                                &euro;\${price}
                              </td>
                            </tr>

                            <tr>
                              <td 
                                style="
                                  vertical-align:middle;
                                  padding-top: 10px;
                                  padding-top: clamp(5px, 0.063rem + 0.625vw, 10px);
                                "
                              >
                                ${VAT}
                              </td>

                              <td 
                                align="right" 
                                style="
                                  vertical-align: middle;
                                  padding: 10px 0 0 10px;
                                  padding: clamp(5px, 0.063rem + 0.625vw, 10px) 0 0 clamp(5px, 0.063rem + 0.625vw, 10px);
                                "
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
                          padding: 35px;
                          padding: clamp(15px, -0.063rem + 2.5vw, 35px);
                          font-size: 24px;
                          font-size: clamp(18px, 0.75vw + 13.2px, 24px);
                          color: #474747;
                          background: #FAF4F2;
                          border-radius: 10px;
                          margin-top: 30px;
                          margin-top: clamp(25px, 1.313rem + 0.625vw, 30px);
                        "
                      >
                        <h2 
                          style="
                            margin: 0;
                            font-size: 32px;
                            font-size: clamp(24px, 1.1rem + 1vw, 32px);
                            font-weight: 700;
                            line-height: 140%;
                            color: #1E4848;
                            margin-top: 0;
                            margin-bottom: 30px;
                            margin-bottom: clamp(25px, 1.313rem + 0.625vw, 30px);
                          "
                        >
                          ${Billing_Details_Title}
                        </h2>
                        
                        <div>
                          ${
                            !Shipping
                              ? ""
                              : `
                              <div>
                                <div 
                                  style="
                                    font-size: 18px; 
                                    font-size: clamp(16px, 0.9rem + 0.25vw, 18px); 
                                    font-weight: 600;
                                    margin-bottom: 10px; 
                                    margin-bottom: clamp(5px, 0.063rem + 0.625vw, 10px);
                                  "
                                >
                                  ${text_shipping_address}
                                </div>

                                <div>\${shipping_address}</div>
                              </div>

                              <div 
                                style="
                                  border-bottom: 1px solid #B2CCCC;
                                  margin: 10px 0;
                                  margin: clamp(5px, 0.063rem + 0.625vw, 10px) 0;
                                "
                              ></div>
                            `
                          }

                          <div>
                            <div 
                              style="
                                font-size: 18px; 
                                font-size: clamp(16px, 0.9rem + 0.25vw, 18px); 
                                font-weight: 600;
                                margin-bottom: 10px; 
                                margin-bottom: clamp(5px, 0.063rem + 0.625vw, 10px);
                              "
                            >
                              ${text_billing_address}
                            </div>

                            <div>\${billing_address}</div>
                          </div>
                        </div>
                      </div>
                    `
                }
              </div>
            </div>
          </div>
    
          <!-- Footer Section -->
          <div
            style="
              font-size: 16px;
              font-size: clamp(12px, 0.55rem + 0.5vw, 16px);
              line-height: 150%;
              text-align: center;
              color: #FAF4F2;
            "
            role="contentinfo"
          >
            <div style="margin-bottom: 10px; margin-bottom: clamp(5px, 0.063rem + 0.625vw, 10px);">
              ${Company_address}
            </div>

            <div>${footerText}</div>
          </div>
        </div>
        
      </body>
    </html>
  `;

export default getHTMLEmail;
