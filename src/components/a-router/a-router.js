import {
  h,
  customElement,
  Any,
  useRef,
  useHost,
  useEvent,
  useEffect,
  useState,
} from "atomico";

import { useHistory } from "../../hooks/use-router/use-router";
import { match, join } from "../../hooks/use-router/src/parse";
import { redirect } from "../../hooks/use-router/src/location";
import { useLazy } from "../../hooks/use-lazy/use-lazy";

const ARouterProxy = ({ path }) => {
  return (
    <host
      onclick={(event) => {
        let { target } = event;
        let href;
        while (target) {
          href = target.getAttribute("href");
          if (target.hasAttribute("ignore")) return;
          target = href ? 0 : target.parentElement;
        }
        event.preventDefault();
        if (href) {
          redirect(join(path, href));
        }
      }}
    ></host>
  );
};

const ARouterCase = ({ src, path }) => {
  let refHost = useHost();

  let dispatchUpdatedARouterCase = useEvent("UpdatedARouterCase", {
    bubbles: true,
    composed: true,
  });

  useEffect(() => {
    let { current } = refHost;
    let disconect;
    dispatchUpdatedARouterCase((callback) => (disconect = callback));
    return () => {
      !current.isConnected && disconect();
    };
  }, [src, path]);

  return <host></host>;
};

const notFound = { src: () => Promise.resolve(() => <slot name="404"></slot>) };

const ARouterSwitch = () => {
  let [pathname] = useHistory();
  let ref = useRef({});
  let [routeState, setRouteState] = useState(notFound);

  let [lazyState, LazyResult] = useLazy(
    () =>
      typeof routeState.src == "string"
        ? import(routeState.src)
        : routeState.src(),
    routeState.src,
    [routeState.src]
  );

  let chunkUpdate;
  let chunkRemove;

  let define = () => {
    let select = notFound;
    for (let path in ref.current) {
      let { src, default: isDefault } = ref.current[path];
      let [state, params] = match(path, pathname);
      if (state || isDefault) {
        select = { state, params, path, src, pathname };
        if (!isDefault) break;
      }
    }
    setRouteState((state) =>
      state.pathname == select.pathname ? state : select
    );
  };
  useEffect(define, [pathname]);
  return (
    <host
      shadowDom
      onUpdatedARouterCase={({ target, detail }) => {
        let { path } = target;
        ref.current[path] = target;
        detail(() => {
          delete ref.current[path];
          if (!chunkRemove) {
            chunkRemove = true;
            queueMicrotask(define);
          }
        });
        if (!chunkUpdate) {
          chunkUpdate = true;
          queueMicrotask(define);
        }
      }}
    >
      {lazyState == "loading" ? (
        <slot name="loading">{lazyState}</slot>
      ) : lazyState == "error" ? (
        <slot name="error">{lazyState}</slot>
      ) : lazyState == "done" ? (
        LazyResult(routeState.params)
      ) : (
        ""
      )}
    </host>
  );
};

ARouterCase.props = {
  path: {
    type: String,
    reflect: true,
  },
  src: {
    type: Any,
  },
  default: {
    type: Boolean,
  },
};

ARouterProxy.props = {
  path: {
    type: String,
    value: "",
  },
};

customElement("a-router-switch", ARouterSwitch);
customElement("a-router-case", ARouterCase);
customElement("a-router-proxy", ARouterProxy);
