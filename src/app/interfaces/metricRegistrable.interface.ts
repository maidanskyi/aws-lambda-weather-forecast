/* eslint-disable no-unused-vars */
import { Metrics } from '../types';

export interface MetricRegistrable {
  formatMetrics(): Promise<[string, string]>
  setMetrics(metrics: Metrics): Promise<void>
}
