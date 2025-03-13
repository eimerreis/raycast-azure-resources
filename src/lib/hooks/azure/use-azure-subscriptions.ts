import { useAzureCli } from "./use-azure-cli";

export interface AzAccountListResponse {
  cloudName: string;
  homeTenantId: string;
  id: string;
  isDefault: boolean;
  managedByTenants: ManagedByTenant[];
  name: string;
  state: string;
  tenantId: string;
  user: User;
  tenantDefaultDomain?: string;
  tenantDisplayName?: string;
}

export interface ManagedByTenant {
  tenantId: string;
}

export interface User {
  name: string;
  type: string;
}

export const useAzureSubscriptions = () => {
  const { data, ...query } = useAzureCli("account list");
  return {
    ...query,
    subscriptions: data ? (JSON.parse(data) as AzAccountListResponse[]) : [],
  };
};
