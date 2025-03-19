import { AccessToken, TokenCredential } from "@azure/identity";

export const GetTokenCredential = (token: AccessToken) => {
  const tokenCredential: TokenCredential = {
    getToken: async () => token,
  };
  return tokenCredential;
};
