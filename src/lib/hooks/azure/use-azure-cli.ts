import { useExec } from "@raycast/utils";
import { GetPreferences } from "../../preferences";

const { azCliPath } = GetPreferences();

type Options = {
  execute?: boolean;
};

const defaultOptions: Options = {
  execute: true,
};

export const useAzureCli = (command: string, opts: Options = defaultOptions) => {
  return useExec(azCliPath, command.split(" "), opts);
};
