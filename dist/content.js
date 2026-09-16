import{f as Z,t as ee,H as te}from"./types.js";var j,x,W,oe=[];function ae(t,e,o){var a,n,r,c={};for(r in e)r=="key"?a=e[r]:r=="ref"?n=e[r]:c[r]=e[r];if(arguments.length>2&&(c.children=arguments.length>3?j.call(arguments,2):o),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)c[r]===void 0&&(c[r]=t.defaultProps[r]);return ne(t,c,a,n)}function ne(t,e,o,a,n){var r={type:t,props:e,key:o,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:++W,__i:-1,__u:0};return x.vnode!=null&&x.vnode(r),r}j=oe.slice,x={__e:function(t,e,o,a){for(var n,r,c;e=e.__;)if((n=e.__c)&&!n.__)try{if((r=n.constructor)&&r.getDerivedStateFromError!=null&&(n.setState(r.getDerivedStateFromError(t)),c=n.__d),n.componentDidCatch!=null&&(n.componentDidCatch(t,a||{}),c=n.__d),c)return n.__E=n}catch(l){t=l}throw t}},W=0,typeof Promise=="function"&&Promise.prototype.then.bind(Promise.resolve()),Math.random().toString(8);var re=0;function i(t,e,o,a,n,r){e||(e={});var c,l,u=e;if("ref"in u)for(l in u={},e)l=="ref"?c=e[l]:u[l]=e[l];var f={type:t,props:u,key:o,ref:c,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--re,__i:-1,__u:0,__source:n,__self:r};if(typeof t=="function"&&(c=t.defaultProps))for(l in c)u[l]===void 0&&(u[l]=c[l]);return x.vnode&&x.vnode(f),f}var k,s,H,F,w=0,B=[],p=x,L=p.__b,$=p.__r,q=p.diffed,M=p.__c,R=p.unmount,I=p.__;function A(t,e){p.__h&&p.__h(s,t,w||e),w=0;var o=s.__H||(s.__H={__:[],__h:[]});return t>=o.__.length&&o.__.push({}),o.__[t]}function v(t){return w=1,le(Q,t)}function le(t,e,o){var a=A(k++,2);if(a.t=t,!a.__c&&(a.__=[Q(void 0,e),function(l){var u=a.__N?a.__N[0]:a.__[0],f=a.t(u,l);u!==f&&(a.__N=[f,a.__[1]],a.__c.setState({}))}],a.__c=s,!s.__f)){var n=function(l,u,f){if(!a.__c.__H)return!0;var h=!1,b=a.__c.props!==l;if(a.__c.__H.__.some(function(m){if(m.__N){h=!0;var z=m.__[0];m.__=m.__N,m.__N=void 0,z!==m.__[0]&&(b=!0)}}),r){var y=r.call(this,l,u,f);return h?y||b:y}return!h||b};s.__f=!0;var r=s.shouldComponentUpdate,c=s.componentWillUpdate;s.componentWillUpdate=function(l,u,f){if(this.__e){var h=r;r=void 0,n(l,u,f),r=h}c&&c.call(this,l,u,f)},s.shouldComponentUpdate=n}return a.__N||a.__}function C(t,e){var o=A(k++,3);!p.__s&&O(o.__H,e)&&(o.__=t,o.u=e,s.__H.__h.push(o))}function E(t){return w=5,G(function(){return{current:t}},[])}function G(t,e){var o=A(k++,7);return O(o.__H,e)&&(o.__=t(),o.__H=e,o.__h=t),o.__}function ie(t,e){return w=8,G(function(){return t},e)}function ce(){for(var t;t=B.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(S),e.__h.some(T),e.__h=[]}catch(o){e.__h=[],p.__e(o,t.__v)}}}p.__b=function(t){s=null,L&&L(t)},p.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),I&&I(t,e)},p.__r=function(t){$&&$(t),k=0;var e=(s=t.__c).__H;e&&(H===s?(e.__h=[],s.__h=[],e.__.some(function(o){o.__N&&(o.__=o.__N),o.u=o.__N=void 0})):(e.__h.some(S),e.__h.some(T),e.__h=[],k=0)),H=s},p.diffed=function(t){q&&q(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(B.push(e)!==1&&F===p.requestAnimationFrame||((F=p.requestAnimationFrame)||se)(ce)),e.__H.__.some(function(o){o.u&&(o.__H=o.u,o.u=void 0)})),H=s=null},p.__c=function(t,e){e.some(function(o){try{o.__h.some(S),o.__h=o.__h.filter(function(a){return!a.__||T(a)})}catch(a){e.some(function(n){n.__h&&(n.__h=[])}),e=[],p.__e(a,o.__v)}}),M&&M(t,e)},p.unmount=function(t){R&&R(t);var e,o=t.__c;o&&o.__H&&(o.__H.__.some(function(a){try{S(a)}catch(n){e=n}}),o.__H=void 0,e&&p.__e(e,o.__v))};var K=typeof requestAnimationFrame=="function";function se(t){var e,o=function(){clearTimeout(a),K&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(o,35);K&&(e=requestAnimationFrame(o))}function S(t){var e=s,o=t.__c;typeof o=="function"&&(t.__c=void 0,o()),s=e}function T(t){var e=s;t.__c=t.__(),s=e}function O(t,e){return!t||t.length!==e.length||e.some(function(o,a){return o!==t[a]})}function Q(t,e){return typeof e=="function"?e(t):e}function de({skill:t,isSelected:e,onSelect:o}){return i("div",{className:`skill-item ${e?"selected":""}`,onClick:o,role:"option","aria-selected":e,children:[i("span",{className:"skill-name",children:ee(t.name)}),i("span",{className:"skill-description",children:t.description})]})}function _e({message:t,type:e,onRetry:o,onDismiss:a}){return i("div",{className:`toast toast-${e}`,role:"alert",children:[i("span",{children:t}),o&&i("button",{onClick:o,children:"Retry"}),i("button",{onClick:a,"aria-label":"Dismiss",children:"×"})]})}function pe({text:t,onCancel:e}){const o=E(null);return C(()=>{var n,r;(n=o.current)==null||n.focus(),(r=o.current)==null||r.select()},[]),i("div",{className:"fallback-modal-overlay",onKeyDown:n=>{n.key==="Escape"&&(n.preventDefault(),n.stopPropagation())},children:i("div",{className:"fallback-modal",role:"dialog","aria-modal":"true","aria-labelledby":"modal-title",children:[i("h2",{id:"modal-title",children:"Copy Skill Manually"}),i("p",{children:["Automatic copy failed. Please press ",i("kbd",{children:"Ctrl+C"})," to copy the skill text below:"]}),i("textarea",{ref:o,readOnly:!0,value:t,spellCheck:!1}),i("button",{className:"cancel-btn",onClick:e,children:"Cancel"})]})})}function ue({isOpen:t,onClose:e,onCopy:o}){const[a,n]=v(te),[r,c]=v(""),[l,u]=v(0),[f,h]=v(null),[b,y]=v(null),[m,z]=v(!1),N=E(null),V=E(null),g=Z(a,r);C(()=>{u(0)},[r]),C(()=>{t&&N.current&&(N.current.focus(),N.current.select())},[t]);const D=ie(d=>{if(t)switch(d.key){case"Escape":d.preventDefault(),e();break;case"ArrowDown":d.preventDefault(),u(_=>Math.min(_+1,g.length-1));break;case"ArrowUp":d.preventDefault(),u(_=>Math.max(_-1,0));break;case"Enter":d.preventDefault(),g[l]&&o(g[l]);break}},[t,g,l,e,o]);C(()=>(document.addEventListener("keydown",D),()=>document.removeEventListener("keydown",D)),[D]);const J=async d=>{try{return await navigator.clipboard.writeText(d),!0}catch(_){console.debug("Tier 1 clipboard failed:",_)}try{const _=document.createElement("textarea");_.value=d,_.style.position="fixed",_.style.opacity="0",_.style.left="-9999px",document.body.appendChild(_),_.select();const P=document.execCommand("copy");if(document.body.removeChild(_),P)return!0}catch(_){console.debug("Tier 2 clipboard failed:",_)}return!1},X=async d=>{const _=`# ${d.name}

${d.description}

---
*Version: ${d.version}*
*Tags: ${d.tags.join(", ")}*
*Updated: ${d.updatedAt}*`;await J(_)?(h({message:"Copied!",type:"info",onDismiss:()=>h(null)}),e()):y({text:_})},Y=()=>{y(null)};return t?i("div",{className:"palette-overlay",ref:V,role:"dialog","aria-modal":"true","aria-label":"Agentic Skills Palette",children:i("div",{className:"palette-container",children:[i("div",{className:"palette-header",children:[i("h1",{children:"Agentic Skills"}),i("kbd",{className:"shortcut-hint",children:"Alt+Shift+S"})]}),i("input",{ref:N,type:"text",className:"palette-input",placeholder:"Type /namespace:command to filter...",value:r,onInput:d=>c(d.target.value),"aria-label":"Filter skills","aria-autocomplete":"list","aria-controls":"skills-list"}),i("div",{className:"palette-content",children:[m&&i("div",{className:"loading",children:"Loading skills..."}),!m&&g.length===0&&a.length===0&&i("div",{className:"placeholder",children:"No skills available yet."}),!m&&g.length===0&&a.length>0&&r&&i("div",{className:"placeholder",children:["No skills match '",r,"'."]}),!m&&g.length>0&&i("ul",{id:"skills-list",className:"skills-list",role:"listbox",children:g.map((d,_)=>i("li",{children:i(de,{skill:d,isSelected:_===l,onSelect:()=>X(d)})},d.name))})]}),f&&i(_e,{message:f.message,type:f.type,onRetry:f.onRetry,onDismiss:()=>h(null)}),b&&i(pe,{text:b.text,onCancel:Y})]})}):null}function fe(t){let e=!1;const o=()=>{e=!e,n()},a=()=>{e=!1,n()},n=()=>{n(ae(ue,{isOpen:e,onClose:a,onCopy:r}))},r=async c=>{console.log("Copy skill:",c.name)};return{toggle:o,close:a}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",U):U();function U(){const t=window.location.hostname;if(!["gemini.google.com","chat.openai.com","chatgpt.com","chat.qwen.ai","qwen.ai"].some(l=>t===l||t.endsWith("."+l))){console.log("[Agentic Skills] Not a target domain, skipping palette injection");return}const o=document.createElement("div");o.id="agentic-skills-shadow-host",document.body.appendChild(o);const a=o.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`
    * { box-sizing: border-box; }
    .palette-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .palette-container {
      width: 100%;
      max-width: 600px;
      max-height: 70vh;
      background: var(--palette-bg, #fff);
      color: var(--palette-fg, #1a1a1a);
      border: 1px solid var(--palette-border, #ddd);
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        --palette-bg: #1e1e1e;
        --palette-fg: #e0e0e0;
        --palette-border: #444;
        --palette-input-bg: #2d2d2d;
        --palette-item-hover: #333;
        --palette-selected: #0066cc;
        --toast-error-bg: #8b1a1a;
        --toast-info-bg: #1a5c8b;
        --toast-warn-bg: #8b6b1a;
        --modal-bg: #252525;
        --modal-border: #555;
      }
    }
    @media (prefers-color-scheme: light) {
      :host {
        --palette-bg: #ffffff;
        --palette-fg: #1a1a1a;
        --palette-border: #dddddd;
        --palette-input-bg: #f5f5f5;
        --palette-item-hover: #f0f0f0;
        --palette-selected: #0066cc;
        --toast-error-bg: #ffeaea;
        --toast-info-bg: #eaf4ff;
        --toast-warn-bg: #fff8e1;
        --modal-bg: #ffffff;
        --modal-border: #dddddd;
      }
    }
    .palette-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--palette-border);
    }
    .palette-header h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .shortcut-hint {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--palette-input-bg);
      border-radius: 3px;
      font-family: monospace;
      color: var(--palette-fg);
      opacity: 0.7;
    }
    .palette-input {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-bottom: 1px solid var(--palette-border);
      background: var(--palette-input-bg);
      color: var(--palette-fg);
      font-size: 14px;
      outline: none;
    }
    .palette-input::placeholder {
      color: var(--palette-fg);
      opacity: 0.5;
    }
    .palette-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .skills-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .skill-item {
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .skill-item:hover, .skill-item.selected {
      background: var(--palette-item-hover);
    }
    .skill-item.selected {
      background: var(--palette-selected);
      color: white;
    }
    .skill-name {
      display: block;
      font-weight: 600;
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .skill-description {
      display: block;
      font-size: 12px;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .placeholder {
      padding: 24px;
      text-align: center;
      color: var(--palette-fg);
      opacity: 0.6;
    }
    .loading {
      padding: 24px;
      text-align: center;
      color: var(--palette-fg);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin: 8px;
      border-radius: 6px;
      font-size: 13px;
    }
    .toast-error { background: var(--toast-error-bg); color: #fff; }
    .toast-info { background: var(--toast-info-bg); color: #fff; }
    .toast-warn { background: var(--toast-warn-bg); color: #fff; }
    .toast button {
      margin-left: auto;
      padding: 4px 10px;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .fallback-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483648;
    }
    .fallback-modal {
      background: var(--modal-bg);
      border: 1px solid var(--modal-border);
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
    }
    .fallback-modal h2 { margin: 0 0 12px; }
    .fallback-modal p { margin: 0 0 12px; }
    .fallback-modal kbd {
      background: var(--palette-input-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    .fallback-modal textarea {
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: 1px solid var(--palette-border);
      border-radius: 4px;
      background: var(--palette-input-bg);
      color: var(--palette-fg);
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 16px;
      resize: vertical;
    }
    .cancel-btn {
      padding: 8px 16px;
      background: var(--palette-selected);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
  `,a.appendChild(n);const r=document.createElement("div");a.appendChild(r);const{toggle:c}=fe();browser.runtime.onMessage.addListener(l=>{l.type==="TOGGLE_PALETTE"&&c()}),document.addEventListener("keydown",l=>{l.altKey&&l.shiftKey&&l.key==="S"&&(l.preventDefault(),c())}),console.log("[Agentic Skills] Palette ready")}
//# sourceMappingURL=content.js.map
