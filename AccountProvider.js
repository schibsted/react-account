import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
import { Identity } from "./Identity.js";

const isBrowser = typeof window !== "undefined";

function publishEvents() {
  window.dispatchEvent(
    new window.CustomEvent("identity-initialized", {
      detail: { ready: true },
    })
  );
}

function initIdentity({ identity, varnish, pulse = false }) {
  const instance = new Identity(identity);
  window.Identity = instance;
  varnish && instance.enableVarnishCookie(varnish);

  const promise = instance.hasSession();

  if (pulse && window.pulse) {
    window.pulse("update", {
      actor: promise
        .then((session) => ({
          id: session.userId,
          realm: "spid.no",
        }))
        .catch(() => false),
    });
  }

  promise.then(publishEvents).catch(() => false);

  return instance;
}

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export const AccountContext = createContext();

export const AccountProvider = ({ config, children }) => {
  const account = useMemo(() => isBrowser && initIdentity(config), []);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
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
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, [account]);

  const value = useMemo(
    () => ({
      account,
      user,
      isLoggedIn,
    }),
    [account, user, isLoggedIn]
  );

  return React.createElement(
    AccountContext.Provider,
    {
      value,
    },
    children
  );
};
