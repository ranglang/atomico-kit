import { useHost, useEffect } from "atomico";

let cache = {};

/**
 * Add support to styleSheet, only in browsers that
 * implement it, it is remembered that adoptedStyleSheets
 * (05/13/2020) is not standard of the w3 is just a
 * valid implementation for google crhome
 * @param  {...(string|CSSStyleSheet)} stylesheet
 */
export function useStylesheet(...stylesheet) {
  let ref = useHost();
  useEffect(() => {
    let { current } = ref;
    if (current.shadowRoot && current.shadowRoot.adoptedStyleSheets) {
      current.shadowRoot.adoptedStyleSheets = stylesheet.map((css) => {
        if (typeof css == "string" && !cache[css]) {
          let sheet = new CSSStyleSheet();
          sheet.replace(css);
          cache[css] = sheet;
        }
        return cache[css] || css;
      });
    }
  }, stylesheet);
}