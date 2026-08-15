
function isPlainObject(value) {
  return value !== null && !Array.isArray(value) && Object(value) === value;
}
function isTranslationLeaf(value) {
  return value === null || value === undefined || Object(value) !== value;
}
function isStringValue(value) {
  return Object.prototype.toString.call(value) === '[object String]';
}
(function(a){"use strict";const O="https://checkout.lomi.africa",T="500px",M="85vh",D="90vh",y="lomi-checkout-overlay";function w(e){if(!e.checkoutUrl&&!e.sessionId)throw new Error("Lomi embed: provide checkoutUrl or sessionId (with optional checkoutBaseUrl).")}const v=(e,t)=>{try{const r=new URL(e);r.searchParams.set("embedded","true");const i=t??((window!==void 0)?window.location.origin:void 0);return i&&r.searchParams.set("embed_origin",i),r.toString()}catch{const r=e.includes("?")?"&":"?";let i=`${e}${r}embedded=true`;const n=t??((window!==void 0)?window.location.origin:void 0);return n&&(i+=`&embed_origin=${encodeURIComponent(n)}`),i}},L=e=>{if(w(e),e.checkoutUrl)return v(e.checkoutUrl);const t=e.checkoutBaseUrl||O;return v(`${t}/checkout/${e.sessionId}`)},H=e=>!e||e<=0?"":e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`,S=e=>({overlay:`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
  `,container:`
    width: ${e.width||"100%"};
    max-width: ${e.maxWidth||T};
    height: ${e.modalHeight||(window.innerWidth>=640?D:M)};
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  `,iframe:`
    width: 100%;
    height: 100%;
    border: none;
  `}),x=e=>{const t=document.getElementById(y);t==null||t.remove();const r=S(e),i=document.createElement("div");i.id=y,i.style.cssText=r.overlay;const n=document.createElement("div");return n.style.cssText=r.container,i.appendChild(n),document.body.appendChild(i),{overlay:i,container:n}},A=(e,t)=>{e.addEventListener("click",r=>{r.target===e&&t()})},P="LOMI_CHECKOUT";function $(e){try{return new URL(e).origin}catch{return null}}function B(e,t){const r=$(t);return r?e===r:!0}function k(e){return{type:"LOMI_CHECKOUT_COMPLETE",sessionId:e.sessionId??null,transactionId:e.transactionId,amount:e.amount,currency:e.currency,hasDigitalDeliverables:e.hasDigitalDeliverables}}function p(e){if((e===null||Array.isArray(e)||Object(e)!==e)||e===null)return null;const t=e;return t.type===P&&(Object.prototype.toString.call(t.event)==="[object String]")?t.event==="success"?{event:"success",payload:k(t)}:t.event==="resize"?{event:"resize"}:{event:t.event}:t.type==="LOMI_CHECKOUT_COMPLETE"?{event:"success",payload:k(t)}:t.type==="LOMI_RESIZE"?{event:"resize"}:null}const K=/checkout\.lomi\.africa/i,R=e=>{const t=document.createElement("iframe");return t.src=L(e),t.style.cssText="width: 100%; height: 100%; border: none;",t.setAttribute("loading","lazy"),t.allow="payment",t},z=(e,t,r,i,n)=>c=>{var s,g,b,f,d,I,C,U,_;if(!B(c.origin,t))return;if(((s=c.data)==null?void 0:s.type)==="LOMI_RESIZE"&&((g=c.data)!=null&&g.height)){const u=Number(c.data.height);(b=e.onResize)==null||b.call(e,u),e.mode==="inline"&&(r.style.height=`${Math.max(240,u)}px`);return}const o=p(c.data);if(o){if(o.event==="resize"){const u=Number(((f=c.data)==null?void 0:f.height)??0);if(!u)return;(d=e.onResize)==null||d.call(e,u),e.mode==="inline"&&(r.style.height=`${Math.max(240,u)}px`);return}if(o.event==="confirmed"){i.closable=!1;return}if(o.event==="close"){i.closable&&(n==null||n());return}if(o.event==="success"&&o.payload){(I=e.onComplete)==null||I.call(e,o.payload),n==null||n();return}o.event==="error"&&((_=e.onError)==null||_.call(e,{code:String(((C=c.data)==null?void 0:C.code)??"embed_error"),message:(U=c.data)==null?void 0:U.message}))}},l=e=>{try{w(e)}catch(d){console.error(d instanceof Error?d.message:d);return}const t=e.mode||"modal",r=R(e),i=r.src;let n=null;const c={closable:!0},o=()=>{n==null||n.remove(),window.removeEventListener("message",s)},s=z(e,i,r,c,o);if(window.addEventListener("message",s),t==="inline"){const d=document.getElementById(e.elementId||"");if(!d){console.error(`Lomi: Element with ID "${e.elementId}" not found.`),window.removeEventListener("message",s);return}return d.innerHTML="",d.appendChild(r),{unmount:()=>{d.innerHTML="",window.removeEventListener("message",s)}}}const{overlay:g,container:b}=x(e);n=g,b.appendChild(r);const f=()=>{c.closable&&o()};return A(n,f),{unmount:f}},m=()=>{document.querySelectorAll("[data-lomi-session-id]").forEach(t=>{const r=t.dataset.lomiSessionId,i=t.dataset.lomiCheckoutUrl,n=t.dataset.lomiPublicKey||"";t.dataset.lomiMounted!=="true"&&(!i&&(!r||!n)||(t.id||(t.id=`lomi-embed-${r||"inline"}`),t.dataset.lomiMounted="true",l({publicKey:n||void 0,sessionId:r,checkoutUrl:i,checkoutBaseUrl:t.dataset.lomiCheckoutBaseUrl,mode:"inline",elementId:t.id})))})},h=()=>{document.querySelectorAll("a[href]").forEach(e=>{const t=e.getAttribute("href")||"";!K.test(t)||e.dataset.lomiBound==="true"||(e.dataset.lomiBound="true",e.addEventListener("click",r=>{r.preventDefault(),l({checkoutUrl:t,mode:"modal"})}))})},E=()=>{const e=new MutationObserver(()=>{m(),h()});return e.observe(document.documentElement,{childList:!0,subtree:!0}),e};if((window!==void 0)){window.Lomi={loadLomiCheckout:l,mountInlineProductEmbeds:m,interceptCheckoutLinks:h,observeDynamicEmbeds:E};const e=()=>{m(),h(),E()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}const F={loadLomiCheckout:l,mountInlineProductEmbeds:m,interceptCheckoutLinks:h,observeDynamicEmbeds:E};a.buildCheckoutUrl=L,a.default=F,a.formatBytes=H,a.interceptCheckoutLinks=h,a.loadLomiCheckout=l,a.mountInlineProductEmbeds=m,a.observeDynamicEmbeds=E,a.withEmbeddedParam=v,Object.defineProperties(a,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})})(this.Lomi=this.Lomi||{});
