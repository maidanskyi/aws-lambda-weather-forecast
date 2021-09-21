export interface MetricPublishable {
  updateSuccessMetric(): Promise<void>
  updateFailureMetric(): Promise<void>

}
