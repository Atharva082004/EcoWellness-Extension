export function showBreakOverlay(){
  if(document.getElementById('ecowellness-break-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'ecowellness-break-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.8);z-index:2147483647;display:flex;align-items:center;justify-content:center;color:#fff;font-family:system-ui';
  overlay.innerHTML = `
    <div style="background:#0b1220;border:1px solid #334155;border-radius:12px;padding:20px;max-width:360px;text-align:center">
      <div style="font-size:22px;margin-bottom:6px">🧘 Time for a quick break</div>
      <div style="opacity:.8;margin-bottom:12px">Try 20-20-20: Look 20ft away for 20 seconds.</div>
      <div id="ecowellness-break-timer" style="font-size:28px;margin:8px 0">00:20</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
        <button id="ecowellness-break-skip" style="background:#334155;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer">Skip</button>
        <button id="ecowellness-break-done" style="background:#22c55e;color:#0b1220;border:none;padding:8px 12px;border-radius:8px;cursor:pointer">Done</button>
      </div>
    </div>`;
  document.documentElement.appendChild(overlay);
  let remaining = 20;
  const timerEl = document.getElementById('ecowellness-break-timer');
  const interval = setInterval(()=>{
    remaining -= 1; timerEl.textContent = `00:${String(remaining).padStart(2,'0')}`;
    if(remaining<=0){ cleanup(); }
  },1000);
  function cleanup(){ clearInterval(interval); overlay.remove(); }
  document.getElementById('ecowellness-break-skip').onclick = cleanup;
  document.getElementById('ecowellness-break-done').onclick = cleanup;
}


