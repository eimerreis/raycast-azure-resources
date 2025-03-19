import { FetchArgs } from "./azure";
import { azAccountGetAccessToken, azAccountGetCurrentSubscription } from "./azure-cli";
import { GetTokenCredential } from "./get-token-credential";
import { ParseAzureCliToken } from "./parse-azure-cli-token";

/**
 * Function to get the fetch args for "no-view" commands.
 * View commands can use the `withFetchArgs` HOC to get the fetch args.
 */
export const GetFetchArgs = (): FetchArgs => {
  const token = azAccountGetAccessToken();
  const asAccessToken = ParseAzureCliToken(token);
  const credential = GetTokenCredential(asAccessToken);
  const subscriptionId = azAccountGetCurrentSubscription();
  return { credential, subscriptionId };
};
