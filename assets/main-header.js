class MainHeader extends HTMLElement {
  constructor() {
    super();

    this.menuOpen = this.menuOpen.bind(this);
    this.menuClose = this.menuClose.bind(this);
    this.subMenuOpen = this.subMenuOpen.bind(this);
    this.subMenuClose = this.subMenuClose.bind(this);
  }

  connectedCallback() {
    this.openMenuButton = this.querySelector("[menu-open]");
    this.closeMenuButtons = this.querySelectorAll("[menu-close]");
    this.menuMobile = this.querySelector("[mobile-menu]");

    this.openSubMenuButtons = this.querySelectorAll("[sub-menu-open]");
    this.closeSubMenuButtons = this.querySelectorAll("[sub-menu-close]");

    this.openMenuButton.addEventListener("click", this.menuOpen);

    this.closeMenuButtons.forEach((button) => {
      button.addEventListener("click", this.menuClose);
    });
    this.openSubMenuButtons.forEach((button) => {
      button.addEventListener("click", this.subMenuOpen);
    });

    this.closeSubMenuButtons.forEach((button) => {
      button.addEventListener("click", this.subMenuClose);
    });
  }

  disconnectedCallback() {
    this.openMenuButton.removeEventListener("click", this.menuOpen);

    this.closeMenuButtons.forEach((button) => {
      button.removeEventListener("click", this.menuClose);
    });

    this.openSubMenuButtons.forEach((button) => {
      button.removeEventListener("click", this.subMenuOpen);
    });

    this.closeSubMenuButtons.forEach((button) => {
      button.removeEventListener("click", this.subMenuClose);
    });
  }

  subMenuClose(event) {
    const button = event.currentTarget;
    const subMenu = button.closest("[sub-menu-mobile]");

    subMenu.classList.add("hidden");
    subMenu.classList.remove("flex");
  }

  subMenuOpen(event) {
    const button = event.currentTarget;
    const subMenu = button.parentElement.nextElementSibling;

    const isOpen = subMenu.classList.toggle("hidden") === false;

    subMenu.classList.toggle("flex", isOpen);
  }

  menuOpen() {
    this.menuMobile.classList.remove("hidden");
    this.menuMobile.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  }

  menuClose() {
    this.menuMobile.classList.add("hidden");
    this.menuMobile.classList.remove("flex");

    // Reset all submenus
    this.querySelectorAll("[sub-menu-mobile]").forEach((subMenu) => {
      subMenu.classList.add("hidden");
      subMenu.classList.remove("flex");
    });

    document.body.classList.remove("overflow-hidden");
  }
}

customElements.define("main-header", MainHeader);
