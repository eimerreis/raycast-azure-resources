import { useAzureCli } from "./use-azure-cli";

export const useCurrentAzureSubscription = () => {
  const query = useAzureCli("account show --query id");
  return {
    ...query,
    subscriptionId: query.data?.trim().replaceAll('"', ""),
  };
};
