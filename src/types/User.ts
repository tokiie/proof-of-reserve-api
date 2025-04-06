/**
 * User interface representing a user account with an id and balance
 */
export interface User {
  /** Unique identifier for the user */
  id: number;

  /** Current balance of the user's account */
  balance: number;
}