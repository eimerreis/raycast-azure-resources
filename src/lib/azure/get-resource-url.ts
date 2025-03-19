import { GenericResourceExpanded } from "@azure/arm-resources";
import invariant from "tiny-invariant";

export const GetResourceUrl = (resource: GenericResourceExpanded) => {
  invariant(resource.id, "Resource ID is required to generate a URL");

  return `https://portal.azure.com/#resource${resource.id}`;
};
