import { getPreferenceValues } from "@raycast/api";

type Preferences = {
  azCliPath: string;
  clientId?: string,
  tenantId?: string;
};

export const GetPreferences = () => {
  return getPreferenceValues<Preferences>();
};
