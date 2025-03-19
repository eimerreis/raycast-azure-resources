import { AccessToken } from "@azure/identity";

export interface AzureCLITokenResponse {
  accessToken: string;
  expiresOn: Date;
  expires_on: number;
  subscription: string;
  tenant: string;
  tokenType: string;
}

export const ParseAzureCliToken = (azLoginOutput: string) => {
  const jsonToken = JSON.parse(azLoginOutput) as AzureCLITokenResponse;
  const asAccessToken: AccessToken = {
    token: jsonToken.accessToken,
    expiresOnTimestamp: jsonToken?.expires_on,
    refreshAfterTimestamp: jsonToken?.expires_on - 60,
    tokenType: "Bearer",
  };

  return asAccessToken;
};
