/* eslint-disable no-unused-vars */
import { Metrics } from '../types';

export interface MetricReadable {
  getMetrics(): Promise<Metrics>
}
