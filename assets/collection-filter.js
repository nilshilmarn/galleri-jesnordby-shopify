class CollectionFilter extends HTMLElement {
  constructor() {
    super();
    this.openFilters = this.openFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
  }

  get sectionId() {
    return this.dataset.sectionId;
  }

  connectedCallback() {
    this.events?.abort();
    this.events = new AbortController();

    this.openFiltersButton = this.querySelector("[filters-open]");
    this.openFiltersButton.addEventListener("click", this.openFilters);

    this.clearFiltersButton = this.querySelector("[filters-clear]");
    this.clearFiltersButton.addEventListener("click", this.clearFilters);

    this.closeFiltersButtons = this.querySelectorAll("[filters-close]");
    this.closeFiltersButtons.forEach((button) => {
      button.addEventListener("click", this.closeFilters);
    });

    this.filtersMenu = this.querySelector("[filters-menu]");
    this.filtersMenu.addEventListener("click", this.handleOverlayClick);

    this.addEventListener("change", this.handleFilter);
  }

  disconnectedCallback() {
    this.openFiltersButton.removeEventListener("click", this.openFilters);

    this.closeFiltersButtons.forEach((button) => {
      button.removeEventListener("click", this.closeFilters);
    });
    this.filtersMenu.removeEventListener("click", this.handleOverlayClick);

    this.clearFiltersButton.removeEventListener("click", this.clearFilters);

    this.removeEventListener("change", this.handleFilter);
    this.request?.abort();
  }

  async clearFilters() {
    this.request?.abort();

    const request = new AbortController();
    this.request = request;

    const url = new URL(window.location.href);

    for (const name of [...url.searchParams.keys()]) {
      if (name.startsWith("filter.")) {
        url.searchParams.delete(name);
      }
    }

    url.searchParams.delete("page");
    url.searchParams.delete("section_id");

    const fetchUrl = new URL(url);
    fetchUrl.searchParams.set("section_id", this.sectionId);

    try {
      const response = await fetch(fetchUrl, {
        signal: request.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      if (request.signal.aborted) return;

      const doc = new DOMParser().parseFromString(html, "text/html");

      const nextProducts = doc.querySelector(".collection-products");
      const nextFilters = doc.querySelector(".collection-filters");

      const products = this.parentElement.querySelector(".collection-products");
      const filters = this.querySelector(".collection-filters");

      if (!nextProducts || !nextFilters || !products || !filters) {
        throw new Error("Missing collection markup");
      }

      products.innerHTML = nextProducts.innerHTML;
      filters.innerHTML = nextFilters.innerHTML;

      window.history.pushState({}, "", url.toString());
    } catch (error) {}
  }

  async handleFilter() {
    this.request?.abort();

    const request = new AbortController();
    this.request = request;

    const url = new URL(window.location.href);

    // Get the current checkboxes, not the old ones.
    const inputs = [
      ...this.querySelectorAll('input[type="checkbox"][name^="filter."]'),
    ];

    // Remove previously selected checkbox filter values.
    for (const name of new Set(inputs.map((input) => input.name))) {
      url.searchParams.delete(name);
    }

    // Add currently checked values.
    for (const input of inputs) {
      if (input.checked) {
        url.searchParams.append(input.name, input.value);
      }
    }

    url.searchParams.delete("page");
    url.searchParams.delete("section_id");

    const fetchUrl = new URL(url);
    fetchUrl.searchParams.set("section_id", this.sectionId);

    const products = this.parentElement.querySelector(".collection-products");

    const filters = this.querySelector(".collection-filters");

    try {
      const response = await fetch(fetchUrl.toString(), {
        signal: request.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      if (request.signal.aborted) return;

      const doc = new DOMParser().parseFromString(html, "text/html");

      const nextProducts = doc.querySelector(".collection-products");
      const nextFilters = doc.querySelector(".collection-filters");

      if (request.signal.aborted) return;

      products.innerHTML = nextProducts.innerHTML;
      filters.innerHTML = nextFilters.innerHTML;

      window.history.pushState({}, "", url.toString());
    } catch (error) {}
  }

  handleOverlayClick(event) {
    if (event.target === this.filtersMenu) {
      this.closeFilters();
    }
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
