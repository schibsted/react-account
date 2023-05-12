import React, {
  createContext,
  useEffect,
  useState,
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
  const account = useMemo(() => isBrowser && initIdentity(config), []);
  const [session, setSession] = useState({
    access: null,
    isLoggedIn: null,
    user: null,
  });

  useIsomorphicLayoutEffect(() => {
    if (!account) {
      return;
    }

    account
      .hasSession()
      .then((session) => {
        if (session.result) {
          hasAccess(session.sp_id, config.access).then((access) => {
            setSession({ user: session, isLoggedIn: true, access });
          });
        }
      })
      .catch(() => {
        setSession({ user: null, isLoggedIn: false, access: false });
      });
  }, [account]);

  const value = useMemo(
    () => ({
      hasAccess: session.access,
      account,
      user: session.user,
      isLoggedIn: session.isLoggedIn,
    }),
    [session.access, account, session.user, session.isLoggedIn]
  );

  return React.createElement(
    AccountContext.Provider,
    {
      value,
    },
    children
  );
};
