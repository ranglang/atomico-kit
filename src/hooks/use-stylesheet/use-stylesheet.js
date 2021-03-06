import { useHost, useEffect } from "atomico";

let cache = {};
let support = document.adoptedStyleSheets;

/**
 * Add support to styleSheet, only in browsers that
 * implement it, it is remembered that adoptedStyleSheets
 * (05/13/2020) is not standard of the w3 is just a
 * valid implementation for google crhome
 * @param  {...(string|CSSStyleSheet)} stylesheet
 */
export function useStylesheet(...stylesheet) {
  let ref = useHost();
  let { current } = ref;

  useEffect(() => {
    if (support) {
      ref.prev = ref.prev || [];
      let shadowRootPrev = current.shadowRoot.adoptedStyleSheets.filter(
        (styleSheet) => !ref.prev.includes(styleSheet)
      );
      ref.prev = stylesheet.map((css) => {
        if (typeof css == "string" && !cache[css]) {
          let sheet = new CSSStyleSheet();
          sheet.replace(css);
          cache[css] = sheet;
        }
        return cache[css] || css;
      });

      current.shadowRoot.adoptedStyleSheets = [...shadowRootPrev, ...ref.prev];
    }
  }, stylesheet);

  return support ? "" : stylesheet.join("");
}
