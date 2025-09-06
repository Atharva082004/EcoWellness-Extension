export class WellnessTimer extends HTMLElement{
  connectedCallback(){
    if(this.initialized) return; this.initialized = true;
    this.intervalMins = Number(this.getAttribute('interval')||20);
    this.remaining = this.intervalMins*60;
    this.timer = setInterval(()=> this.tick(), 1000);
  }
  disconnectedCallback(){
    clearInterval(this.timer);
  }
  tick(){
    this.remaining -= 1;
    if(this.remaining <= 0){
      try{ chrome.runtime.sendMessage({ type:'BREAK_NOW' }); }catch{}
      this.remaining = this.intervalMins*60;
    }
  }
}
customElements.define('wellness-timer', WellnessTimer);

