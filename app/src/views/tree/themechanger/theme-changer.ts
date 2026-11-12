export default class ThemeChanger {
  readonly THEMES = ["vesper", "mokka", "ochra", "orbita", "bahamata", "umbra"];
  readonly DEFAULT_THEME = this.THEMES.indexOf("bahamata");
  themeNr = this.DEFAULT_THEME;
  themeCssLink = document.querySelector<HTMLLinkElement>(
    'link[rel="stylesheet"][href$="/styles/colors.css"]',
  );

  constructor(config: { nr?: number }) {
    const namedTheme = new URL(window.location.href).searchParams.get("theme");
    const namedIndex = this.THEMES.indexOf(namedTheme ?? "");
    // Old default links used index zero. Explicit choices now use a named URL parameter.
    const requestedTheme =
      namedIndex !== -1
        ? namedIndex
        : config.nr === 0
          ? this.DEFAULT_THEME
          : (config.nr ?? this.DEFAULT_THEME);
    this.themeNr =
      Number.isInteger(requestedTheme) && this.THEMES[requestedTheme]
        ? requestedTheme
        : this.DEFAULT_THEME;
    this.changeTheme(this.THEMES[this.themeNr]!);
  }

  changeTheme(nameTheme: string) {
    document.documentElement.dataset["theme"] = nameTheme;
    this.themeCssLink!.href = new URL(
      `../themes/${nameTheme}.css`,
      this.themeCssLink!.href,
    ).href;
  }

  html() {
    const root = document.createElement("div");
    root.classList.add("prompt");
    const container = document.createElement("div");
    container.classList.add("theme-changer-container");
    const label = document.createElement("label");
    label.htmlFor = "theme-select";
    label.textContent = "theme:";
    const select = document.createElement("select");
    select.id = "theme-select";
    select.name = "theme";
    select.classList.add("theme-changer");
    this.THEMES.forEach((theme, index) => {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      option.selected = index === this.themeNr;
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      this.themeNr = select.selectedIndex;
      this.changeTheme(select.value);
      const url = new URL(window.location.href);
      url.searchParams.set("theme", select.value);
      window.history.replaceState(window.history.state, "", url);
    });
    container.append(label, select);
    root.appendChild(container);
    return root;
  }

  export = () => ({ nr: this.themeNr });
}
