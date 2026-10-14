(function(){
'use strict';
var IMGB='https://cdn.shopify.com/s/files/1/1057/6612/5832/files/';
var P=(window.PRODUCTS||[]).map(function(d){return{id:d.i,name:d.n.split(' – ')[0],full:d.n,price:d.p,av:d.a,fr:d.f||d.c,f:d.f,cat:d.c,t:d.t,url:'https://muertosderisa.com/products/'+d.i,imgs:d.m.map(function(m){return IMGB+m})}}),$=function(s){return document.querySelector(s)};
var LEAD_URL='https://mlaqtniujnvfxcvcourm.supabase.co/functions/v1/muertosderisa-lead';
var fmt=function(n){return n.toFixed(2).replace('.',',')+' €'};
var img=function(u,w){return u+(u.indexOf('?')>-1?'&':'?')+'width='+w};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var byId={};P.forEach(function(p){byId[p.id]=p});

/* ---------- cesta ---------- */
var cart={};
try{cart=JSON.parse(localStorage.getItem('mdr_cart')||'{}')||{}}catch(e){cart={}}
Object.keys(cart).forEach(function(k){if(!byId[k])delete cart[k]});
function save(){try{localStorage.setItem('mdr_cart',JSON.stringify(cart))}catch(e){}}
function add(id,n){cart[id]=Math.max(0,(cart[id]||0)+(n||1));if(!cart[id])delete cart[id];save();renderCart()}
function renderCart(){
  var ids=Object.keys(cart),tot=0,cnt=0,h='';
  ids.forEach(function(id){var p=byId[id],q=cart[id];tot+=p.price*q;cnt+=q;
    h+='<div class="line"><img src="'+img(p.imgs[0],128)+'" width="64" height="64" alt="" loading="lazy"><div><strong>'+esc(p.name)+'</strong><div class="muted">'+fmt(p.price)+'</div><div class="qty"><button data-d="-1" data-id="'+p.id+'" aria-label="Quitar uno">−</button><span>'+q+'</span><button data-d="1" data-id="'+p.id+'" aria-label="Añadir uno">+</button><button class="rm" data-d="-99" data-id="'+p.id+'">Eliminar</button></div></div></div>'});
  $('#cartItems').innerHTML=h||'<p class="muted" style="padding:20px 0">Tu carrito está vacío. Demasiado vacío.</p>';
  $('#subtotal').textContent=fmt(tot);$('#cartCount').textContent=cnt;
  $('#checkout').disabled=!cnt;
}
function openCart(o){var c=$('#cart');c.classList.toggle('open',o);c.setAttribute('aria-hidden',!o);$('#scrim').hidden=!o;$('#checkoutMsg').textContent='';if(o)$('#closeCart').focus()}
$('#cartItems').addEventListener('click',function(e){var b=e.target.closest('button[data-id]');if(b)add(b.dataset.id,+b.dataset.d)});
$('#openCart').onclick=function(){openCart(true)};$('#closeCart').onclick=$('#scrim').onclick=function(){openCart(false)};
$('#checkout').onclick=function(){$('#checkoutMsg').textContent='Esto es una demo: aquí se conectaría el pago real de la tienda. No se ha hecho ningún cargo.'};

/* ---------- catálogo y pestañas ---------- */
var TN=window.TABS||[];
var T={novedades:'Novedades','funko-pop':'Funko POP',figuras:'Figuras y coleccionables',videojuegos:'Videojuegos','urban-flowers':'Urban Flowers',decoracion:'Decoración',tazas:'Jarras, copas y tazas',mochilas:'Mochilas, bolsos y carteras',peluches:'Peluches',libros:'Libros, cómic y manga',joyeria:'Joyería y complementos',juegos:'Juegos de mesa y puzzles',mascaras:'Máscaras y disfraces',ropa:'Ropa y camisetas',cine:'Películas de terror',blind:'Cajas sorpresa · Blind boxes','menos-20':'Regalos de terror por menos de 20 €','menos-40':'Regalos de terror por menos de 40 €',originales:'Regalos originales de terror',coleccionistas:'Terror para coleccionistas',favogritos:'FavoGritos'};
var GROUPS=[{k:'todo',l:'Todo'},{k:'novedades',l:'Novedades',tab:'novedades'},{k:'tienda',l:'Tienda',subs:['funko-pop','figuras','videojuegos','urban-flowers','decoracion','tazas','mochilas','peluches','libros','joyeria','juegos','mascaras','ropa','cine','blind']},{k:'regalos',l:'Regalos',subs:['menos-20','menos-40','originales','coleccionistas']},{k:'favogritos',l:'FavoGritos',tab:'favogritos'}];
var PAGE=24,state={g:'todo',s:'',q:'',sort:'',n:PAGE};
function tid(k){return TN.indexOf(k)}
function inTab(p,k){return p.t.indexOf(tid(k))>-1}
function count(k){return P.filter(function(p){return inTab(p,k)}).length}
function groupItems(g){return g.subs?P.filter(function(p){return g.subs.some(function(k){return inTab(p,k)})}):g.tab?P.filter(function(p){return inTab(p,g.tab)}):P}
function readHash(){var m=location.hash.match(/^#(?:tab=)?([a-z0-9-]+)(?:\/([a-z0-9-]+))?/);if(!m)return;var g=GROUPS.filter(function(x){return x.k===m[1]})[0];if(g){state.g=g.k;state.s=m[2]&&g.subs&&g.subs.indexOf(m[2])>-1?m[2]:''}}
function writeHash(){var h=state.g==='todo'?'':'#'+state.g+(state.s?'/'+state.s:'');if(location.hash!==h&&(h||location.hash.indexOf('#tab')===0||GROUPS.some(function(x){return location.hash==='#'+x.k})))history.replaceState(null,'',h||location.pathname)}
function renderTabs(){
  $('#tabs').innerHTML=GROUPS.map(function(g){return '<button class="tab" aria-pressed="'+(g.k===state.g)+'" data-g="'+g.k+'">'+esc(g.l)+(g.subs?' ▾':'')+'</button>'}).join('');
  var g=GROUPS.filter(function(x){return x.k===state.g})[0],sb=$('#subtabs');
  if(g&&g.subs){sb.hidden=false;sb.innerHTML='<button class="chip" aria-pressed="'+(!state.s)+'" data-s="">Todo ('+groupItems(g).length+')</button>'+g.subs.map(function(k){return '<button class="chip" aria-pressed="'+(state.s===k)+'" data-s="'+k+'">'+esc(T[k])+' ('+count(k)+')</button>'}).join('')}else{sb.hidden=true;sb.innerHTML=''}
}
$('#tabs').addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;state.g=b.dataset.g;state.s='';state.n=PAGE;renderTabs();renderGrid();writeHash()});
$('#subtabs').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;state.s=b.dataset.s;state.n=PAGE;renderTabs();renderGrid();writeHash()});
$('#q').addEventListener('input',function(e){state.q=e.target.value.toLowerCase().trim();state.n=PAGE;renderGrid()});
$('#sort').addEventListener('change',function(e){state.sort=e.target.value;state.n=PAGE;renderGrid()});
$('#more').onclick=function(){state.n+=PAGE;renderGrid(true)};
function renderGrid(keep){
  var g=GROUPS.filter(function(x){return x.k===state.g})[0];
  var L=state.q?P:state.s?P.filter(function(p){return inTab(p,state.s)}):groupItems(g);
  if(state.q)L=L.filter(function(p){return (p.full+' '+p.fr).toLowerCase().indexOf(state.q)>-1});
  if(state.sort)L=L.slice().sort(function(a,b){return state.sort==='asc'?a.price-b.price:b.price-a.price});
  var tot=L.length,V=L.slice(0,state.n);
  $('#tabTitle').textContent=state.q?'Resultados para «'+state.q+'»':(state.s?T[state.s]:g.l==='Todo'?'Todo el catálogo':g.l);
  $('#grid').innerHTML=V.map(function(p,i){
    var u=p.imgs[0];
    return '<article class="card'+(p.av?'':' out')+'"><button class="ph" data-open="'+p.id+'" aria-label="Ver '+esc(p.name)+'"><img src="'+img(u,400)+'" srcset="'+img(u,300)+' 300w,'+img(u,450)+' 450w,'+img(u,600)+' 600w" sizes="(max-width:600px) 46vw,230px" width="400" height="400" alt="'+esc(p.name)+'" '+(i<4&&!keep?'fetchpriority="high"':'loading="lazy"')+' decoding="async"></button><div class="b"><span class="fr">'+esc(p.fr)+'</span><h3 data-open="'+p.id+'">'+esc(p.name)+'</h3><div class="pr">'+fmt(p.price)+'</div>'+(p.av?'<button class="btn" data-add="'+p.id+'">Agregar</button>':'<button class="btn" disabled>Agotado</button>')+'</div></article>'}).join('');
  $('#empty').hidden=!!tot;$('#count').textContent=tot+' productos';$('#more').hidden=tot<=state.n;
}
$('#grid').addEventListener('click',function(e){
  var a=e.target.closest('[data-add]');if(a){add(a.dataset.add);openCart(true);return}
  var o=e.target.closest('[data-open]');if(o)openPdp(o.dataset.open)});
window.addEventListener('hashchange',function(){readHash();state.n=PAGE;renderTabs();renderGrid()});

/* ---------- ficha ---------- */
var cur=null,dlg=$('#pdp');
function setImg(u,alt){var i=$('#pdpImg');i.src=img(u,700);i.alt=alt}
function openPdp(id){
  var p=byId[id];cur=p;$('#pdpTitle').textContent=p.name;$('#pdpFr').textContent=p.fr+' · '+p.cat;$('#pdpPrice').textContent=fmt(p.price);$('#pdpAdd').disabled=!p.av;$('#pdpAdd').textContent=p.av?'Agregar a la cesta':'Agotado';$('#pdpLink').href=p.url;
  setImg(p.imgs[0],p.name);
  $('#thumbs').innerHTML=p.imgs.length>1?p.imgs.map(function(u,i){return '<button data-i="'+i+'" aria-label="Foto '+(i+1)+'" '+(i?'':'aria-current="true"')+'><img src="'+img(u,112)+'" width="56" height="56" alt="" loading="lazy"></button>'}).join(''):'';
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')
}
$('#thumbs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call($('#thumbs').children,function(x){x.removeAttribute('aria-current')});b.setAttribute('aria-current','true');setImg(cur.imgs[+b.dataset.i],cur.name)});
$('#pdpAdd').onclick=function(){add(cur.id);dlg.close();openCart(true)};
$('#pdpClose').onclick=function(){dlg.close()};
dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){openCart(false)}});

/* ---------- agente IA de regalos (flujo guiado, sin LLM en la demo) ---------- */
var ag={who:'',fr:'',max:0,nombre:'',tel:'',step:'',started:false};
var msgs=$('#msgs'),opts=$('#opts'),form=$('#agentForm'),inp=$('#agentInput');
function say(t,me){var d=document.createElement('div');d.className='m '+(me?'me':'bot');d.textContent=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight}
function choose(list,cb){opts.innerHTML='';form.hidden=true;list.forEach(function(o){var b=document.createElement('button');b.type='button';b.textContent=o.l||o;b.onclick=function(){say(o.l||o,true);cb(o.v!==undefined?o.v:o)};opts.appendChild(b)})}
function start(){
  if(ag.started)return;ag.started=true;
  say('Hola, soy el asistente IA de la tienda. Te ayudo a encontrar el regalo de terror perfecto en un minuto. ¿Para quién es?');
  choose([{l:'Para mí',v:'mí'},{l:'Para un regalo',v:'regalo'}],function(v){ag.who=v;askFr()})
}
function askFr(){
  say('¿Qué peli, serie o saga os vuelve locos?');
  choose(['Scream','Stranger Things','Halloween','IT','Terrifier','Godzilla','Sorpréndeme'],function(v){ag.fr=v==='Sorpréndeme'?'':v;askBudget()})
}
function askBudget(){
  say('¿Qué presupuesto manejas?');
  choose([{l:'Hasta 30 €',v:30},{l:'30–70 €',v:70},{l:'70–130 €',v:130},{l:'Sin límite',v:9999}],function(v){ag.max=v;recommend()})
}
function recommend(){
  var min=ag.max===70?30:ag.max===130?70:ag.max===9999?130:0;
  var L=P.filter(function(p){return p.av}).map(function(p){var s=0;if(ag.fr&&p.f===ag.fr)s+=4;if(p.price>=min&&p.price<=ag.max)s+=3;else s-=Math.abs(p.price-(min+ag.max)/2)/100;return{p:p,s:s}}).sort(function(a,b){return b.s-a.s}).slice(0,3);
  say(ag.fr&&L[0].p.f!==ag.fr?'De '+ag.fr+' no tengo nada en ese rango, pero mira estas rarezas que encajan:':'Te recomiendo estas '+L.length+' opciones:');
  L.forEach(function(x){var p=x.p,d=document.createElement('div');d.className='rec';d.innerHTML='<img src="'+img(p.imgs[0],112)+'" width="56" height="56" alt="" loading="lazy"><div><strong>'+esc(p.name)+'</strong><br>'+fmt(p.price)+'<br><button data-id="'+p.id+'">Agregar a la cesta</button></div>';d.querySelector('button').onclick=function(){add(p.id);openCart(true)};msgs.appendChild(d)});
  msgs.scrollTop=msgs.scrollHeight;ag.pick=L.map(function(x){return x.p.name}).join(' | ');
  choose([{l:'Quiero que me avisen de novedades',v:'lead'},{l:'Empezar de nuevo',v:'again'}],function(v){if(v==='again'){ag.started=false;start()}else askName()})
}
function askName(){ag.step='nombre';opts.innerHTML='';say('Perfecto. ¿Cómo te llamas?');form.hidden=false;inp.type='text';inp.placeholder='Tu nombre';inp.focus()}
form.addEventListener('submit',function(e){
  e.preventDefault();var v=inp.value.trim();if(!v)return;inp.value='';say(v,true);
  if(ag.step==='nombre'){ag.nombre=v;ag.step='tel';say('¿Y un teléfono para avisarte?');inp.type='tel';inp.placeholder='Tu teléfono'}
  else if(ag.step==='tel'){
    if(v.replace(/\D/g,'').length<9){say('Ese teléfono no parece completo. Escríbelo con 9 cifras.');return}
    ag.tel=v;ag.step='';form.hidden=true;sendLead();say('Gracias, '+ag.nombre+'. Hemos anotado tu contacto. En esta demo solo se avisa al equipo de WhiteMoon; en la tienda real llegaría a la tienda.')}
});
function sendLead(){
  var body=JSON.stringify({nombre:ag.nombre,telefono:ag.tel,sector:'tienda-terror',interes:(ag.who==='mí'?'Compra para sí':'Regalo')+(ag.fr?' · '+ag.fr:''),mensaje:'Presupuesto hasta '+(ag.max===9999?'sin límite':ag.max+' €')+'. Sugeridos: '+(ag.pick||''),origen:'demo-muertosderisa',fecha:new Date().toISOString()});
  try{if(!(navigator.sendBeacon&&navigator.sendBeacon(LEAD_URL,new Blob([body],{type:'text/plain;charset=UTF-8'}))))fetch(LEAD_URL,{method:'POST',body:body,keepalive:true,headers:{'Content-Type':'text/plain;charset=UTF-8'}}).catch(function(){})}catch(e){console.warn('lead no enviado',e)}
}
function toggleAgent(o){var a=$('#agent');a.hidden=!o;$('#agentFab').setAttribute('aria-expanded',o);if(o)start()}
$('#agentFab').onclick=function(){toggleAgent($('#agent').hidden)};
$('#agentClose').onclick=function(){toggleAgent(false)};
$('#heroAgent').onclick=function(){toggleAgent(true)};

readHash();renderTabs();renderGrid();renderCart();
})();
