import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
import Identity from "@schibsted/account-sdk-browser/identity";

function publishEvents() {
  window.dispatchEvent(
    new window.CustomEvent("identity-initialized", {
      detail: { ready: true },
    })
  );
}

function initIdentity({ identity, varnish }) {
  const instance = new Identity(identity);
  window.SPiD_Identity = instance;
  varnish && identity.enableVarnishCookie(varnish);

  instance
    .hasSession()
    .then(publishEvents)
    .catch(() => false);

  return instance;
}

const useIsomorphicLayoutEffect = process?.browser
  ? useLayoutEffect
  : useEffect;

export const AccountContext = createContext();

export const AccountProvider = ({ children, config }) => {
  const account = useMemo(() => process.browser && initIdentity(config), []);
  const [user, setUser] = useState(null);

  useIsomorphicLayoutEffect(() => {
    if (!account) {
      return;
    }

    account
      .hasSession()
      .then((session) => {
        if (session.result) {
          setUser(session);
        }
      })
      .catch(() => {
        return false;
      });
  }, [account]);

  const value = useMemo(
    () => ({
      account,
      user,
    }),
    [account, user]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};
