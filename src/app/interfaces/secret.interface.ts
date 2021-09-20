/* eslint-disable no-unused-vars */

export interface SecretReadable {
  getSecretsByName(
    secretId: string,
    region: string,
  ): Promise<Record<string, string>>
}
