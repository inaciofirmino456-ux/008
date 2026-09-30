const C=window.TASQUINHA_SUPABASE;const sb=window.supabase.createClient(C.url,C.key);const SITE_URL=(C.siteUrl||location.origin).replace(/\/$/,"");const AUTH_REDIRECT=`${SITE_URL}/gestao-7f4c9a2d.html`;const $=s=>document.querySelector(s);let cats=[],items=[];
async function session(){
  const {data:{session},error}=await sb.auth.getSession();
  if(error){showLogin("Não foi possível verificar a sessão.");return}
  if(!session){showLogin();return}
  $("#loginBox").classList.add("hidden");
  $("#panel").classList.remove("hidden");
  $("#logoutButton").classList.remove("hidden");
  await loadAll();
}
function showLogin(message=""){
  $("#panel").classList.add("hidden");
  $("#logoutButton").classList.add("hidden");
  $("#loginBox").classList.remove("hidden");
  $("#loginError").textContent=message||"";
}
async function initAuth(){
  $("#loginForm").onsubmit=async e=>{
    e.preventDefault();
    const btn=$("#loginButton"); btn.disabled=true; btn.textContent="A entrar…";
    $("#loginError").textContent="";
    try{
      const {error}=await sb.auth.signInWithPassword({
        email:$("#loginEmail").value.trim(),
        password:$("#loginPassword").value
      });
      if(error)throw error;
      await session();
    }catch(e){showLogin(e.message||"Email ou palavra-passe inválidos.");}
    finally{btn.disabled=false;btn.textContent="Entrar";}
  };
  $("#recoverButton").onclick=async()=>{
    const email=$("#loginEmail").value.trim();
    if(!email)return $("#loginError").textContent="Indica o email do dono.";
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:AUTH_REDIRECT});
    $("#loginError").textContent=error?error.message:"Enviámos o email de recuperação.";
  };
  $("#logoutButton").onclick=async()=>{await sb.auth.signOut();showLogin("Sessão terminada.");};
  sb.auth.onAuthStateChange((_event,_session)=>{setTimeout(()=>session(),0);});
  await session();
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
$("#saveSettings").onclick=async()=>{const q=await sb.from("restaurant_settings").select("id").limit(1).single();if(q.error)return alert(q.error.message);const p={name:$("#sName").value.trim(),phone:$("#sPhone").value.trim(),whatsapp:$("#sWhatsApp").value.trim(),email:$("#sEmail").value.trim(),admin_email:$("#sAdminEmail").value.trim(),address:$("#sAddress").value.trim(),hours:JSON.stringify($("#sHours").value.trim()),maps_url:$("#sMaps").value.trim(),updated_at:new Date().toISOString()};const r=await sb.from("restaurant_settings").update(p).eq("id",q.data.id);alert(r.error?r.error.message:"Dados guardados.");if(!r.error)await loadAll()};
$("#itemForm").onsubmit=async e=>{e.preventDefault();const r=await sb.from("menu_items").insert({category_id:$("#iCategory").value,name:$("#iName").value.trim(),description:$("#iDesc").value.trim(),price_cents:$("#iPrice").value===""?null:Math.round(Number($("#iPrice").value)*100),image_url:$("#iImage").value.trim()||null,sold_out:$("#iSold").checked,is_specialty:$("#iSpecial").checked,active:true,sort_order:items.length+1});if(r.error)alert(r.error.message);else{e.target.reset();await loadAll()}};
$("#saveDaily").onclick=async()=>{if(!$("#dDate").value)return alert("Escolhe a data.");const r=await sb.from("daily_dishes").upsert({dish_date:$("#dDate").value,name:$("#dName").value.trim(),description:$("#dDesc").value.trim(),price_cents:$("#dPrice").value===""?null:Math.round(Number($("#dPrice").value)*100),image_url:$("#dImage").value.trim()||null,published:$("#dPublished").checked},{onConflict:"dish_date"});alert(r.error?r.error.message:"Prato do dia guardado.");if(!r.error)await loadAll()};
$("#galleryForm").onsubmit=async e=>{e.preventDefault();const f=$("#gFile").files[0];if(!f)return alert("Escolhe uma imagem.");const path="gallery/"+Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-");const up=await sb.storage.from("restaurant-media").upload(path,f,{upsert:false});if(up.error)return alert(up.error.message);const url=sb.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl;const r=await sb.from("gallery").insert({image_url:url,caption:$("#gCaption").value.trim(),sort_order:Date.now(),active:true});alert(r.error?r.error.message:"Foto carregada.");if(!r.error){e.target.reset();await loadAll()}};

document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{localStorage.setItem("adminTab",b.dataset.tab);document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));$("#"+b.dataset.tab).classList.remove("hidden")});
async function restoreAdminTab(){const tab=localStorage.getItem("adminTab")||"settings";const el=$("#"+tab);if(el){document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));el.classList.remove("hidden");}}

initAuth();