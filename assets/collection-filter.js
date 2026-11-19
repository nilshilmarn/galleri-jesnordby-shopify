class CollectionFilter extends HTMLElement {
  constructor() {
    super();
    this.openFilters = this.openFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.handleFiltersClear = this.handleFiltersClear.bind(this);
  }

  get sectionId() {
    return this.dataset.sectionId;
  }

  connectedCallback() {
    this.openFiltersButton = this.querySelector("[filters-open]");
    this.openFiltersButton.addEventListener("click", this.openFilters);

    this.closeFiltersButtons = this.querySelectorAll("[filters-close]");
    this.closeFiltersButtons.forEach((b) =>
      b.addEventListener("click", this.closeFilters),
    );

    this.filtersMenu = this.querySelector("[filters-menu]");
    this.filtersMenu.addEventListener("click", this.handleOverlayClick);

    this.filterInputs = this.querySelectorAll("input");
    this.filterInputs.forEach((i) =>
      i.addEventListener("change", this.handleFiltersChange),
    );

    this.minRange = this.querySelector('input[type="number"][data-min-value]');
    this.maxRange = this.querySelector('input[type="number"][data-max-value]');

    this.filterClearButton = this.querySelector("[filters-clear]");
    this.filterClearButton.addEventListener("click", this.handleFiltersClear);
  }

  disconnectedCallback() {
    this.openFiltersButton.removeEventListener("click", this.openFilters);
    this.closeFiltersButtons.forEach((b) =>
      b.removeEventListener("click", this.closeFilters),
    );
    this.filtersMenu.removeEventListener("click", this.handleOverlayClick);
    this.filterInputs.forEach((i) =>
      i.removeEventListener("change", this.handleFiltersChange),
    );
    this.filterClearButton.removeEventListener(
      "click",
      this.handleFiltersClear,
    );
  }

  async handleFiltersClear() {
    const url = new URL(window.location.pathname, window.location.origin);
    await this.renderPage(url);
  }

  async handleFiltersChange(event) {
    const input = event.currentTarget;
    const listRange = input.closest("[data-list-range]");
    let url;

    if (listRange) {
      url = this.buildListRangeUrl(listRange);
    } else if (input.dataset.addUrl || input.dataset.removeUrl) {
      url = new URL(
        input.checked ? input.dataset.addUrl : input.dataset.removeUrl,
        window.location.origin,
      );
    } else {
      url = new URL(window.location.href);
      url.searchParams.set(this.minRange.dataset.param, this.minRange.value);
      url.searchParams.set(this.maxRange.dataset.param, this.maxRange.value);
    }

    await this.renderPage(url);
  }

  async renderPage(url) {
    const fetchUrl = new URL(url);
    fetchUrl.searchParams.set("section_id", this.sectionId);

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(response.status);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Check the menu's state now, after the fetch, not when it started
    const isOpen = !this.filtersMenu.classList.contains("hidden");
    const newMenu = doc.querySelector("[filters-menu]");
    newMenu.classList.toggle("hidden", !isOpen);
    newMenu.classList.toggle("flex", isOpen);

    document.querySelector(".collection").innerHTML =
      doc.querySelector(".collection").innerHTML;

    window.history.pushState({}, "", url);
  }

  handleOverlayClick(event) {
    if (event.target === this.filtersMenu) {
      this.closeFilters();
    }
  }

  buildListRangeUrl(wrap) {
    const param = wrap.dataset.param;
    const values = JSON.parse(wrap.dataset.values);
    const min = parseFloat(wrap.querySelector("[data-list-range-min]").value);
    const max = parseFloat(wrap.querySelector("[data-list-range-max]").value);

    const inRange = values.filter((v) => {
      const n = parseFloat(v);
      return (isNaN(min) || n >= min) && (isNaN(max) || n <= max);
    });

    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    url.searchParams.delete("page");

    // Only filter if the range actually narrows things down
    if (inRange.length > 0 && inRange.length < values.length) {
      inRange.forEach((v) => url.searchParams.append(param, v));
    }

    return url;
  }

  openFilters() {
    document.documentElement.style.scrollbarGutter = "stable";
    this.filtersMenu.classList.remove("hidden");
    this.filtersMenu.classList.add("flex");
    document.body.classList.add("overflow-y-hidden");
  }

  closeFilters() {
    this.filtersMenu.classList.add("hidden");
    this.filtersMenu.classList.remove("flex");
    document.body.classList.remove("overflow-y-hidden");
    document.documentElement.style.scrollbarGutter = "";
  }
}

customElements.define("collection-filter", CollectionFilter);
