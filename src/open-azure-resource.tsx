import { LaunchProps, popToRoot, showToast, Toast, open } from "@raycast/api";
import { PropsWithFetchArgs, withFetchArgs } from "./with-fetch-args";
import { useCachedPromise } from "@raycast/utils";
import { FetchResourceByName, GenerateAzurePortalUrl } from "./lib/azure";

type Arguments = {
  resourceName: string;
};

type Props = PropsWithFetchArgs & LaunchProps<{ arguments: Arguments }>;

const OpenAzureResource: React.FC<Props> = ({ arguments: { resourceName }, fetchArgs }) => {
  const { data, isLoading } = useCachedPromise(() => FetchResourceByName(resourceName, fetchArgs));

  if (isLoading) return null;

  if (data === undefined) {
    showToast({
      title: "Resource not found",
      message: `Resource with name "${resourceName}" not found.`,
      style: Toast.Style.Failure,
    });
    popToRoot();
    return null;
  }

  open(GenerateAzurePortalUrl(data.id!));
};

export default withFetchArgs(OpenAzureResource);
