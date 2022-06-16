/**
 * Respond with hello worker text
 * @param {Request} request
 */
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your funds have been received, successfully</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Alice&family=Roboto&display=swap"
      rel="stylesheet"
    />
  </head>
  <body style="background-color: #2b4b50; padding: 0; z-index: -1; margin: 0">
    <div>
      <div
        style="width: 100%; height: 80vh; object-fit: cover; overflow: hidden"
      >
        <img
          style="width: 100%; height: 100%; object-fit: bottom"
          src="https://dilmahtea.me/images/willian-justen-de-vasconcellos-_MMP5j_fCqw-unsplash.webp"
          alt="mountain-background-image"
        />
      </div>

      <div style="margin-top: -8%; position: absolute; width: 100%">
        <img
          alt=""
          src="data:image/svg+xml;base64,PHN2Zw0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgICB2aWV3Qm94PSIwIDAgMTA4MCAzNjEuOCINCiAgICBmaWxsPSIjMkI0QjUwIg0KICAgIGxlbmd0aD0iMTAwJTsiDQogICAgaGVpZ2h0PSIxMDAlIg0KPg0KICAgIDxwYXRoDQogICAgZD0iTTEwODAsMFYzNjEuOEgwVjM4LjZTMTAuMSw4MS44LDExNS45LDgxLjhjNDguNiwwLDk3LjctNS41LDE1MC43LTExLjQsNjIuNi03LDEzMC43LTE0LjYsMjEwLjEtMTQuNiw3NS4xLDAsMTQyLjQsNi44LDIwOC4yLDEzLjQsNjIuOSw2LjQsMTI0LjMsMTIuNiwxODkuOCwxMi42QzEwMDguNyw4MS44LDEwODAsMCwxMDgwLDBaIg0KICAgIHN0eWxlPSJmaWxsLXJ1bGU6IGV2ZW5vZGQiDQogICAgLz4NCjwvc3ZnPg=="
        />
      </div>

      <div style="display: block; justify-content: center; margin-top: -48vh">
        <div
          style="
            position: relative;
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 580px;
            padding: 0 20px;
            margin: 0 auto;
          "
        >
          <div role="banner" style="margin-top: -20vh">
            <div
              style="
                position: relative;
                display: block;
                justify-content: center;
                padding-top: 68px;
                text-align: center;
              "
            >
              <div style="width: 100%; height: 55px">
                <img
                  style="height: 55px"
                  alt=""
                  src="data:image/svg+xml;base64,PHN2Zw0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgICB2aWV3Qm94PSIwIDAgNTUuNSA1Ny4xIg0KICAgIGZpbGw9Im5vbmUiDQogICAgc3Ryb2tlPSIjZTNkZmRlIg0KICAgIHN0cm9rZS1saW5lY2FwPSJyb3VuZCINCiAgICBzdHJva2Utd2lkdGg9IjMiDQogICAgbGVuZ3RoPSIxMDAlOyINCiAgICBoZWlnaHQ9IjEwMCUiDQo+DQogICAgPHBhdGgNCiAgICBkPSJNNDMuNiAzNi40YTI3LjYgMjcuNiAwIDAgMCAuNi00SDEuN2MuNyA3IDMuOSAyMS40IDIwLjIgMjNhMTcuNiAxNy42IDAgMCAwIDE2LjctNy4ybTUtMTEuOGMxLjktMy40IDcuMy0zLjkgOS40LTIuNHMuOCA1LjktMS4xIDktNi41IDUuMy05LjMgNi4yYy05LjQgMy4yLTMuNy0uNy00LTFtNS0xMS44YTMwLjEgMzAuMSAwIDAgMS01IDExLjhNMTYuNyAyNS45cy00LjYtNC42LTQuMy04LjEgOC40LTMuOCA4LjUtOC04LjUtOC4zLTguNS04LjNtMTIuNyAyM3M0LjItMS4yIDQuOC0zLjItNC4zLTIuOS00LjgtNS42Yy0xLTQuNCA3LjctOS4zIDcuNy05LjMiDQogICAgLz4NCjwvc3ZnPg=="
                />
              </div>
              <a href="">
                <div style="height: 45px; margin-top: 20px">
                  <img
                    style="height: 45px"
                    alt=""
                    src="data:image/svg+xml;base64,PHN2Zw0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgICB2aWV3Qm94PSIwIDAgMTE3NSA1NzEuMSINCiAgICBmaWxsPSIjZmZmIg0KICAgIGxlbmd0aD0iMTAwJTsiDQogICAgaGVpZ2h0PSIxMDAlIg0KPg0KPHBhdGgNCiAgICBkPSJNMTEuNCA1MzQuNXYtLjNjMC0yLjkgNS0yLjcgNy4xLTguNWwzMy45LTg2LjZjMS43LTQuMi01LTYuMi01LTl2LS4zYzAtMS4yIDEtMS44IDIuNi0xLjhoMTkuNWMxLjQgMCAyLjQuNiAyLjQgMS44di4zYzAgMi44LTYuOCA0LjItNSA4LjdsMzcuNyA4Ni45YzIuMyA1LjYgNy4zIDUuNiA3LjMgOC41di4zYzAgMS4yLTEuMiAxLjgtMyAxLjhIODguM2MtMS45IDAtMy4xLS42LTMuMS0xLjh2LS4zYzAtMi45IDcuMy0zLjIgNS4yLTguNWwtNy41LTE4SDMzLjhsLTYuOSAxOGMtMi4xIDUuMyA1LjIgNS42IDUuMiA4LjV2LjNjMCAxLjItMS4yIDEuOC0zLjIgMS44SDE0LjRxLTMgMC0zLTEuOHptNjkuMi0zMy40LTIzLjItNTYtMjEuMiA1NnptNzAuMi0xLjhjMC0yMi45IDE2LjgtMzcuNiAzNy41LTM3LjcgMTYuNy0uMiAyOS44IDEwLjQgMjkuOCAxOC45IDAgMy0xLjggNS41LTYuMSA1LjMtOC45LS4zLTguNy0xOS4yLTI2LjEtMTkuMy0xMi43IDAtMjEuNyAxMS43LTIxLjcgMjYuOCAwIDIxLjQgMTIuMSAzNSAyOSAzNSAxMC43IDAgMTcuNy02LjggMjEuMi0xNC40IDEuMy0yLjMgNS4xLTEuOCA0LjUgMS4yLTIuMiAxMS4yLTEyLjIgMjIuOC0yOS45IDIyLjgtMjEuMyAwLTM4LjItMTYuNS0zOC4yLTM4LjZ6TTMwMi41IDUzNGMwIDIuNi0zLjEgMy4zLTkuNSAzLjNzLTExLjQtMi44LTExLjEtMTEuM2wtLjMtMWMtNC41IDguMS0xMi43IDEyLjktMjMuNSAxMi45LTE2LjcgMC0yOC4zLTEyLjItMjguMy0zNC44di0yN2MwLTUuOC01LjYtNi4zLTUuNi04Ljl2LS40YzAtMS4xLjktMiAyLjMtMi4zbDEyLjgtMi4zYzIuNi0uNSA0LjEtLjIgNC4xIDEuOHY0MC4xYzAgMTcuNyA2LjQgMjcuOCAxOCAyNy44czE5LjMtOS4xIDE5LjMtMjMuMnYtMzIuNmMwLTUuOC01LjktNi4xLTUuOS04Ljl2LS40YzAtMS4xLjgtMiAyLjMtMi4zbDEzLTIuM2MyLjUtLjUgMy45LS4yIDMuOSAxLjh2NTkuMmMtLjEgMTEuMiA4LjUgNi40IDguNSAxMC44em04MS45LTM1LjNjMCAyMi41LTE1LjcgMzkuMi0zNC45IDM5LjJhMjggMjggMCAwIDEtMjIuNi0xMC42djMyLjhjMCA1LjcgNS45IDUuNyA1LjkgOC42di40YzAgMS40LTEuMiAyLTMgMkgzMTFjLTEuOCAwLTMuMi0uNi0zLjItMnYtLjRjMC0yLjkgNS42LTIuOSA1LjYtOC42di04MC44YzAtNS40LTYuMS01LjUtNi4xLTguNnYtLjRjMC0xLjIgMS0yLjIgMi41LTIuOGwxMS01LjNjMy0xLjQgNC4yLS4yIDQuMiAyLjF2MTAuMWM0LjYtNy44IDEzLjctMTIuOCAyNC40LTEyLjggMTguNSAwIDM1IDE0LjUgMzUgMzcuMXptLTEzLjYgMy42YzAtMjEtMTAuMS0zNS44LTI0LjktMzUuOC05LjQgMC0xNy44IDcuNi0xOSAxNi45djI2LjFjMCAxMi4yIDEwIDIzLjUgMjAuNyAyMy41IDE0LjEgMCAyMy4yLTExLjkgMjMuMi0zMC43em01OC4zLTMuNmMwLTIxLjMgMTYuMi0zNy4xIDM3LjEtMzcuMSAyMi44IDAgMzguNyAxNy40IDM4LjcgMzguN3MtMTQuNSAzNy42LTM2IDM3LjZjLTI0LjMgMC0zOS44LTE4LjUtMzkuOC0zOS4yem02Mi40IDYuMmMwLTIxLjQtMTEuMy0zOC4zLTI2LjktMzguMy0xMi45IDAtMjEuOSAxMC43LTIxLjkgMjcuOCAwIDE5LjUgMTEuMyAzOC40IDI4IDM4LjQgMTEuOSAwIDIwLjgtMTAuOCAyMC44LTI3Ljl6bTczLjUtNjYuMWE1LjQgNS40IDAgMCAxLTUuNCA1LjRoLS4yYy0xMS45IDAtMy4xLTE1LjMtMTYuNy0xNS40LTEwLjUtLjItMTIuNSAxNC41LTkuMyAzMC4ydjQuMWgyMS4yYTIuMiAyLjIgMCAwIDEgMi4yIDIuMXYyYTIuMSAyLjEgMCAwIDEtMi4yIDJoLTIxLjJ2NTYuM2MwIDUuNSA2LjkgNS43IDYuOSA4LjV2LjVjMCAxLjEtLjkgMS44LTIuMyAxLjhoLTIxLjVjLTEuNSAwLTIuMy0uNy0yLjMtMS44di0uNWMwLTIuOCA1LjgtMyA1LjgtOC41di01Ni4zaC0xMi43YTIuMSAyLjEgMCAwIDEtMi4yLTJ2LTJhMi4yIDIuMiAwIDAgMSAyLjItMi4xSDUyMHYtMTMuM2MwLTE0LjkgOC43LTI1LjkgMjQuOS0yNS45IDEwLjcgMCAyMC4xIDYuNyAyMC4xIDE0Ljl6bTEwNy4xIDk1LjF2LjVjMCAxLjItLjcgMS45LTIuMyAxLjloLTE5LjZhMiAyIDAgMCAxLTIuMy0xLjd2LS45YzAtMyA1LTIuOSAyLjktNi4ybC0xOS42LTI4LjFhNjIuMSA2Mi4xIDAgMCAxLTE2IDIuNXYyMy4zYzAgNS4zIDYuMSA1LjMgNi4xIDguNXYuN2MwIDEuMi0xLjIgMS45LTMuMiAxLjloLTE4LjljLTIgMC0zLjItLjctMy4yLTEuOXYtLjdjMC0zLjIgNS42LTMuMiA1LjYtOC41di04NC44YzAtNS44LTUuOS03LjEtNS45LTkuOHYtLjJjMC0xLjIuNy0xLjggMi4zLTIuNGwxMi44LTUuOWMyLjctMS40IDQuNC4xIDQuNCAyLjJ2NzEuMWMzNy44LTEgMjYuNi0zMy43IDM4LjktMzMuNyA0LjMgMCA2LjMgMi42IDYuMyA2LjEgMCA1LjgtNC41IDE4LjgtMTguMyAyN2wyMy4yIDMyLjdjMi4xIDMgNi44IDMuMiA2LjggNi40em01LjUuNXYtLjdjMC0yLjkgNS41LTIuOSA1LjUtOC4yVjQ4MGMwLTUuOS01LjUtNy4xLTUuNS05LjR2LS4zYzAtMS4xLjktMS42IDIuMy0yLjNsMTEuNy01LjhjMy4yLTEuNSA0LjggMCA0LjggMi4xdjYxLjJjMCA1LjMgNi4xIDUuMyA2LjEgOC4ydi43YzAgMS4yLTEuNCAxLjktMy4yIDEuOWgtMTguOGMtMS44IDAtMi45LS43LTIuOS0xLjl6bTEuNS05NS4zYzAtNS42IDQtOS42IDEwLjMtOS42czkuOSA0IDkuOSA5LjYtNCA5LjUtOS45IDkuNS0xMC4zLTMuOC0xMC4zLTkuNXptMTA5LjYgOTQuOHYuNmMwIDEuMi0xLjIgMi0zLjIgMmgtMTguMmMtMiAwLTMuMi0uOC0zLjItMnYtLjZjMC0yLjkgNS44LTIuOSA1LjUtOC40bC0xLjUtMzAuNWMtLjgtMTguNi04LjMtMjcuNS0xOC44LTI3LjVzLTE5LjEgOS0xOS4xIDIxLjF2MzcuMWMwIDUuMyA2LjEgNS4zIDYuMSA4LjJ2LjZjMCAxLjItMS4yIDItMy4yIDJoLTE5Yy0xLjkgMC0zLjEtLjgtMy4xLTJ2LS42YzAtMi45IDYtMi45IDYtOC4ydi00Ni4zYzAtNi41LTYuNC02LjItNi40LTl2LS40YzAtMS4xLjktMS43IDIuNC0yLjNsMTEuNC01LjVjMi45LTEuNSA0LjMgMCA0LjMgMi4zdjExLjFjNC40LTguNSAxMy4zLTE0IDIzLjgtMTQgMTUgMCAyNy41IDEwIDI5IDMzLjdsMS43IDMwLjFjLjMgNS42IDUuNSA1LjYgNS41IDguNXptODEuNi4zdi41YzAgMS0uOCAxLjYtMi4zIDEuNmgtMTIuOGEyLjUgMi41IDAgMCAxLTIuNi0yLjRsLS4zLTcuNmMtNS4yIDcuNi0xNC4yIDExLjYtMjMuMiAxMS42LTE4LjYgMC0zNS4yLTE1LjEtMzUuMi0zOC4zczE1LjQtMzggMzUuNy0zOGEyOC42IDI4LjYgMCAwIDEgMjIuMSA5Ljl2LTMzLjNjMC02LjQtNi40LTYuMi02LjQtOXYtLjNjMC0xLjIuOS0yIDIuMy0yLjZsMTIuMy00LjFjMy4yLTEuMiA0LjgtLjMgNC44IDIuM3YxMDEuMmMwIDUuNSA1LjYgNS45IDUuNiA4LjV6bS0xOC42LTIzLjNoLjF2LTIzLjFjMC05LjctOS44LTIxLjMtMjIuMy0yMS4zUzgwNy4xIDQ3Ny45IDgwNyA0OTVjLS4zIDIwLjkgMTAuMSAzNy43IDI1LjMgMzcuOCA4LjcgMCAxOS40LTcuMyAxOS40LTIxLjl6bTEwNC42IDIzdi42YzAgMS4yLTEuMiAyLTMuMiAySDkzNWMtMiAwLTMuMi0uOC0zLjItMnYtLjZjMC0yLjkgNS44LTIuOSA1LjUtOC40bC0xLjYtMzAuNWMtLjctMTguNi04LjItMjcuNS0xOC43LTI3LjVzLTE5LjEgOS0xOS4xIDIxLjF2MzcuMWMwIDUuMyA2LjEgNS4zIDYuMSA4LjJ2LjZjMCAxLjItMS4yIDItMy4yIDJoLTE5LjFjLTEuOCAwLTMtLjgtMy0ydi0uNmMwLTIuOSA1LjktMi45IDUuOS04LjJ2LTQ2LjNjMC02LjUtNi40LTYuMi02LjQtOXYtLjRjMC0xLjEuOS0xLjcgMi41LTIuM2wxMS40LTUuNWMyLjktMS41IDQuMyAwIDQuMyAyLjN2MTEuMWM0LjQtOC41IDEzLjMtMTQgMjMuOC0xNCAxNC45IDAgMjcuNCAxMCAyOSAzMy43bDEuNyAzMC4xYy4zIDUuNiA1LjQgNS42IDUuNCA4LjV6bTcyLjEtMTcuOWMtMiA5LjItMTEuNSAyMS45LTMwLjMgMjEuOS0yMS4yIDAtMzYuNi0xNS42LTM2LjYtMzguOHMxNS4zLTM3LjQgMzYuNS0zNy41YzE1LjMtLjIgMjYuOCA3LjEgMjYuOCAyMC4zIDAgMTAuNS05LjYgMTktMjMuOSAyMS45LTkuOCAxLjktMTguMyAxLjQtMjUuOC44IDMuNCAxNC4zIDEzLjEgMjMuNSAyNi42IDIzLjUgMTEuNiAwIDE4LjktNiAyMi4xLTEzLjMgMS40LTIuMSA0LjktMS43IDQuNiAxLjJ6bS01NC41LTIyLjRhNTAuNyA1MC43IDAgMCAwIC4zIDUuNWM2LjkuNSAxNiAuOCAyNC4xLS45czEzLjctNi42IDEzLjYtMTYuMy02LjctMTUuMS0xNi4yLTE1LjFjLTEzLjEgMC0yMS44IDEyLTIxLjggMjYuOHptNjEuNSAyNi43YzAtMy42IDIuNC01LjYgNS45LTUuNiA5LjUgMCA0LjYgMTguNiAyNSAxOC42IDkuOCAwIDE3LjQtNC43IDE3LjQtMTMuNCAwLTIyLjUtNDYuNy03LjQtNDYuNy0zNy40IDAtMTEuOCAxMS45LTIwLjkgMjguNy0yMC45IDE5IDAgMjkuOCA5LjcgMjkuOCAxOGE1LjQgNS40IDAgMCAxLTUuNSA1LjNjLTguNyAwLTQuOS0xOC42LTIzLjctMTguNi04LjggMC0xNS43IDUuNy0xNS43IDEzLjMgMCAyMiA0Ni42IDcgNDYuNiAzNy41IDAgMTEuNS0xMS45IDIwLjYtMzAuOSAyMC42cy0zMC45LTEwLjItMzAuOS0xNy40em02OS4yIDBjMC0zLjYgMi41LTUuNiA2LTUuNiA5LjQgMCA0LjYgMTguNiAyNSAxOC42IDkuOCAwIDE3LjQtNC43IDE3LjQtMTMuNCAwLTIyLjUtNDYuNy03LjQtNDYuNy0zNy40IDAtMTEuOCAxMS45LTIwLjkgMjguNy0yMC45IDE4LjkgMCAyOS43IDkuNyAyOS43IDE4YTUuMyA1LjMgMCAwIDEtNS4zIDUuM2gtLjFjLTguNyAwLTQuOS0xOC42LTIzLjctMTguNi04LjggMC0xNS43IDUuNy0xNS43IDEzLjMgMCAyMiA0Ni41IDcgNDYuNSAzNy41IDAgMTEuNS0xMS45IDIwLjYtMzAuOCAyMC42cy0zMS0xMC4yLTMxLTE3LjR6bS02NTgtNDU1LjJzMS42LTQwLjIgMTEuNC01NS45bC03Ni41IDE0LjJjOS44IDcuNiAxMi43IDIwLjMgMTIuOCAzNy4ybC45IDIyMWMwIDEyLjYgMCAxOS44LTEzLjMgMjhoNzVzLTkuNS04LjYtOS41LTI4Ljh6bTUxNi41IDI0NC41Yy0xNS43LTcuNS0xNC0yMC42LTE0LjEtMzIuOFYxNjdjMC0zMi0xNS40LTU5LjktNTQtNjQuNC0zMC4zLTQtMTAyLjYgNy40LTEwMi42IDcuNHY2Mi4yYzM2LjktMjEuMSA1MS42LTIyLjkgNjUuNi0yMi45IDE2LjctLjEgMzIuNSA5LjIgMzIuNSAyMC44IDAgMTYuMi0yMy45IDEzLjYtNDQuOSAxNi40LTMwLjIgNC03MC4yIDIwLjctNzAuMiA2Mi41czI0LjMgNjYuMSA2MS4zIDY2LjFjNDMgMCA1OS0xOS4xIDU5LTE5LjF2MTMuNnptLTEyOS40LTU4LjdjLS4xLTE1LjYgMTIuNi0yMy41IDI4LTI2LjlhMjM2IDIzNiAwIDAgMSAzMS4zLTQuNWMtMS43IDY4LjUtNTkuMiA2MC45LTU5LjMgMzEuNHptMzMxLjQgMjYuNC0uNS0xMDdjMC0zNi40LTI4LTYwLjItNzEtNjAuMi0zNi40IDAtNDguNSAxNy44LTQ5LjkgMTguOFY1LjZsLTcwLjIgMTQuMmM5LjkgMTYuMiA5LjQgMjQuMSA5LjUgMzQuOWwuOSAyMTRjLS4xIDkuMiAyLjIgMzItMTIgNDAuOWg4MWMtMTEuMS0xMi4xLTExLjEtMjcuNy0xMS4xLTM5LjRsLS40LTgxLjFjMC0xNS4zIDguOC0zMy4yIDMwLjItMzMuMiAyOS43IDAgMzQuOSAyMC4yIDM0LjkgMzIuOWwuNCA4OC43YzAgMTQtMi4zIDIyLjktOS4xIDMyLjFoNzcuMmMtMTAuNS04LTkuOS0yNS45LTkuOS0zMi4zTTc2MC4yIDE2OS4yYzAtMjkuMy0yNC41LTU1LjItNTcuOC01NXMtNTkuNiAyNy41LTU5LjYgMjcuNS0xMS4yLTIyLTQyLjgtMjUuN2MtOS42LTEuMS0xNS45LS45LTI2LjQuNC0yNy41IDMuNS00MC4xIDIxLjEtNDAuMSAyMS4xdi0yMy43bC02Mi43IDEwLjdjMTAuNiA3LjEgMTAuNyAxMS41IDEwLjcgMzguNGwuNSAxMjEuNGMwIDguNi0yLjMgMjAuNi05LjEgMjUuM0g1NDZjLTguMy0xMC40LTkuNS0xNS43LTkuNS0yNy45bC0uMS05Ny45YzAtMTAuOSAxMy4xLTE5LjYgMjguNi0xOS43czI5LjIgNy4yIDI5LjIgMjIuMWwuNCA5Ny42YzAgMTQuNy4xIDE4LjgtNi45IDI1LjhoNjguNWMtNy42LTcuNS04LjQtMTMuNy04LjQtMjQuOWwtLjItOTkuOGMwLTEyLjMgMTUtMjEuMiAyOC45LTIxLjIgMTYtLjEgMzEuNSA3IDMxLjUgMjUuOGwuNCA5Mi43YzAgMTAtMS4xIDE4LjctOS4yIDI3LjRoNjkuNGMtNS4zLTcuNS04LjEtMTIuOC04LjEtMjguOGwtLjMtMTExLjZ6bS0zOTkuNi01Ni44LTY0IDExLjNjNyA5LjMgOC4yIDExLjYgOC4yIDI3LjlsLjUgMTI1LjZjMCAxOC03LjUgMjcuNS0xMC4zIDMyLjRoNzUuNWMtOS41LTkuNC05LjktMTcuMi05LjktMzYuMVYxMTIuNHptLTY2LjM2Ny01Mi40MzYgMzUuMjg1LTM1LjI4NSAzNS4yODUgMzUuMjg1LTM1LjI4NSAzNS4yODV6TTE0NSAuN2MtNDEuOC0zLjktODIuMSA5LjItOTkuMiAxMC41LTQxLjEgMy4yLTQ1LjggMC00NS44IDAgMTguMyAyMi42IDE2LjUgNDYuNCAxNi41IDY5LjF2MTYxLjRjMCAyMi43IDEuOCA0Ni40LTE2LjUgNjkuMSAwIDAgNC43LTMuMiA0NS44IDAgMTcuMSAxLjMgNTcuNCAxNC40IDk5LjIgMTAuNHMxMzguOS0yNyAxMzguOS0xNjAuMlMxODYuOCA0LjcgMTQ1IC43em0tMjguNyAyNjUuMmMtMTMuNS0uMS0yNC45LTIuNS0zNi00LjhWNjAuOWMxMS4xLTIuNCAyMi41LTQuOCAzNi00LjggNTAuNi0uMiA5Ni44IDI0IDk2LjggMTA0LjlzLTQ2LjIgMTA1LjEtOTYuOCAxMDQuOXoiDQovPg0KPC9zdmc+"
                  />
                </div>
              </a>
              <h1
                style="
                  max-width: 490px;
                  padding: 45px 0;
                  margin: auto;
                  font-family: Alice;
                  font-size: 24px;
                  font-weight: 400;
                  line-height: 120%;
                  color: #e3dfde;
                "
              >
                Your funding is successfully received. Thank you for supporting
                us!
              </h1>
            </div>
            <div role="main">
              <div
                style="
                  background: #e3dfde;
                  border-radius: 15px;
                  padding: 53px 46px;
                "
              >
                <div
                  style="
                    font-family: Roboto;
                    font-size: 20px;
                    line-height: 140%;
                    letter-spacing: -0.02em;
                    text-align: left;
                    color: #000;
                  "
                >
                  <p>Dear James,</p>
                  <p style="white-space: pre-line">
                    This is just a quick email to say that we’ve received your
                    payement. Be sure that money will be spent for good deeds
                    and you are appreciated contributor. Thank you for your
                    kindness. If you have any questions or suggestions, don’t
                    hesitate to drop an email at
                    <a
                      href="mailto:dilmah@support.com"
                      style="
                        font-style: italic;
                        border-bottom: 1px solid #4e878a;
                        text-decoration: none;
                        color: #4e878a;
                      "
                      >dilmah@support.com</a
                    >
                    and we’ll be happy to assist. Truly yours, Dilmah Team
                  </p>
                </div>
              </div>

              <div
                style="
                  background: #e3dfde;
                  border-radius: 15px;
                  padding: 53px 46px;
                  margin-top: 20px;
                  font-size: 24px;
                "
              >
                <div
                  style="
                    font-family: Roboto;
                    line-height: 120%;
                    letter-spacing: -0.02em;
                    text-align: left;
                    color: #2b4b50;
                  "
                >
                  <h2 style="font-weight: 600; line-height: 140%">
                    Funding Summary
                  </h2>
                  <div
                    style="
                      display: flex;
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                      padding-top: 40px;
                    "
                  >
                    <div style="display: inline-flex; gap: 3px">
                      Basic
                      <div style="width: 20px; height: 20px">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 34.2 34.7"
                          fill="none"
                          stroke="#2b4b50"
                          stroke-linecap="round"
                          stroke-width="1.5"
                          length="100%;"
                          height="100%"
                        >
                          <path
                            d="m12.4 19.5 2.8-.9m0 0s1.6-4.4 4.1-5.5 5.3 1.2 7.5 1.2a42 42 0 0 0 6.2-.7s-3.2 8.8-8.6 9.5-9.2-4.5-9.2-4.5zm0 0a45 45 0 0 1 6.4-1.1c1.6-.1 4.1 0 4.1 0M10.6 16.7a21.3 21.3 0 0 1 1.6 2.5 11.5 11.5 0 0 1 .4 7.1c-.5 3.3-3.8 7.7-3.8 7.7m1.8-17.3s-4.7-.4-6.4-2.5-.2-5.4-.7-7.6S2.1 2.8 1.2.9c0 0 9.3.8 11.4 5.7s-2 10.1-2 10.1zm0 0a44.1 44.1 0 0 1-2.8-5.8 25.9 25.9 0 0 1-.9-4"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>&#36;25</div>
                  </div>
                  <div
                    style="
                      display: flex;
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                      padding-top: 15px;
                    "
                  >
                    <div>Tax</div>
                    <div>&#36;0</div>
                  </div>
                  <hr
                    style="
                      margin-top: 15px;
                      border: 1px solid rgba(43, 75, 80, 0.3);
                    "
                  />
                  <div
                    style="
                      display: flex;
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                      padding-top: 15px;
                      font-size: 28px;
                      font-weight: 600;
                    "
                  >
                    <div>Total</div>
                    <div>&#36;25</div>
                  </div>
                </div>
              </div>
              <div
                style="
                  background: #e3dfde;
                  border-radius: 15px;
                  padding: 53px 46px;
                  margin-top: 20px;
                  font-size: 24px;
                "
              >
                <div
                  style="
                    font-family: Roboto;
                    letter-spacing: -0.02em;
                    text-align: left;
                    color: #2b4b50;
                  "
                >
                  <h3 style="font-weight: 600; line-height: 120%">
                    Billing Details
                  </h3>
                  <address
                    style="
                      font-style: normal;
                      line-height: 120%;
                      white-space: pre-line;
                    "
                  >
                    Smiles Davis 600 Montgometry Str San Francisco, CA 94111
                    United States
                  </address>
                </div>
              </div>
            </div>
            <div style="display: flex; float: right; justify-content: flex-end">
              <div style="width: auto; height: 125px; margin-top: -100px">
                <img
                  style="width: 100%; height: 100%"
                  src="https://dilmahtea.me/images/greenLeaf3.webp"
                  alt="tea-leaf-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display: block">
      <div
        style="
          max-width: 490px;
          padding: 40px 0;
          margin: auto;
          gap: 15px;
          font-family: Roboto;
          font-size: 16px;
          font-weight: 500;
          line-height: 162%;
          text-align: center;
          color: #e3dfde;
        "
        role="contentinfo"
      >
        <div
          style="
            display: flex;
            flex-wrap: no-wrap;
            justify-content: center;
            gap: 3px;
          "
        >
          <a
            href="#"
            style="
              text-underline-offset: 2px;
              text-decoration: underline;
              -webkit-text-decoration-color: rgba(227, 223, 222, 0.5);
              text-decoration-color: rgba(227, 223, 222, 0.7);
              color: #e3dfde;
            "
            >Privacy Policy</a
          >
          <span>|</span>
          <a
            href="#"
            style="
              text-underline-offset: 2px;
              text-decoration: underline;
              -webkit-text-decoration-color: rgba(227, 223, 222, 0.5);
              text-decoration-color: rgba(227, 223, 222, 0.7);
              color: #e3dfde;
            "
            >Contact Support</a
          >
        </div>
        <div style="margin-top: 15px">
          323 Montgomery Str, Suite 234, Dpt 2354, San Francisco, CA 94111
        </div>
        <div style="margin-top: 15px">
          © 2022 Dilmah Ceylon Tea Company PLC.
        </div>
      </div>
    </div>
  </body>
</html>

`
const sendEmail = async () => {
  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: 'cmshaki@outlook.com', name: 'Cris Shaki' }],
        },
      ],
      from: {
        email: 'hello@dilmahtea.me',
        name: 'Dilmah Tea',
      },
      subject: 'Funds Have Been Confirmed',
      content: [
        {
          type: 'text/html',
          value: htmlContent,
        },
      ],
    }),
  })
  const fetchEmail = await fetch(send_request).then((res) => res.json())
  return new Response(htmlContent, {
        headers: { "content-type": "text/html" },
    })
}

async function handleRequest() {
  const sentEmail = await sendEmail()
  return new Response(JSON.stringify(sentEmail), {
    headers: { 'content-type': 'text/plain' },
  })
}

addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') {
    return event.respondWith(
      new Response('Method Not Allowed', {
        status: 405,
      }),
    )
  }
  return event.respondWith(handleRequest())
})