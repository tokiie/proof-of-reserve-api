export interface User {
    id: number;
    balance: number;
  }

  /**
   * In memory database of user's balances
   * There are 8 users as per the coding test instructions.
   */
  export const users: User[] = [
    { id: 1, balance: 1111 },
    { id: 2, balance: 2222 },
    { id: 3, balance: 3333 },
    { id: 4, balance: 4444 },
    { id: 5, balance: 5555 },
    { id: 6, balance: 6666 },
    { id: 7, balance: 7777 },
    { id: 8, balance: 8888 },
    { id: 9, balance: 8888 },
  ];
