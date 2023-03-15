/**
 * Might need this for interacting with the DIMASS SOAP API.
 * Probably not great code; but WIP anyway.
 */
export default function (nonceLength: number) {
  const actualNonceLength = nonceLength + 1;

  let result = "";

  const possibleCharacters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 1; i < actualNonceLength; i++) {
    result += possibleCharacters.charAt(
      Math.floor(Math.random() * actualNonceLength)
    );
  }
  return result;
}
