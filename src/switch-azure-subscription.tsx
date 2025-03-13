import { Action, ActionPanel, List, popToRoot, showToast } from "@raycast/api";
import { useAzureCli } from "./lib/hooks/azure/use-azure-cli";
import { AzAccountListResponse, useAzureSubscriptions } from "./lib/hooks/azure/use-azure-subscriptions";
import { useState } from "react";

const SwitchAzureSubscription = () => {
  const { subscriptions, isLoading } = useAzureSubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<string>();
  const { mutate } = useAzureCli(`account set --subscription ${selectedSubscription}`, { execute: false });

  const onSelect = (subscription: AzAccountListResponse) => {
    setSelectedSubscription(subscription.id);
    mutate();
    popToRoot({ clearSearchBar: true });
    showToast({ title: `switched to subscription ${subscription.name}` });
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Select an Azure Account">
      {subscriptions?.map((subscription) => (
        <List.Item
          key={subscription.id}
          title={subscription.name}
          subtitle={subscription.id}
          actions={
            <ActionPanel>
              <Action title="Select Subscription" onAction={() => onSelect(subscription)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default SwitchAzureSubscription;
