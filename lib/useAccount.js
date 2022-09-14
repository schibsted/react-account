import React, { useContext } from "react";

import { AccountContext } from "./AccountProvider";

export const useAccount = () => {
  const { account, user } = useContext(AccountContext);

  function login(redirectUrl = window.location.href) {
    account.login({ redirectUrl, state: Math.random().toString(16) });
  }

  function logout() {
    account.logout();
  }

  return {
    login,
    logout,
    user,
  };
}
