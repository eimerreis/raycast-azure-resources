import { Clipboard } from "@raycast/api";
import { AccessToken, TokenCredential } from "@azure/identity";
import { useAzureCli } from "./use-azure-cli";

export interface AzureCLITokenResponse {
  accessToken: string;
  expiresOn: Date;
  expires_on: number;
  subscription: string;
  tenant: string;
  tokenType: string;
}

type Result = Omit<ReturnType<typeof useAzureCli>, "data"> & { credential: TokenCredential | undefined };

export const useAzureCliCredential = (): Result => {
  const { data, ...query } = useAzureCli(
    "account get-access-token --resource-type arm --resource https://management.azure.com",
  );
  // todo: test output of azure cli is not logged in

  if (query.isLoading || !data) return { ...query, credential: undefined };
  const jsonToken = JSON.parse(data) as AzureCLITokenResponse;
  const asAccessToken: AccessToken = {
    token: jsonToken.accessToken,
    expiresOnTimestamp: jsonToken?.expires_on,
    refreshAfterTimestamp: jsonToken?.expires_on - 60,
    tokenType: "Bearer",
  };

  data && Clipboard.copy(data);

  const tokenCredential: TokenCredential = {
    getToken: async () => asAccessToken,
  };

  return {
    ...query,
    credential: tokenCredential,
  };
};
