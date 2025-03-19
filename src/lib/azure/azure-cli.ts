import { spawnSync } from "node:child_process";
import { GetPreferences } from "../preferences";

const { azCliPath } = GetPreferences();

export const az = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  // Combine the strings and values into a single command string
  const command = strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");

  // Split the command into arguments
  const args = command.trim().split(/\s+/);

  const { stdout, stderr } = spawnSync(azCliPath, args);

  // Check for errors
  if (stderr?.length > 0) {
    throw new Error(`Error executing command: ${stderr.toString()}`);
  }

  // Return the command output
  return stdout.toString();
};

export const azAccountGetCurrentSubscription = () => {
  return az`account show --query id`.trim().replaceAll('"', "");
};

export interface AzAccountShowResult {
  environmentName: string;
  homeTenantId: string;
  id: string;
  isDefault: boolean;
  name: string;
  state: string;
  tenantDefaultDomain: string;
  tenantDisplayName: string;
  tenantId: string;
  user: {
    name: string;
    type: string;
  };
}

export const azAccountShow = () => {
  return JSON.parse(az`account show`) as AzAccountShowResult;
};

export const azAccountGetAccessToken = () =>
  az`account get-access-token --resource-type arm --resource https://management.azure.com`;
