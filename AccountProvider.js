import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
import { Identity } from "./Identity.js";
import { hasAccess } from "./hasAccess.js";

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
  const account = useMemo(() => isBrowser && initIdentity(rest), []);
  const [access, setAccess] = useState(null);
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
          hasAccess(session.sp_id, config.access).then((access) => {
            setAccess(access);
          });
        }
      })
      .catch(() => {
        setAccess(false);
        setIsLoggedIn(false);
      });
  }, [account]);

  const value = useMemo(
    () => ({
      hasAccess: access,
      account,
      user,
      isLoggedIn,
    }),
    [access, account, user, isLoggedIn]
  );

  return React.createElement(
    AccountContext.Provider,
    {
      value,
    },
    children
  );
};
