import { List } from "@raycast/api";
import { FetchArgs } from "./lib/azure/azure";
import { useAzureCliCredential } from "./lib/hooks/azure/use-azure-cli-credential";
import { useCurrentAzureSubscription } from "./lib/hooks/azure/use-current-azure-subscription";
import { azAccountShow } from "./lib/azure/azure-cli";

export type PropsWithFetchArgs = { fetchArgs: FetchArgs };
export const withFetchArgs =
  <P extends object & PropsWithFetchArgs>(
    Component: React.ComponentType<P>,
  ): React.ComponentType<Omit<P, "fetchArgs">> =>
  (props: Omit<P, "fetchArgs">) => {
    const { credential, isLoading: tokenLoading } = useAzureCliCredential();
    const { subscriptionId, isLoading: subscriptionLoading } = useCurrentAzureSubscription();
    const { name } = azAccountShow();

    if (tokenLoading || subscriptionLoading || !credential) {
      return <List isLoading={true} searchBarPlaceholder="Loading..." />;
    }

    return <Component {...({ ...props, fetchArgs: { credential, subscriptionId, subscriptionName: name } } as P)} />;
  };
