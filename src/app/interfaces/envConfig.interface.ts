export interface EnvConfigReadable {
  getPort(): number
  getNodeEnv(): string
  isProdEnv(): boolean
  isDevEnv(): boolean
  isTestEnv(): boolean
}
