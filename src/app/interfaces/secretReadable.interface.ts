/* eslint-disable no-unused-vars */

export interface SecretReadable {
  getSecretsByName(): Promise<Record<string, string>>
}
