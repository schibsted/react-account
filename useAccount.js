import { useContext, useCallback } from "react";

import { AccountContext } from "./AccountProvider.js";

export const useAccount = () => {
  const { account, user } = useContext(AccountContext);

  const login = useCallback(
    function login(redirectUrl = window.location.href) {
      account.login({ redirectUrl, state: Math.random().toString(16) });
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
    account,
    login,
    logout,
    user,
  };
};
