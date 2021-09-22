/* eslint-disable no-unused-vars */

export interface MetricPublishable {
  updateSuccessMetric(): Promise<void>
  updateFailureMetric(): Promise<void>
}
