/* -------------------------------------------------------------- */
/*  Light / dark theme system.                                     */
/*                                                                 */
/*  The design system is authored dark-first. A `data-theme="light"`*/
/*  attribute on <html> flips a block of overrides in globals.css.  */
/*  No attribute (or "dark") = the original dark design, untouched. */
/*                                                                 */
/*  Plain data + a stringifiable init script — safe on server and  */
/*  client. The admin picks the default theme and whether visitors  */
/*  get a toggle; a visitor's own choice is stored in localStorage. */
/* -------------------------------------------------------------- */

export type Theme = "dark" | "light";

export const THEMES: Theme[] = ["dark", "light"];
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "tekoovi-theme";

export function normalizeTheme(value: unknown): Theme {
  return value === "light" ? "light" : "dark";
}

/**
 * Inline, blocking script that applies the theme on <html> before first paint
 * (no flash). Baked with the admin default; when the toggle is enabled it lets a
 * previously stored visitor choice win, otherwise it always forces the default.
 */
export function themeInitScript(
  defaultTheme: Theme,
  allowToggle: boolean,
): string {
  return `(function(){try{var d=${JSON.stringify(defaultTheme)};var t=d;${
    allowToggle
      ? `var s=localStorage.getItem(${JSON.stringify(
          THEME_STORAGE_KEY,
        )});if(s==="light"||s==="dark")t=s;`
      : ""
  }var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){}})();`;
}
