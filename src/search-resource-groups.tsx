import { List, ActionPanel, showToast, Toast, Icon, Color, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import { FetchResourceGroups } from "./lib/azure";
import { PropsWithFetchArgs, withFetchArgs } from "./with-fetch-args";
import { ResourceGroupDetail } from "./resource-group-detail";

interface ResourceGroup {
  name?: string;
  id?: string;
  location?: string;
}

const ListResourceGroups: React.FC<PropsWithFetchArgs> = ({ fetchArgs }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<ResourceGroup[]>([]);

  useEffect(() => {
    async function fetchResourceGroups() {
      try {
        const result = [];
        for await (const group of FetchResourceGroups(fetchArgs)) {
          result.push(group);
        }
        setGroups(result);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error fetching resource groups",
          message: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchResourceGroups();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Resource Groups...">
      {groups.map((group) => (
        <List.Item
          key={group.id}
          icon={{ source: Icon.Circle, tintColor: Color.Blue }}
          title={group.name || "Unknown Group"}
          subtitle={group.location}
          actions={
            <ActionPanel>
              <Action.Push title="View Resources" target={<ResourceGroupDetail groupName={group.name || ""} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default withFetchArgs(ListResourceGroups);
