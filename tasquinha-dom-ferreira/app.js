const CONFIG=window.TASQUINHA_SUPABASE;
const DEMO={settings:{phone:'+351 253 262 870',whatsapp:'',email:'tasquinhadomferreira@gmail.com',address:'Rua de São Vicente 33-35, 4710-312 Braga',hours:'Segunda a sábado · 12:00–15:00 · 19:30–22:00<br>Domingo · Fechado',maps_url:'https://www.google.com/maps/search/?api=1&query=Tasquinha+Dom+Ferreira%2C+Rua+de+S%C3%A3o+Vicente+33-35%2C+4710-312+Braga%2C+Portugal'},daily:{name:'Arroz de Pato à Moda da Casa',description:'A especialidade da casa, em dose generosa e servida à moda tradicional.',price:'20,00 €',image:'https://media-cdn.tripadvisor.com/media/photo-w/27/42/7f/98/caption.jpg'},menu:[{category:'Entradas & Petiscos',items:[{id:'pataniscas',name:'Pataniscas',description:'Petisco da casa',price:null},{id:'petingas',name:'Petingas',description:'Pequenas sardinhas fritas',price:null},{id:'bolinhos',name:'Bolinhos de Bacalhau',description:'Tradicional',price:1800}]},{category:'Pratos',items:[{id:'arroz-pato',name:'Arroz de Pato',description:'Especialidade da casa',price:2000,specialty:true},{id:'bacalhau-braga',name:'Bacalhau à Braga',description:'Bacalhau, batata e cebolada',price:2600,specialty:true},{id:'rancho',name:'Rancho',description:'Receita tradicional minhota',price:1800},{id:'iscas',name:'Iscas de Fígado de Vitela',description:'Com acompanhamento',price:1800}]},{category:'Sobremesas',items:[{id:'leite-creme',name:'Leite Creme',description:'Caseiro e queimado na hora',price:null},{id:'bolo-bolacha',name:'Bolo de Bolacha',description:'Receita da casa',price:null},{id:'tiramisu',name:'Tiramisu',description:'Caseiro',price:null}]}]};
const $=s=>document.querySelector(s); const tel=v=>'tel:'+String(v||'').replace(/[^\d+]/g,'');
const money=c=>c==null?'Consultar':(c/100).toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
function waLink(number,text){const n=String(number||'').replace(/\D/g,'');return n?`https://wa.me/${n}?text=${encodeURIComponent(text)}`:''}
let DATA=null;let CART=[];

async function api(table,query='',options={}){
 const headers={apikey:CONFIG.key,Authorization:'Bearer '+CONFIG.key,...(options.headers||{})};
 const r=await fetch(CONFIG.url+'/rest/v1/'+table+(query?'?'+query:''),{...options,headers,cache:'no-store'});
 if(!r.ok)throw new Error(table+' '+r.status+' '+await r.text());
 if(r.status===204)return null;
 return r.json();
}
async function loadData(){
 try{
  const [settings,cats,items,daily]=await Promise.all([
   api('restaurant_settings','select=*&limit=1'),
   api('menu_categories','select=*&active=eq.true&order=sort_order.asc'),
   api('menu_items','select=*&active=eq.true&order=sort_order.asc'),
   api('daily_dishes','select=*&published=eq.true&order=dish_date.desc&limit=1')
  ]);
  const s=settings?.[0]||null; const d=daily?.[0]||null;
  const menu=(cats||[]).map(c=>({category:c.name,items:(items||[]).filter(i=>i.category_id===c.id).map(i=>({id:i.id,name:i.name,description:i.description,price:i.price_cents,image:i.image_url,sold_out:i.sold_out,specialty:i.is_specialty}))}));
  return {settings:{...DEMO.settings,...(s||{})},daily:d?{id:d.id,name:d.name,description:d.description,price:d.price_cents,image:d.image_url}:null,menu:menu.length?menu:DEMO.menu};
 }catch(e){console.error('Erro ao carregar dados públicos:',e);return DEMO}
}
function addToCart(item){if(item.sold_out)return;const key=String(item.id);const x=CART.find(i=>String(i.id)===key);if(x)x.qty++;else CART.push({...item,qty:1});updateCartButton();openCart();}
function changeQty(id,delta){const x=CART.find(i=>String(i.id)===String(id));if(!x)return;x.qty+=delta;if(x.qty<=0)CART=CART.filter(i=>String(i.id)!==String(id));renderCart();updateCartButton();}
function cartTotal(){return CART.reduce((n,i)=>n+(i.price||0)*i.qty,0)}
function updateCartButton(){const n=CART.reduce((x,i)=>x+i.qty,0);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=n)}
function ensureCartModal(){
 if($('#orderModal'))return;
 const m=document.createElement('div');m.id='orderModal';m.className='order-modal hidden';m.innerHTML='<div class="order-box"><button class="order-close" aria-label="Fechar">×</button><div class="section-kicker">PEDIR</div><h2>O seu pedido.</h2><div id="cartItems"></div><div id="cartTotal" class="cart-total"></div><form id="orderForm"><input id="customerName" required placeholder="Nome"><input id="customerPhone" required placeholder="Telefone"><textarea id="orderNotes" placeholder="Mesa, levantamento ou outras notas"></textarea><button class="btn primary" type="submit">Enviar pedido</button><p id="orderStatus"></p></form></div></div>';
 document.body.appendChild(m);
 m.querySelector('.order-close').onclick=()=>m.classList.add('hidden');
 m.addEventListener('click',e=>{if(e.target===m)m.classList.add('hidden')});
 $('#orderForm').onsubmit=submitOrder;
}
function renderCart(){
 ensureCartModal();const box=$('#cartItems');
 if(!CART.length){box.innerHTML='<p>O pedido está vazio. Escolha um prato na ementa.</p>';$('#cartTotal').textContent='';return}
 box.innerHTML=CART.map(i=>'<div class="cart-row"><div><strong>'+i.name+'</strong><br><small>Preço a confirmar</small></div><div class="qty"><button type="button" data-minus="'+i.id+'">−</button><b>'+i.qty+'</b><button type="button" data-plus="'+i.id+'">+</button></div></div>').join('');
 $('#cartTotal').textContent='Preços e disponibilidade serão confirmados pelo restaurante.'
 box.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
 box.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
}
function openCart(){ensureCartModal();renderCart();$('#orderModal').classList.remove('hidden')}
async function submitOrder(e){
 e.preventDefault();if(!CART.length){$('#orderStatus').textContent='Adicione pelo menos um item.';return}
 const order={customer_name:$('#customerName').value.trim(),customer_phone:$('#customerPhone').value.trim(),order_type:DATA.settings.whatsapp?'whatsapp':'contact',items:CART.map(i=>({name:i.name,quantity:i.qty,unit_price_cents:i.price})),notes:$('#orderNotes').value.trim(),status:'new'};
 $('#orderStatus').textContent='A enviar…';
 try{
  await api('orders','',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(order)});
  const lines=CART.map(i=>`${i.qty}x ${i.name}`).join('\n');
  const msg=`Olá, sou ${order.customer_name}.\nGostaria de saber os preços e fazer esta encomenda:\n${lines}\nTelefone: ${order.customer_phone}${order.notes?'\nNotas: '+order.notes:''}`;
  const wa=waLink(DATA.settings.whatsapp,msg);
  $('#orderStatus').innerHTML=wa?'Pedido registado. A abrir WhatsApp…':'Pedido registado. O restaurante irá contactar pelo telefone.';
  CART=[];updateCartButton();renderCart();
  if(wa)setTimeout(()=>window.open(wa,'_blank','noopener'),300);
 }catch(err){$('#orderStatus').textContent='Não foi possível enviar o pedido. Tente novamente ou ligue para '+DATA.settings.phone+'.';console.error(err)}
}
function setupMotion(){
 const targets=document.querySelectorAll('.hero-copy,.daily,.split,.menu-section,.feature,.gallery-section,.reviews,.contact,.history-strip');
 targets.forEach(el=>el.classList.add('reveal-ready'));
 if(!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('revealed'));return}
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}}),{threshold:.12});
 targets.forEach(el=>io.observe(el));
}
function render(data){
 DATA=data;const d=data.daily;
 $('#dailyContent').innerHTML='<div><div class="section-kicker" style="color:#f0c8bf">PRATO DO DIA</div><h2>'+d.name+'</h2><p>'+d.description+'</p><div class="daily-actions"><button class="btn" style="background:#f6f0e6;color:#8e2d20" type="button" id="dailyOrder">Pedir / contactar</button></div></div><div><div class="daily-price">Consultar</div><p>Contacte a Tasquinha para confirmar o prato e o preço.</p></div>';
 $('#dailyOrder').onclick=()=>addToCart({id:d.id||'daily',name:d.name,description:d.description,price:typeof d.price==='number'?d.price:0});
 $('#menuGrid').innerHTML=data.menu.map(c=>'<div class="menu-category"><h3>'+c.category+'</h3>'+c.items.map(i=>'<div class="dish"><div><strong>'+i.name+'</strong>'+(i.specialty?'<span class="specialty"> · Especialidade</span>':'')+'<p>'+i.description+'</p></div><div class="price">'+(i.sold_out?'<small>Esgotado</small>':'')+(!i.sold_out?'<button class="add-btn" type="button" data-add="'+i.id+'">Adicionar</button>':'')+'</div></div>').join('')+'</div>').join('');
 data.menu.flatMap(c=>c.items).forEach(i=>{const b=document.querySelector('[data-add="'+i.id+'"]');if(b)b.onclick=()=>addToCart(i)});
 $('#addressText').textContent=data.settings.address||DEMO.settings.address;
 $('#hoursText').innerHTML=typeof data.settings.hours==='string'?data.settings.hours:JSON.stringify(data.settings.hours||'').replace(/^"|"$/g,'');
 const phone=data.settings.phone||DEMO.settings.phone;$('#phoneLink').textContent=phone;$('#phoneLink').href=tel(phone);
 ['headerContact','heroContact','mobileContact'].forEach(id=>{const e=$('#'+id);if(e)e.href=tel(phone)});
 $('#messageLink').href='sms:'+phone;
 const waNumber=data.settings.whatsapp||data.settings.phone;const wa=waLink(waNumber,'Olá! Gostaria de saber os preços dos pratos, o prato do dia e fazer uma encomenda na Tasquinha Dom Ferreira.');if(wa){$('#whatsappLink').href=wa;$('#whatsappLink').classList.remove('hidden')}
 const map=$('.map-link');if(map&&data.settings.maps_url)map.href=data.settings.maps_url;
 const mobile=$('#mobileOrder');if(mobile){mobile.href='#';mobile.onclick=e=>{e.preventDefault();openCart()}}
 ensureCartModal();updateCartButton();fixImages();setupMotion();$('#year').textContent=new Date().getFullYear();
}
function fixImages(){document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{if(img.dataset.fallbackApplied)return;img.dataset.fallbackApplied='1';img.src='https://www.airial.travel/_next/image?q=75&url=https%3A%2F%2Fmedia-cdn.tripadvisor.com%2Fmedia%2Fphoto-w%2F14%2F18%2F1c%2F58%2Fphoto7jpg.jpg&w=3840';img.classList.add('bad');if(img.parentElement)img.parentElement.classList.add('photo-failed')},{once:true})})}
async function refreshPublic(){const data=await loadData();render(data)}\nrefreshPublic();
setInterval(refreshPublic,15000);