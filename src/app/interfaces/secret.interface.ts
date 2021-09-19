export interface SecretReadable {
  // eslint-disable-next-line no-unused-vars
  getSecretByKey(key: string): Promise<string>
}
