import { Action, ActionPanel, List, Detail, Icon } from "@raycast/api";
import { useCachedPromise, useFrecencySorting } from "@raycast/utils";
import { GetResourcesInResourceGroup } from "./lib/azure/azure";
import { PropsWithFetchArgs, withFetchArgs } from "./with-fetch-args";
import { GenericResourceExpanded } from "@azure/arm-resources";
import { GetPreferences } from "./lib/preferences";

const { showResourceDetailsInList } = GetPreferences();

type Props = {
  groupName: string;
} & PropsWithFetchArgs;

const Component: React.FC<Props> = ({ groupName, fetchArgs }) => {
  const { data: resources, isLoading } = useCachedPromise(() => GetResourcesInResourceGroup(groupName, fetchArgs));
  const { data: sortedData, visitItem } = useFrecencySorting(resources, {
    key: (item) => item.name!,
  });

  return (
    <List
      navigationTitle={`Current Subscription: ${fetchArgs.subscriptionName}`}
      isShowingDetail={showResourceDetailsInList}
      isLoading={isLoading}
      searchBarPlaceholder="Search Resources..."
    >
      {sortedData?.map((resource) => (
        <List.Item
          key={resource.id}
          title={resource.name!}
          subtitle={resource.type}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="ID" text={resource.id!} />
                  <List.Item.Detail.Metadata.Label title="Name" text={resource.name} />
                  <List.Item.Detail.Metadata.Label title="Type" text={resource.type} />
                  <List.Item.Detail.Metadata.Label title="Location" text={resource.location!} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Kind" text={resource.kind} />
                  <List.Item.Detail.Metadata.Label title="SKU" text={resource.sku?.name} />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel title={resource.name!}>
              <Action.Push
                onPush={() => visitItem(resource)}
                title="Show Resource Details"
                target={<AzureResourceDetails resource={resource} />}
                icon={{ source: Icon.Info, tintColor: "blue" }}
              />
              <Action.OpenInBrowser
                onOpen={() => visitItem(resource)}
                title="Open in Portal"
                url={`https://portal.azure.com/#resource${resource.id}`}
              />
              <Action.CopyToClipboard
                onCopy={() => visitItem(resource)}
                shortcut={{ key: "c", modifiers: ["cmd"] }}
                title="Copy Id to Clipboard"
                content={resource.id!}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export const ResourceGroupDetail = withFetchArgs(Component);

const AzureResourceDetails = withFetchArgs<PropsWithFetchArgs & { resource: GenericResourceExpanded }>(
  ({ fetchArgs, resource }) => {
    return (
      <Detail
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label title="ID" text={resource.id!} />
            <Detail.Metadata.Label title="Name" text={resource.name} />
            <Detail.Metadata.Label title="Type" text={resource.type} />
            <Detail.Metadata.Label title="Location" text={resource.location!} />
            <Detail.Metadata.Separator />
            {resource.kind && <Detail.Metadata.Label title="Kind" text={resource.kind} />}
            {resource.sku?.name && <Detail.Metadata.Label title="SKU" text={resource.sku?.name} />}
          </Detail.Metadata>
        }
      />
    );
  },
);
