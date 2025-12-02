import { CookieCategory } from "../../types/CookieCategory";

class Defer {
  private scripts: CookieCategory[] = [];
  private loading = false;

  constructor(private hostScript: HTMLScriptElement) {

      const parmas = hostScript.getAttribute("data-scripts");
      if (parmas) {
        try {
          this.scripts = JSON.parse(parmas) as CookieCategory[]; 
          this.loadScripts();
        } catch (e) {
          console.error("❌ Invalid JSON data-scripts format", e);
        }
      }
  }


  loadScripts() {
    if (this.loading) return;

    if (this.scripts.length > 0) {
      const currentScript = this.scripts.shift();
      this.loading = true;

      const script = document.createElement('script');
      script.type = "text/javascript";
      
      if (currentScript?.src) {
        script.src = currentScript.src;
      } 
       if (currentScript?.code) {
       script.textContent = currentScript.code;
      } 
      
       script.async = false; 

      script.onload = () => {
        this.loading = false;
        this.loadScripts();
      };
      script.onerror = () => {
        this.loading = false;
        this.loadScripts();
      };

      document.head.appendChild(script);
    }
  }
}

(() => {
  const current = document.currentScript as HTMLScriptElement;
  new Defer(current);
})();
