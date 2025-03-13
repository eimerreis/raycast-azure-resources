import { Action, ActionPanel, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { FetchGroupResources } from "./lib/azure";
import { PropsWithFetchArgs, withFetchArgs } from "./with-fetch-args";

type Props = {
  groupName: string;
} & PropsWithFetchArgs;

const Component: React.FC<Props> = ({ groupName, fetchArgs }) => {
  const { data: resources, isLoading } = useCachedPromise(() => FetchGroupResources(groupName, fetchArgs));

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Resources...">
      {resources?.map((resource) => (
        <List.Item
          key={resource.id}
          title={resource.name!}
          subtitle={resource.type}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open in Portal" url={`https://portal.azure.com/#resource${resource.id}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export const ResourceGroupDetail = withFetchArgs(Component);
