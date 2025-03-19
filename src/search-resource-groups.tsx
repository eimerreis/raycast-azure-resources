import { List, ActionPanel, Action } from "@raycast/api";
import { GetResourceGroups } from "./lib/azure/azure";
import { PropsWithFetchArgs, withFetchArgs } from "./with-fetch-args";
import { ResourceGroupDetail } from "./resource-group-detail";
import { useCachedPromise, useFrecencySorting } from "@raycast/utils";

interface ResourceGroup {
  name?: string;
  id?: string;
  location?: string;
}

const ListResourceGroups: React.FC<PropsWithFetchArgs> = ({ fetchArgs }) => {
  const { data: groups, isLoading } = useCachedPromise(async () => {
    const result: ResourceGroup[] = [];
    for await (const group of GetResourceGroups(fetchArgs)) {
      result.push(group as ResourceGroup);
    }
    return result;
  });
  const { data: sortedData, visitItem } = useFrecencySorting<ResourceGroup>(groups, { key: (item) => item.name! });

  return (
    <List
      navigationTitle={`Current Subscription: ${fetchArgs.subscriptionName}`}
      isLoading={isLoading}
      searchBarPlaceholder="Search Resource Groups..."
    >
      {sortedData?.map((group) => (
        <List.Item
          key={group.id}
          title={group.name || "Unknown Group"}
          subtitle={group.location}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Resources"
                onPush={() => visitItem(group)}
                target={<ResourceGroupDetail groupName={group.name || ""} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default withFetchArgs(ListResourceGroups);
