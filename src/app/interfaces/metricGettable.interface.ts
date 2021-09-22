export interface MetricGettable {
  getMetrics(): Promise<[string, string]>
}
