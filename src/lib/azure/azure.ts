import { GenericResourceExpanded, ResourceManagementClient } from "@azure/arm-resources";
import { TokenCredential } from "@azure/identity";

export type FetchArgs = {
  credential: TokenCredential;
  subscriptionId: string;
  subscriptionName: string;
};

const apiVersion = "2024-04-01";

const CreateResourceManagementClient = (args: FetchArgs) => {
  const client = new ResourceManagementClient(args.credential, args.subscriptionId);
  return client;
};

export const GetResourceGroups = (args: FetchArgs) => {
  const client = CreateResourceManagementClient(args);
  return client.resourceGroups.list();
};

export const GetResourceGroupByName = async (name: string, args: FetchArgs) => {
  const client = CreateResourceManagementClient(args);
  return client.resourceGroups.get(name);
};

export const GetResourcesInResourceGroup = async (name: string, args: FetchArgs) => {
  const client = CreateResourceManagementClient(args);
  const result: GenericResourceExpanded[] = [];
  for await (const resource of client.resources.listByResourceGroup(name)) {
    result.push(resource);
  }
  return result;
};

export const FetchResources = (startsWith: string, args: FetchArgs) => {
  const filter = `$filter=substringof('${startsWith}', name)`;

  const client = CreateResourceManagementClient(args);
  return client.resources.list({ filter });
};

export const GetResourceById = async (id: string, args: FetchArgs) => {
  const client = CreateResourceManagementClient(args);
  return client.resources.getById(id, apiVersion);
};

export const GetResourceByName = async (name: string, args: FetchArgs) => {
  const client = CreateResourceManagementClient(args);

  for await (const resource of client.resources.list({ filter: `name eq '${name}'` })) {
    return resource;
  }
};

export const GenerateAzurePortalUrl = (resourceId: string) => {
  return `https://portal.azure.com/#resource${resourceId}`;
};
