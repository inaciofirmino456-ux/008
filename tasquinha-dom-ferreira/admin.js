const C=window.TASQUINHA_SUPABASE;const sb=window.supabase.createClient(C.url,C.key);const SITE_URL=(C.siteUrl||location.origin).replace(/\/$/,"");const AUTH_REDIRECT=`${SITE_URL}/gestao-7f4c9a2d.html`;const $=s=>document.querySelector(s);let cats=[],items=[];
async function session(){const r=await sb.auth.getSession();if(r.data.session){$("#auth").classList.add("hidden");$("#panel").classList.remove("hidden");$("#logout").classList.remove("hidden");await loadAll()}else{$("#auth").classList.remove("hidden");$("#panel").classList.add("hidden");$("#logout").classList.add("hidden")}}
async function loadAll(){
 const r=await Promise.all([sb.from("restaurant_settings").select("*").limit(1).maybeSingle(),sb.from("menu_categories").select("*").order("sort_order"),sb.from("menu_items").select("*").order("sort_order"),sb.from("daily_dishes").select("*").order("dish_date",{ascending:false}),sb.from("gallery").select("*").order("sort_order"),sb.from("orders").select("*").order("created_at",{ascending:false})]);
 cats=r[1].data||[];items=r[2].data||[];const s=r[0].data;
 if(s){$("#sName").value=s.name||"";$("#sPhone").value=s.phone||"";$("#sWhatsApp").value=s.whatsapp||"";$("#sEmail").value=s.email||"";$("#sAdminEmail").value=s.admin_email||"";$("#sAddress").value=s.address||"";let hrs=s.hours;try{if(typeof hrs==="string"&&hrs.trim().startsWith('"'))hrs=JSON.parse(hrs)}catch{}$("#sHours").value=hrs||"";$("#sMaps").value=s.maps_url||""}
 $("#iCategory").innerHTML=cats.map(x=>"<option value='"+x.id+"'>"+x.name+"</option>").join("");renderMenu();renderDaily(r[3].data||[]);renderGallery(r[4].data||[]);renderOrders(r[5].data||[])
}
function renderMenu(){const html=cats.map(c=>"<h3>"+c.name+"</h3>"+items.filter(i=>i.category_id===c.id).map(i=>"<div class='item'><div><b>"+i.name+"</b><br>"+(i.price_cents==null?"Consultar":(i.price_cents/100).toFixed(2)+" €")+" "+(i.sold_out?"· ESGOTADO":"")+(i.is_specialty?" · ESPECIALIDADE":"")+"</div><button class='danger' onclick=\"removeItem('"+i.id+"')\">Apagar</button></div>").join("")).join("");$("#menuList").innerHTML=html||"<p>Sem pratos.</p>"}
async function removeItem(id){if(!confirm("Apagar este prato?"))return;const r=await sb.from("menu_items").delete().eq("id",id);if(r.error)alert(r.error.message);else loadAll()}
function renderDaily(rows){$("#dailyList").innerHTML=rows.length?rows.map(d=>"<div class='item'><div><b>"+d.dish_date+"</b> · "+d.name+"<br>"+(d.published?"Publicado":"Oculto")+"</div><button class='danger' onclick=\"deleteDaily('"+d.id+"')\">Apagar</button></div>").join(""):"<p>Sem pratos do dia.</p>"}
async function deleteDaily(id){if(!confirm("Apagar prato do dia?"))return;const r=await sb.from("daily_dishes").delete().eq("id",id);if(r.error)alert(r.error.message);else loadAll()}
function renderGallery(rows){$("#galleryList").innerHTML=rows.length?rows.map(g=>"<div class='gitem'><div><img class='photo' src='"+g.image_url+"' alt=''><br>"+(g.caption||"")+"</div><button class='danger' onclick=\"deleteGallery('"+g.id+"')\">Apagar</button></div>").join(""):"<p>Sem fotos.</p>"}
function renderOrders(rows){$("#ordersList").innerHTML=rows.length?rows.map(o=>"<div class='item'><div><b>"+(o.customer_name||"Cliente")+"</b> · "+new Date(o.created_at).toLocaleString("pt-PT")+"<br>"+(o.customer_phone||"")+"<br>"+(o.items||[]).map(i=>i.quantity+"× "+i.name).join(", ")+"<br>Estado: <select onchange=\"setOrderStatus('"+o.id+"',this.value)\"><option "+(o.status==="new"?"selected":"")+" value='new'>Novo</option><option "+(o.status==="contacted"?"selected":"")+" value='contacted'>Contactado</option><option "+(o.status==="confirmed"?"selected":"")+" value='confirmed'>Confirmado</option><option "+(o.status==="completed"?"selected":"")+" value='completed'>Concluído</option><option "+(o.status==="cancelled"?"selected":"")+" value='cancelled'>Cancelado</option></select><br>"+(o.notes||"")+"</div></div>").join(""):"<p>Sem pedidos.</p>"}
async function setOrderStatus(id,status){const r=await sb.from("orders").update({status}).eq("id",id);if(r.error)alert(r.error.message)}
async function deleteGallery(id){if(!confirm("Apagar foto?"))return;const r=await sb.from("gallery").delete().eq("id",id);if(r.error)alert(r.error.message);else loadAll()}
async function busy(btn,fn){const old=btn.textContent;btn.disabled=true;btn.textContent="Aguarde…";try{await fn()}finally{btn.disabled=false;btn.textContent=old}}
$("#login").onclick=()=>busy($("#login"),async()=>{const r=await sb.auth.signInWithPassword({email:$("#email").value.trim(),password:$("#password").value});$("#authMsg").textContent=r.error?r.error.message:"";if(!r.error)await session()});
$("#logout").onclick=async()=>{await sb.auth.signOut();await session()};
$("#saveSettings").onclick=async()=>{const q=await sb.from("restaurant_settings").select("id").limit(1).single();if(q.error)return alert(q.error.message);const p={name:$("#sName").value.trim(),phone:$("#sPhone").value.trim(),whatsapp:$("#sWhatsApp").value.trim(),email:$("#sEmail").value.trim(),admin_email:$("#sAdminEmail").value.trim(),address:$("#sAddress").value.trim(),hours:JSON.stringify($("#sHours").value.trim()),maps_url:$("#sMaps").value.trim(),updated_at:new Date().toISOString()};const r=await sb.from("restaurant_settings").update(p).eq("id",q.data.id);alert(r.error?r.error.message:"Dados guardados.");if(!r.error)await loadAll()};
$("#itemForm").onsubmit=async e=>{e.preventDefault();const r=await sb.from("menu_items").insert({category_id:$("#iCategory").value,name:$("#iName").value.trim(),description:$("#iDesc").value.trim(),price_cents:$("#iPrice").value===""?null:Math.round(Number($("#iPrice").value)*100),image_url:$("#iImage").value.trim()||null,sold_out:$("#iSold").checked,is_specialty:$("#iSpecial").checked,active:true,sort_order:items.length+1});if(r.error)alert(r.error.message);else{e.target.reset();await loadAll()}};
$("#saveDaily").onclick=async()=>{if(!$("#dDate").value)return alert("Escolhe a data.");const r=await sb.from("daily_dishes").upsert({dish_date:$("#dDate").value,name:$("#dName").value.trim(),description:$("#dDesc").value.trim(),price_cents:$("#dPrice").value===""?null:Math.round(Number($("#dPrice").value)*100),image_url:$("#dImage").value.trim()||null,published:$("#dPublished").checked},{onConflict:"dish_date"});alert(r.error?r.error.message:"Prato do dia guardado.");if(!r.error)await loadAll()};
$("#galleryForm").onsubmit=async e=>{e.preventDefault();const f=$("#gFile").files[0];if(!f)return alert("Escolhe uma imagem.");const path="gallery/"+Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-");const up=await sb.storage.from("restaurant-media").upload(path,f,{upsert:false});if(up.error)return alert(up.error.message);const url=sb.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl;const r=await sb.from("gallery").insert({image_url:url,caption:$("#gCaption").value.trim(),sort_order:Date.now(),active:true});alert(r.error?r.error.message:"Foto carregada.");if(!r.error){e.target.reset();await loadAll()}};

async function fileToDataUrl(file){return await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file)})}
async function uploadAiImage(base64, prefix){
  const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const path="ai/"+prefix+"-"+Date.now()+".png";
  const up=await sb.storage.from("restaurant-media").upload(path,bytes,{contentType:"image/png",upsert:false});
  if(up.error)throw up.error;
  return sb.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl;
}
async function prepareWithAI(file,purpose,previewEl){
  if(!file)return alert("Escolhe primeiro uma foto.");
  if(file.size>8*1024*1024)return alert("A foto é demasiado grande. Escolhe uma imagem até 8 MB.");
  const btn=purpose==="daily"?$("#aiDaily"):$("#aiMenu");
  await busy(btn,async()=>{
    if(previewEl)previewEl.classList.remove("hidden");
    if(previewEl)previewEl.innerHTML="<p>✨ A IA está a preparar a foto e a descrição…</p>";
    const dataUrl=await fileToDataUrl(file);
    const r=await sb.functions.invoke("prepare-food-photo",{body:{image:dataUrl,purpose}});
    if(r.error)throw new Error(r.error.message||"Não foi possível contactar a IA.");
    const d=r.data||{};
    if(d.error)throw new Error(d.error);
    const url=await uploadAiImage(d.image_base64,purpose);
    if(purpose==="daily"){
      $("#dImage").value=url;
      if(d.name)$("#dName").value=d.name;
      if(d.description)$("#dDesc").value=d.description;
      if(previewEl)previewEl.innerHTML="<b>Pré-visualização pronta ✓</b><img src='"+url+"' alt='Pré-visualização do prato'><p>"+(d.description||"Descrição preparada pela IA.")+"</p>";
    }else{
      $("#iImage").value=url;
      if(d.name&&(!$("#iName").value.trim()||$("#iName").value.trim()==="Prato do dia"))$("#iName").value=d.name;
      if(d.description)$("#iDesc").value=d.description;
      alert("✨ Foto preparada pela IA. Revê os dados e adiciona o prato.");
    }
  }).catch(e=>alert(e.message||"Erro ao preparar a foto."));
}
$("#dFile").onchange=()=>{const f=$("#dFile").files[0];if(f)prepareWithAI(f,"daily",$("#aiPreview"))};
$("#iFile").onchange=()=>{const f=$("#iFile").files[0];if(f)prepareWithAI(f,"menu",null)};

document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));$("#"+b.dataset.tab).classList.remove("hidden")});session();