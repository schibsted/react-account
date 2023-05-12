import { useContext, useCallback } from "react";

import { AccountContext } from "./AccountProvider.js";

export const useAccount = () => {
  const context = useContext(AccountContext);

  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }

  const { account, hasAccess, isLoggedIn, user } = context;

  const login = useCallback(
    function login({
      redirectUri = window.location.href,
      state = Math.random().toString(16),
    }) {
      account.login({ redirectUri, state });
    },
    [account]
  );

  const logout = useCallback(
    function logout() {
      account.logout();
    },
    [account]
  );

  return {
    hasAccess,
    isLoggedIn,
    login,
    logout,
    user,
  };
};
