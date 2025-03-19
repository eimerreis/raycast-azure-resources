import { LaunchProps, open, showToast, Toast } from "@raycast/api";
import { GetResourceByName } from "./lib/azure/azure";
import { GetFetchArgs } from "./lib/azure/get-fetch-args";
import { GetResourceUrl } from "./lib/azure/get-resource-url";
import { az } from "./lib/azure/azure-cli";

type Arguments = {
  resourceName: string;
};

type Props = LaunchProps<{ arguments: Arguments }>;

const OpenAzureResource = async ({ arguments: { resourceName } }: Props) => {
  await showToast({ title: `Searching for resource ${resourceName}...`, style: Toast.Style.Animated });
  const fetchArgs = GetFetchArgs();
  const resource = await GetResourceByName(resourceName, fetchArgs);

  if (!resource) {
    const subscriptionName = az`account show --query name`.replace(/"/g, "");

    return await showToast({
      title: `Resource ${resourceName} not found in the subscription`,
      message: subscriptionName,
      style: Toast.Style.Failure,
    });
  }

  return open(GetResourceUrl(resource));
};

export default OpenAzureResource;
