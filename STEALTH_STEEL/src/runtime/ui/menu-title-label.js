// Keep ribbon titles on one line while preserving their largest available size.
if (globalThis.customElements && !customElements.get("menu-title-label")) {
  customElements.define("menu-title-label", class extends HTMLElement {
    connectedCallback() {
      this.fit = () => {
        if (!this.isConnected || !this.parentElement) return;
        const title = this.parentElement;
        const safeInset = title.classList.contains("tiny-swords-ribbon")
          ? parseFloat(getComputedStyle(title).getPropertyValue("--menu-ribbon-title-safe-inset")) || 0
          : 0;
        const available = title.clientWidth - (safeInset * 2);
        if (available <= 0) return;
        this.style.fontSize = "";
        const baseSize = parseFloat(getComputedStyle(title).fontSize);
        if (!baseSize) return;
        this.style.fontSize = `${baseSize}px`;
        const range = this.ownerDocument.createRange();
        range.selectNodeContents(this);
        const width = range.getBoundingClientRect().width;
        if (width > available) this.style.fontSize = `${baseSize * Math.max(1, available - 1) / width}px`;
      };
      if (globalThis.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(this.fit);
        this.resizeObserver.observe(this.parentElement);
      }
      this.textObserver = new MutationObserver(this.fit);
      this.textObserver.observe(this, { childList: true, characterData: true, subtree: true });
      window.addEventListener("resize", this.fit);
      this.ownerDocument.fonts?.ready.then(() => this.fit?.());
      this.fit();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.textObserver?.disconnect();
      window.removeEventListener("resize", this.fit);
    }
  });
}
