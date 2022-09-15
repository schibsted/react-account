import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";

function publishEvents() {
  window.dispatchEvent(
    new window.CustomEvent("identity-initialized", {
      detail: { ready: true },
    })
  );
}

function initIdentity(Identity, { identity, varnish }) {
  const instance = new Identity(identity);
  window.Identity = instance;
  varnish && identity.enableVarnishCookie(varnish);

  instance
    .hasSession()
    .then(publishEvents)
    .catch(() => false);

  return instance;
}

const useIsomorphicLayoutEffect =
  typeof window != "undefined" ? useLayoutEffect : useEffect;

export const AccountContext = createContext();

export const AccountProvider = ({ Identity, config, children }) => {
  const account = useMemo(
    () => typeof window != "undefined" && initIdentity(Identity, config),
    []
  );
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
      value: value,
    },
    children
  );
};
