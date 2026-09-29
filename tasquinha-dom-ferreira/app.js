const CONFIG=window.TASQUINHA_SUPABASE;
const DEMO={settings:{phone:'+351 253 262 870',whatsapp:'',email:'tasquinhadomferreira@gmail.com',address:'Rua de São Vicente 35, 4710-312 Braga',hours:'Segunda a sábado · 12:00–15:00 · 19:30–22:00<br>Domingo · Fechado',maps_url:'https://www.google.com/maps/search/?api=1&query=Tasquinha+Dom+Ferreira%2C+Rua+de+S%C3%A3o+Vicente+35%2C+4710-312+Braga%2C+Portugal'},daily:{name:'Arroz de Pato à Moda da Casa',description:'A especialidade da casa, em dose generosa e servida à moda tradicional.',price:'20,00 €',image:'https://www.airial.travel/_next/image?q=70&url=https%3A%2F%2Fmedia-cdn.tripadvisor.com%2Fmedia%2Fphoto-w%2F27%2F42%2F7f%2F98%2Fcaption.jpg&w=3840'},menu:[{category:'Entradas & Petiscos',items:[['Pataniscas','Petisco da casa',''],['Petingas','Pequenas sardinhas fritas',''],['Bolinhos de Bacalhau','Tradicional','']]},{category:'Pratos',items:[['Arroz de Pato','Especialidade da casa','20,00 €'],['Bacalhau à Braga','Bacalhau, batata e cebolada','26,00 €'],['Rancho','Receita tradicional minhota','18,00 €'],['Iscas de Fígado de Vitela','Com acompanhamento','18,00 €']]},{category:'Sobremesas',items:[['Leite Creme','Caseiro e queimado na hora',''],['Bolo de Bolacha','Receita da casa',''],['Tiramisu','Caseiro','']]}]};
const $=s=>document.querySelector(s); const tel=v=>'tel:'+String(v||'').replace(/[^\d+]/g,'');
function waLink(number,text){const n=String(number||'').replace(/\D/g,'');return n?`https://wa.me/${n}?text=${encodeURIComponent(text)}`:''}
function money(c){return c==null?'Consultar':(c/100).toLocaleString('pt-PT',{style:'currency',currency:'EUR'})}
async function loadData(){
 try{
  const sb=window.supabase.createClient(CONFIG.url,CONFIG.key);
  const [{data:s},{data:cats},{data:items},{data:daily}]=await Promise.all([
   sb.from('restaurant_settings').select('*').limit(1).maybeSingle(),
   sb.from('menu_categories').select('*').eq('active',true).order('sort_order'),
   sb.from('menu_items').select('*').eq('active',true).order('sort_order'),
   sb.from('daily_dishes').select('*').eq('published',true).order('dish_date',{ascending:false}).limit(1).maybeSingle()
  ]);
  if(!s&&!cats?.length&&!items?.length&&!daily)return DEMO;
  const menu=(cats||[]).map(c=>({category:c.name,items:(items||[]).filter(i=>i.category_id===c.id).map(i=>[i.name,i.description,money(i.price_cents),i.image_url,i.sold_out])}));
  return {settings:{...DEMO.settings,...(s||{})},daily:daily?{name:daily.name,description:daily.description,price:money(daily.price_cents),image:daily.image_url}:DEMO.daily,menu:menu.length?menu:DEMO.menu};
 }catch(e){console.warn('Supabase indisponível, a usar conteúdo de demonstração.',e);return DEMO}
}
function render(data){
 const d=data.daily;
 $('#dailyContent').innerHTML=`<div><div class="section-kicker" style="color:#f0c8bf">PRATO DO DIA</div><h2>${d.name}</h2><p>${d.description}</p><div class="daily-actions"><a class="btn" style="background:#f6f0e6;color:#8e2d20" href="${waLink(data.settings.whatsapp,`Olá, gostaria de pedir: ${d.name}`)||tel(data.settings.phone)}" target="${data.settings.whatsapp?'_blank':'_self'}">Pedir / contactar</a></div></div><div><div class="daily-price">${d.price||'Consultar'}</div><p>Atualizado pelo restaurante</p></div>`;
 $('#menuGrid').innerHTML=data.menu.map(c=>`<div class="menu-category"><h3>${c.category}</h3>${c.items.map(i=>`<div class="dish"><div><strong>${i[0]}</strong><p>${i[1]}</p></div><div class="price">${i[2]||'Consultar'}${i[4]?'<small>Indisponível</small>':''}</div></div>`).join('')}</div>`).join('');
 $('#addressText').textContent=data.settings.address; $('#hoursText').innerHTML=data.settings.hours; const phone=data.settings.phone||DEMO.settings.phone;
 $('#phoneLink').textContent=phone; $('#phoneLink').href=tel(phone); ['headerContact','heroContact','mobileContact'].forEach(id=>{const e=$('#'+id);if(e)e.href=tel(phone)}); $('#messageLink').href=`sms:${phone}`;
 const wa=waLink(data.settings.whatsapp,'Olá, gostaria de fazer uma reserva/pedido na Tasquinha Dom Ferreira.'); if(wa){$('#whatsappLink').href=wa;$('#whatsappLink').classList.remove('hidden')}
 const map=$('.map-link'); if(map&&data.settings.maps_url)map.href=data.settings.maps_url; $('#year').textContent=new Date().getFullYear();
}
loadData().then(render);
