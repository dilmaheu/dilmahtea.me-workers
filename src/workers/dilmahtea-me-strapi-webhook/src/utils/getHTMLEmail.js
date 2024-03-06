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
          href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap" rel="stylesheet"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alice&family=Roboto&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://drive.google.com/file/d/1hMgHTjfCIoDhXl_ZyKP_0_Lxv5WIVniZ/view?usp=drive_link"
          rel="stylesheet"
        />

        <style>
          .preheader-text a, .body-text a {
            color: #1E4848;
            font-weight: 700;
            font-style: normal;
          }
        </style>
      </head>
      
      <body style="padding: 0; margin: 0; background-color: #1E4848;">
        <!-- Preview Text -->
        <div style="display: none;"><${previewText}></div>

        <div 
          style="
            display: grid;
            gap: 50px;
            max-width: 720px;
            padding: 50px 24px;
            margin: 0 auto;
            font-family: Roboto Flex, sans-serif;
            font-size: 24px;
            font-size: clamp(18px, 0.75vw + 13.2px, 24px);
            line-height: 150%;
          "
        >
          <!-- brand logo -->
          <img
            alt="Dilmah Tea Logo"
            src="https://imagedelivery.net/BX3RwoS0OdbsyY2M52BQzw/c49ecab8-5548-4d65-41e8-efa0e59fb000/opengraph"
            style="display: block; width: auto; height: 100px; height: clamp(70px, 2.875rem + 3.75vw, 100px); margin: 0 auto;"
          />
    
          <div
            role="main"
            style="display: block;"
          >
            <div style="display: grid; gap: 30px; gap: clamp(25px, 1.313rem + 0.625vw, 30px);">
              <!-- Preheader Text -->
              
              <h1
                class="preheader-text"
                style="
                  font-family: Recoleta, Alice, serif;
                  font-size: 42px;
                  font-size: clamp(28px, 1.05rem + 1.75vw, 42px);
                  font-weight: 700;
                  text-align: center;
                  color: #fff;
                  line-height: 140%;
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
                    line-height: 150%;
                    color: #474747;
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
                          display: grid;
                          gap: 30px;
                          gap: clamp(25px, 1.313rem + 0.625vw, 30px);
                          padding: 35px;
                          padding: clamp(15px, -0.063rem + 2.5vw, 35px);
                          color: #474747;
                          background: #FAF4F2;
                          border-radius: 10px;
                        "
                      >
                        <h2 
                          style="
                            font-family: Recoleta, Alice, serif;
                            font-size: 32px;
                            font-size: clamp(24px, 1.1rem + 1vw, 32px)
                            font-weight: 700; 
                            line-height: 140%;
                            color: #1E4848;
                          "
                        >
                          ${Overview_Title}
                        </h2>

                        <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                          <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                            \${line_items}
                            ${
                              !Shipping
                              ? ""
                              : `
                                <div
                                  style="
                                    display: flex; 
                                    justify-content: space-between;
                                    gap: 10px;
                                    gap: clamp(5px, 0.063rem + 0.625vw, 10px);
                                    font-size: 16px;
                                    font-size: clamp(16px, 0.8rem + 0.5vw, 20px);
                                  "
                                >
                                  <div>${Shipping}</div>

                                  <div>&euro;\${shipping_cost}</div>
                                </div>
                              `
                            } 
                          </div>

                          <div style="border-bottom: 1px solid #B2CCCC;"></div>

                          <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                            <div
                              style="
                                display: flex; 
                                justify-content: space-between;
                                gap: 10px;
                                gap: clamp(5px, 0.063rem + 0.625vw, 10px);
                                font-size: 28px;
                                font-size: clamp(20px, 0.85rem + 1vw, 28px);
                                font-weight: 700;
                                color: #000;
                              "
                            >
                              <div>${Total}</div>

                              <div>$&euro;\${price}</div>
                            </div>

                            <div
                              style="
                                display: flex; 
                                justify-content: space-between;
                                gap: 10px;
                                gap: clamp(5px, 0.063rem + 0.625vw, 10px);
                                font-size: 16px;
                                font-size: clamp(16px, 0.8rem + 0.5vw, 20px);
                              "
                            >
                              <div>${VAT}</div>

                              <div>$&euro;\${tax}</div>
                            </div>
                          </div>
                        </div>
                          
                      </div>
                    `
                }
    
                ${
                  !Billing_Details_Title
                    ? ""
                    : `
                      <div
                        style="
                          display: grid;
                          gap: 30px;
                          gap: clamp(25px, 1.313rem + 0.625vw, 30px);
                          padding: 35px;
                          padding: clamp(15px, -0.063rem + 2.5vw, 35px);
                          color: #474747;
                          background: #FAF4F2;
                          border-radius: 10px;
                        "
                      >
                        <h2 
                          style="
                            margin: 0;
                            font-family: Recoleta, Alice, serif;
                            font-size: 32px;
                            font-size: clamp(24px, 1.1rem + 1vw, 32px)
                            font-weight: 700; 
                            line-height: 140%;
                            color: #1E4848;
                          "
                        >
                          ${Billing_Details_Title}
                        </h2>
                        
                        <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                          ${
                            !Shipping
                            ? ""
                            : `
                              <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                                <div 
                                  style="
                                    font-size: 18px; 
                                    font-size: clamp(16px, 0.9rem + 0.25vw, 18px); 
                                    font-weight: 600;
                                  "
                                >
                                  ${text_shipping_address}
                                </div>

                                <div style="font-size: 24px; font-size: clamp(18px, 0.75vw + 13.2px, 24px);">
                                  \${shipping_address}
                                </div>
                              </div>
                            `
                          }

                          <div style="border-bottom: 1px solid #B2CCCC;"></div>

                          <div style="display: grid; gap: 10px; gap: clamp(5px, 0.063rem + 0.625vw, 10px);">
                            <div style="font-size: 18px; font-size: clamp(16px, 0.9rem + 0.25vw, 18px); font-weight: 600;">
                              ${text_billing_address}
                            </div>

                            <div style="font-size: 24px; font-size: clamp(18px, 0.75vw + 13.2px, 24px);">
                              \${billing_address}
                            </div>
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
              display: grid;
              gap: 10px;
              gap: clamp(5px, 0.063rem + 0.625vw, 10px);
              font-size: 16px;
              font-size: clamp(12px, 0.55rem + 0.5vw, 16px);
              line-height: 150%;
              text-align: center;
              color: #FAF4F2;
            "
            role="contentinfo"
          >
            <div>${Company_address}</div>

            <div>${footerText}</div>
          </div>
        </div>
        
      </body>
    </html>
  `;

export default getHTMLEmail;
