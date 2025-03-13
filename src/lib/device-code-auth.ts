import { TokenCredential } from "@azure/identity";
import { Cache, Clipboard, open } from "@raycast/api";
import { GetPreferences } from "./preferences";
import invariant from "tiny-invariant";

export interface DeviceCodeTokenResponse {
  error: "authorization_pending" | "bad_verification_code" | "authorization_declined" | "expired_token";
  error_description: string;
  error_codes: number[];
  timestamp: Date;
  trace_id: string;
  correlation_id: string;
  error_uri: string;
}

const { clientId, tenantId } = GetPreferences();
const cache = new Cache();
const tokenCacheKey = "token-cache";
const scopes = ["https://management.azure.com/user_impersonation", "user.read", "offline_access"];

/**
 * Orchestrates device code authorization flow and returns a token credential
 * In the future this might be replaced with azure cli usage `az account get-access-token`.
 * This would require users to have the azure cli installed and login with it
 * @param clientId
 * @param tenantId
 * @returns
 */
export const GetTokenCredential = async (clientId: string, tenantId: string): Promise<TokenCredential> => {
  const cachedToken = getCachedToken(tokenCacheKey);
  if (!cachedToken) {
    const newToken = await DeviceCodeAuthorization(clientId, tenantId);
    return MapTokenToCredential(newToken);
  }

  return MapTokenToCredential(cachedToken);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCachedToken = (cacheKey: string) => {
  const cachedToken = cache.get(cacheKey);
  if (!cachedToken) {
    return null;
  }
  return JSON.parse(cachedToken) as TokenReponse;
};

const setCachedToken = (cacheKey: string, token: TokenReponse) => {
  cache.set(cacheKey, JSON.stringify(token));
};

const MapTokenToCredential = (token: TokenReponse): TokenCredential => {
  const tokenType = "Bearer";
  invariant(clientId, "client id must be set when using device code");
  invariant(tenantId, "tenant id must be set when using device code");

  return {
    getToken: async () => {
      if (token.expires_in < 60) {
        const newToken = await RefreshToken(clientId, tenantId, token);
        setCachedToken(tokenCacheKey, newToken);
        return {
          expiresOnTimestamp: newToken.expires_in,
          token: newToken.access_token,
          refreshAfterTimestamp: newToken.expires_in - 60,
          tokenType,
        };
      }
      return {
        expiresOnTimestamp: token.expires_in,
        token: token.access_token,
        refreshAfterTimestamp: token.expires_in - 60,
        tokenType,
      };
    },
  };
};

const DeviceCodeAuthorization = async (clientId: string, tenantId: string) => {
  const deviceCode = await DeviceAuthorizationRequest(clientId, tenantId);
  Clipboard.copy(deviceCode.user_code);
  await open(deviceCode.verification_uri);

  const token = await TokenRequest(clientId, tenantId, deviceCode.device_code);
  setCachedToken(tokenCacheKey, token);
  return token;
};

const RefreshToken = async (clientId: string, tenantId: string, token: TokenReponse) => {
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&client_id=${clientId}&refresh_token=${token.refresh_token}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to request token: ${response.statusText}`);
  }

  return response.json() as Promise<TokenReponse>;
};

type DeviceAuthorizationResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  message: number;
};

const DeviceAuthorizationRequest = async (clientId: string, tenantId: string) => {
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/devicecode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${clientId}&scope=${scopes.join(" ")}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.statusText}`);
  }

  return response.json() as Promise<DeviceAuthorizationResponse>;
};

type TokenReponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

const TokenRequest = async (clientId: string, tenantId: string, deviceCode: string) => {
  let response: Response;
  for (;;) {
    response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=${clientId}&device_code=${deviceCode}`,
    });

    const json = (await response.json()) as DeviceCodeTokenResponse;
    if (json.error && json.error === "authorization_pending") {
      console.log("Authorization still pending. Please complete the steps in the browser.");
      await sleep(3000);
      continue;
    }

    if (json.error && json.error === "authorization_declined") {
      throw new Error("Authorization declined");
    }

    if (json.error && json.error === "expired_token") {
      throw new Error("Token expired");
    }

    if (!response.ok) {
      throw new Error(`Failed to request token: ${response.statusText}`);
    }

    return json as unknown as Promise<TokenReponse>;
  }
};
