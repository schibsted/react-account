import { useContext, useCallback } from "react";

import { AccountContext } from "./AccountProvider.js";

export const useAccount = () => {
  const { account, user, isLoggedIn } = useContext(AccountContext);

  const login = useCallback(
    function login({
      redirectUrl = window.location.href,
      state = Math.random().toString(16),
    }) {
      account.login({ redirectUrl, state });
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
    login,
    logout,
    user,
    isLoggedIn,
  };
};
