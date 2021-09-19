export interface MetricPublishable {
  publishSuccessMetric(): Promise<void>
  publishFailureMetric(): Promise<void>
}
