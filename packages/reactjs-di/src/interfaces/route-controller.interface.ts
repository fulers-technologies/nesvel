/**
 * Controller class that can handle route logic
 */
export interface RouteController {
  /** Optional loader function for data fetching */
  loader?(...args: any[]): any;
  /** Optional action function for mutations */
  action?(...args: any[]): any;
}
