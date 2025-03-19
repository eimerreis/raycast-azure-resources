import { Clipboard } from "@raycast/api";
import { TokenCredential } from "@azure/identity";
import { useAzureCli } from "./use-azure-cli";
import { ParseAzureCliToken } from "../../azure/parse-azure-cli-token";
import { GetTokenCredential } from "../../azure/get-token-credential";

type Result = Omit<ReturnType<typeof useAzureCli>, "data"> & { credential: TokenCredential | undefined };

export const useAzureCliCredential = (): Result => {
  const { data, ...query } = useAzureCli(
    "account get-access-token --resource-type arm --resource https://management.azure.com",
  );
  // todo: test output of azure cli is not logged in

  if (query.isLoading || !data) return { ...query, credential: undefined };
  const asAccessToken = ParseAzureCliToken(data);
  const credential = GetTokenCredential(asAccessToken);
  data && Clipboard.copy(data);

  return {
    ...query,
    credential,
  };
};
