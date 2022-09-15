import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
import { Identity } from "./Identity";

const isBrowser = window === "undefined";

function publishEvents() {
  window.dispatchEvent(
    new window.CustomEvent("identity-initialized", {
      detail: { ready: true },
    })
  );
}

function initIdentity({ identity, varnish }) {
  const instance = new Identity(identity);
  window.Identity = instance;
  varnish && instance.enableVarnishCookie(varnish);

  instance
    .hasSession()
    .then(publishEvents)
    .catch(() => false);

  return instance;
}

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export const AccountContext = createContext();

export const AccountProvider = ({ config, children }) => {
  const account = useMemo(() => isBrowser && initIdentity(config), []);
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

  return React.createElement(
    AccountContext.Provider,
    {
      value,
    },
    children
  );
};
