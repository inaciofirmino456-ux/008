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

async function fileToDataUrl(file){
  return await new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=>resolve(fr.result);
    fr.onerror=reject;
    fr.readAsDataURL(file);
  });
}
async function compressImage(file){
  if(file.size<=2.5*1024*1024) return await fileToDataUrl(file);
  return await new Promise((resolve,reject)=>{
    const img=new Image();
    const fr=new FileReader();
    fr.onload=()=>{
      img.onload=()=>{
        const max=1600;
        const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.82));
      };
      img.onerror=()=>reject(new Error("Não foi possível ler a fotografia."));
      img.src=fr.result;
    };
    fr.onerror=reject;
    fr.readAsDataURL(file);
  });
}
async function uploadAiImage(base64,prefix){
  const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const path="ai/"+prefix+"-"+Date.now()+".png";
  const up=await sb.storage.from("restaurant-media").upload(path,bytes,{contentType:"image/png",upsert:false});
  if(up.error)throw up.error;
  return {path,url:sb.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl};
}
async function removeAiImage(path){
  if(!path)return;
  const r=await sb.storage.from("restaurant-media").remove([path]);
  if(r.error)console.warn("Não foi possível eliminar a imagem temporária:",r.error);
}
async function callAi(file,purpose,action){
  if(!file)return {error:"Escolhe primeiro uma foto."};
  const image=await compressImage(file);
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.access_token)return {error:"A sessão do administrador expirou. Entra novamente."};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),145000);
  try{
    const response=await fetch(C.url+"/functions/v1/prepare-food-photo",{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+session.access_token,
        "apikey":C.key,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({image,purpose,action}),
      signal:controller.signal
    });
    const text=await response.text();
    let data={};
    try{data=JSON.parse(text)}catch{}
    if(!response.ok)throw new Error(data.error||("A IA respondeu com erro "+response.status+"."));
    return data;
  }catch(e){
    if(e.name==="AbortError")throw new Error("A IA demorou demasiado tempo a responder. Tenta novamente com uma foto mais pequena.");
    if(e instanceof TypeError)throw new Error("Não foi possível contactar o serviço de IA. Verifica a internet e tenta novamente.");
    throw e;
  }finally{clearTimeout(timer)}
}
async function prepareWithAI(file,purpose,previewEl){
  if(!file)return alert("Escolhe primeiro uma foto.");
  if(file.size>12*1024*1024)return alert("A foto é demasiado grande. Escolhe uma imagem até 12 MB.");
  const btn=purpose==="daily"?$("#aiDaily"):$("#aiMenu");
  await busy(btn,async()=>{
    if(previewEl){previewEl.classList.remove("hidden");previewEl.innerHTML="<p>✨ A preparar a fotografia… isto pode demorar até 1–2 minutos.</p>"}
    const d=await callAi(file,purpose,"prepare");
    if(d.error)throw new Error(d.error);
    if(!d.image_base64)throw new Error("A IA não devolveu uma imagem.");
    const uploaded=await uploadAiImage(d.image_base64,purpose);
    const state=selectedPhoto[purpose];
    if(state?.aiPath)await removeAiImage(state.aiPath);
    if(state){state.aiPath=uploaded.path;state.aiUrl=uploaded.url}
    if(purpose==="daily"){
      $("#dImage").value=uploaded.url;
      if(d.name)$("#dName").value=d.name;
      if(d.description)$("#dDesc").value=d.description;
      if(previewEl)previewEl.innerHTML="<b>Pré-visualização pronta ✓</b><img src='"+uploaded.url+"' alt='Pré-visualização do prato'><p>"+(d.description||"Descrição preparada pela IA.")+"</p>";
      $("#redoDaily").classList.remove("hidden");
      $("#deleteDailyPhoto").classList.remove("hidden");
    }else{
      $("#iImage").value=uploaded.url;
      if(d.name&&(!$("#iName").value.trim()||$("#iName").value.trim()==="Prato do dia"))$("#iName").value=d.name;
      if(d.description)$("#iDesc").value=d.description;
      $("#redoMenu").classList.remove("hidden");
      $("#deleteMenuPhoto").classList.remove("hidden");
      $("#iPreview").classList.remove("hidden");
      $("#iPreview").innerHTML="<b>Pré-visualização pronta ✓</b><img src='"+uploaded.url+"' alt='Pré-visualização do prato'><p>"+(d.description||"Descrição preparada pela IA.")+"</p>";
    }
  }).catch(e=>{
    if(previewEl){previewEl.classList.remove("hidden");previewEl.innerHTML="<p class='aiError'>⚠️ "+(e.message||"Erro ao preparar a foto.")+"</p>"}
    alert(e.message||"Erro ao preparar a foto.");
  });
}
async function redoDescription(purpose){
  const state=selectedPhoto[purpose];
  if(!state?.file)return alert("Não há uma fotografia selecionada.");
  const btn=purpose==="daily"?$("#redoDaily"):$("#redoMenu");
  await busy(btn,async()=>{
    const target=purpose==="daily"?$("#aiPreview"):$("#iPreview");
    target.classList.remove("hidden");
    target.innerHTML="<p>🔄 A IA está a criar outra descrição…</p>";
    const d=await callAi(state.file,purpose,"describe");
    if(d.error)throw new Error(d.error);
    if(purpose==="daily"){
      if(d.name)$("#dName").value=d.name;
      $("#dDesc").value=d.description||"";
      target.innerHTML="<b>Nova descrição pronta ✓</b><p>"+(d.description||"Sem descrição gerada.")+"</p>";
    }else{
      if(d.name)$("#iName").value=d.name;
      $("#iDesc").value=d.description||"";
      target.innerHTML="<b>Nova descrição pronta ✓</b><img src='"+(state.aiUrl||"")+"' alt='Pré-visualização do prato'><p>"+(d.description||"Sem descrição gerada.")+"</p>";
    }
  }).catch(e=>alert(e.message||"Erro ao refazer a descrição."));
}
async function deleteSelectedPhoto(purpose){
  const state=selectedPhoto[purpose];
  if(state?.aiPath)await removeAiImage(state.aiPath);
  selectedPhoto[purpose]=null;
  if(purpose==="daily"){
    $("#dFile").value="";
    $("#dCamera").value="";
    $("#dImage").value="";
    $("#dOriginalPreview").innerHTML="";
    $("#dOriginalPreview").classList.add("hidden");
    $("#aiPreview").innerHTML="";
    $("#aiPreview").classList.add("hidden");
    $("#redoDaily").classList.add("hidden");
    $("#deleteDailyPhoto").classList.add("hidden");
  }else{
    $("#iFile").value="";
    $("#iCamera").value="";
    $("#iImage").value="";
    $("#iPreview").innerHTML="";
    $("#iPreview").classList.add("hidden");
    $("#redoMenu").classList.add("hidden");
    $("#deleteMenuPhoto").classList.add("hidden");
  }
}
async function prepareSelected(purpose){
  const state=selectedPhoto[purpose];
  return prepareWithAI(state?.file,purpose,purpose==="daily"?$("#aiPreview"):$("#iPreview"));
}
const selectedPhoto={daily:null,menu:null};
function showSelectedPhoto(file,previewEl,purpose){
  if(!file)return;
  const type=(file.type||"").toLowerCase();
  const okType=["image/jpeg","image/png","image/webp"].includes(type)||/\.(jpe?g|png|webp)$/i.test(file.name||"");
  if(!okType)return alert("Escolhe uma imagem JPG, PNG ou WebP.");
  if(file.size>12*1024*1024)return alert("A foto é demasiado grande. Escolhe uma imagem até 12 MB.");
  const previous=selectedPhoto[purpose]; if(previous?.aiPath)removeAiImage(previous.aiPath); selectedPhoto[purpose]={file,aiPath:null,aiUrl:null};
  if(previewEl){
    const url=URL.createObjectURL(file);
    previewEl.classList.remove("hidden");
    previewEl.innerHTML="<b>Foto selecionada ✓</b><img src=\""+url+"\" alt=\"Foto selecionada\"><p>Agora toca em <b>Preparar com IA</b>.</p>";
  }
}
function wirePhotoPicker(inputId,cameraId,galleryBtnId,cameraBtnId,previewId,purpose){
  const input=$("#"+inputId),camera=$("#"+cameraId),galleryBtn=$("#"+galleryBtnId),cameraBtn=$("#"+cameraBtnId),preview=$("#"+previewId);
  galleryBtn.onclick=()=>{localStorage.setItem("adminTab",purpose==="daily"?"daily":"menu");input.click()};
  cameraBtn.onclick=()=>{localStorage.setItem("adminTab",purpose==="daily"?"daily":"menu");camera.click()};
  input.onchange=()=>{const f=input.files[0];if(f)showSelectedPhoto(f,preview,purpose)};
  camera.onchange=()=>{const f=camera.files[0];if(f)showSelectedPhoto(f,preview,purpose)};
}
wirePhotoPicker("dFile","dCamera","dGalleryBtn","dCameraBtn","dOriginalPreview","daily");
wirePhotoPicker("iFile","iCamera","iGalleryBtn","iCameraBtn","iPreview","menu");
$("#aiDaily").onclick=()=>prepareSelected("daily");
$("#aiMenu").onclick=()=>prepareSelected("menu");
$("#redoDaily").onclick=()=>redoDescription("daily");
$("#redoMenu").onclick=()=>redoDescription("menu");
$("#deleteDailyPhoto").onclick=()=>deleteSelectedPhoto("daily");
$("#deleteMenuPhoto").onclick=()=>deleteSelectedPhoto("menu");

document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{localStorage.setItem("adminTab",b.dataset.tab);document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));$("#"+b.dataset.tab).classList.remove("hidden")});\nasync function restoreAdminTab(){const tab=localStorage.getItem("adminTab")||"settings";const el=$("#"+tab);if(el){document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));el.classList.remove("hidden");}}\nconst originalSession=session; session=async()=>{await originalSession();if(!$("#panel").classList.contains("hidden"))await restoreAdminTab()}; session();