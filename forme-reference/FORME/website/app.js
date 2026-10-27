/* FORME storefront. No build tools or framework required. See INTEGRATION.md. */
(async function () {
  'use strict';
  const E=window.FormeEngine, $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const ICONS={
    'arrow-right':'<path d="M4 12h15M13 5l7 7-7 7"/>','arrow-up-right':'<path d="M6 18L18 6M6 6h12v12"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',check:'<path d="M5 12l4 4L19 6"/>',
    bag:'<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    moon:'<path d="M20 14a8.5 8.5 0 0 1-10-10A8.5 8.5 0 1 0 20 14Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    refresh:'<path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>',
    layers:'<path d="M3 8l9-5 9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    pointer:'<path d="M6 3l13 10-7 1-3 7L6 3Z"/>',
    sparkle:'<path d="M12 2l2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
    upload:'<path d="M12 16V3M7 8l5-5 5 5M4 15v6h16v-6"/>',
    download:'<path d="M12 3v13M7 11l5 5 5-5M4 16v5h16v-5"/>'
  };
  function icon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.sparkle}</svg>`;}
  function hydrateIcons(){ $$('[data-icon]').forEach(el=>{el.outerHTML=icon(el.dataset.icon);}); }
  const KEY='forme.catalog.v1',CART='forme.bag.v1',THEME='forme.theme.v1';
  let catalog, baseCatalog,person='women',filter='all',query='',sort='featured',outfits={},variants={},bag=[],studio=false,editId=null,draftAsset=null,toastTimeout,checkoutHandler=null;
  const getProduct=id=>catalog.products.find(p=>p.id===id);
  function readLocal(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
  function emit(name,detail){window.dispatchEvent(new CustomEvent('forme:'+name,{detail:structuredClone(detail)}));}
  function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
  function download(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function setTheme(theme){document.documentElement.dataset.theme=theme;$('#theme-toggle').innerHTML=icon(theme==='dark'?'sun':'moon');$('#theme-toggle').setAttribute('aria-label',theme==='dark'?'Switch to day mode':'Switch to night mode');try{localStorage.setItem(THEME,JSON.stringify(theme));}catch{} }
  hydrateIcons();
  setTheme(readLocal(THEME)||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  $('#theme-toggle').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  $('#year').textContent=new Date().getFullYear();
  function applyBrand(){
    const t=catalog.theme;document.documentElement.style.setProperty('--olive',t.olive);document.documentElement.style.setProperty('--camel',t.camel);
    $$('.brand').forEach(el=>{el.innerHTML=E.esc(t.brand)+'<span>®</span>';el.setAttribute('aria-label',t.brand+' home');});
    $('.studio-watermark').textContent=t.brand.toLowerCase()+'.';document.title=t.brand+' — Find your form.';
    $('.footer>div>span').textContent='© '+new Date().getFullYear()+' '+t.brand;
    const f=$('#appearance-form');f.elements.brand.value=t.brand;f.elements.olive.value=t.olive;f.elements.camel.value=t.camel;
  }
  function defaultOutfit(type){let result={};['top','bottom'].forEach(slot=>{const p=catalog.products.find(p=>p.person===type&&p.slot===slot);if(p)result=E.equip(result,p);});return result;}
  function initOutfits(){E.PEOPLE.forEach(p=>outfits[p]=defaultOutfit(p));}
  function equipped(){return Object.values(outfits[person]||{}).map(item=>({product:getProduct(item.id),variant:item.variant})).filter(i=>i.product);}
  function renderMannequin(){
    const items=equipped();$('#mannequin').innerHTML=E.mannequin(person,items);$('#mannequin').setAttribute('aria-label',`${person==='women'?'Female':person==='men'?'Male':'Child'} mannequin wearing ${items.map(i=>i.product.name).join(', ')||'no selected garments'}`);
    $$('[data-person]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.person===person)));
    $('#outfit-summary').innerHTML=items.length?items.map(({product:p,variant:v})=>`<div class="outfit-mini"><div class="outfit-mini-image">${E.thumb(p,v)}</div><div><strong>${E.esc(p.name)}</strong><span>${E.esc((p.colors[v]||p.colors[0]).name)} · ${E.money(p.price)}</span></div></div>`).join(''):'<p class="field-hint">A blank canvas. Choose a piece from the collection.</p>';
    $('#outfit-total').textContent=E.money(items.reduce((s,i)=>s+i.product.price,0));$('#add-look').disabled=!items.length;$('#mobile-add-look').disabled=!items.length;
  }
  function renderProducts(){
    let list=catalog.products.filter(p=>p.person===person&&(filter==='all'||p.slot===filter)&&(p.name+' '+p.description+' '+p.colors.map(c=>c.name).join(' ')).toLowerCase().includes(query));
    if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
    $('#product-grid').innerHTML=list.length?list.map(p=>{
      const v=variants[p.id]||0,c=p.colors[v]||p.colors[0],wearing=outfits[person][p.slot]?.id===p.id;
      return `<article class="product-card ${wearing?'is-wearing':''}"><button class="product-art" data-try="${E.esc(p.id)}" aria-label="${wearing?'Remove':'Try on'} ${E.esc(p.name)}" aria-pressed="${wearing}"><span class="product-label">${wearing?'ON YOUR FORM':p.slot==='outer'?'THE FINISHING TOUCH':'EVERYDAY ESSENTIAL'}</span>${E.thumb(p,v)}<span class="try-button">${icon(wearing?'check':'plus')}${wearing?'Wearing':'Try it on'}</span></button><div class="product-info"><div><h3>${E.esc(p.name)}</h3><div class="product-meta">${E.esc(c.name)} · ${p.slot==='outer'?'Layer':p.slot==='bottom'?'Bottom':p.slot==='dress'?'Dress':'Top'}</div></div><span class="price">${E.money(p.price)}</span></div><div class="swatches" role="group" aria-label="Colours for ${E.esc(p.name)}">${p.colors.map((c,i)=>`<button class="swatch ${i===v?'active':''}" style="--swatch:${c.hex}" data-color="${i}" data-product="${E.esc(p.id)}" aria-label="${E.esc(c.name)}" aria-pressed="${i===v}"><i></i></button>`).join('')}</div></article>`;
    }).join(''):'<div class="empty-state"><h3>A little room for something new.</h3><p>No pieces match this selection.</p><button class="secondary-button" id="clear-filters">Show all pieces</button></div>';
    if($('#clear-filters'))$('#clear-filters').onclick=()=>{filter='all';query='';$('#product-search').value='';updateFilters();renderProducts();};
    $$('[data-try]').forEach(b=>b.onclick=()=>tryOn(b.dataset.try));
    $$('[data-color]').forEach(b=>b.onclick=()=>{const id=b.dataset.product,v=Number(b.dataset.color),p=getProduct(id);variants[id]=v;if(outfits[person][p.slot]?.id===id){outfits[person][p.slot].variant=v;renderMannequin();emit('outfit-change',{person,outfit:equipped()});}renderProducts();});
  }
  function updateFilters(){$$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));}
  function tryOn(id){const p=getProduct(id);if(!p)return;if(p.person!==person){person=p.person;filter='all';updateFilters();}
    if(outfits[person][p.slot]?.id===id){delete outfits[person][p.slot];notify(p.name+' removed.');}else{outfits[person]=E.equip(outfits[person],p,variants[p.id]||0);notify(p.name+' is on your form.');}
    renderMannequin();renderProducts();emit('outfit-change',{person,outfit:equipped()});
    if(!studio)$('#fitting-room').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function persistCatalog(next){try{const validated=E.validateCatalog(next);localStorage.setItem(KEY,JSON.stringify(validated));catalog=validated;applyBrand();emit('catalog-change',catalog);return true;}catch(e){notify(e.name==='QuotaExceededError'?'Browser storage is full. Use smaller images or export your catalog.':e.message);return false;}}
  function cartPayload(){return {currency:'USD',items:bag.map(item=>({...item,product:structuredClone(getProduct(item.id))})),subtotal:bag.reduce((sum,item)=>sum+(getProduct(item.id)?.price||0)*item.quantity,0)};}
  function persistBag(){try{localStorage.setItem(CART,JSON.stringify(bag));}catch{}$('#bag-count').textContent=bag.reduce((s,i)=>s+i.quantity,0);emit('cart-change',cartPayload());}
  function addItem(p,variant=0){const size=p.person==='kids'?'6–7':'M';const item=bag.find(b=>b.id===p.id&&b.variant===variant&&b.size===size);if(item)item.quantity=Math.min(99,item.quantity+1);else bag.push({id:p.id,variant,size,quantity:1});}
  function renderBag(){
    $('#bag-items').innerHTML=bag.length?bag.map((item,i)=>{const p=getProduct(item.id),c=p.colors[item.variant]||p.colors[0];return `<div class="bag-item"><div class="bag-art">${E.thumb(p,item.variant)}</div><div><h3>${E.esc(p.name)}</h3><p>${E.esc(c.name)} · ${p.person==='kids'?'Kids':p.person==='men'?'Men':'Women'}</p><label class="sr-only" for="bag-size-${i}">Size for ${E.esc(p.name)}</label><select id="bag-size-${i}" data-size="${i}" style="font-size:10px;padding:4px 7px;width:95px;margin-bottom:10px">${(p.person==='kids'?['4–5','6–7','8–9','10–11']:['XS','S','M','L','XL']).map(s=>`<option ${s===item.size?'selected':''}>${s}</option>`).join('')}</select><div class="quantity-control"><button data-quantity="${i}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-quantity="${i}" data-delta="1" aria-label="Increase quantity">+</button></div></div><div><span class="price">${E.money(p.price*item.quantity)}</span><br><button class="text-button" data-remove="${i}">Remove</button></div></div>`;}).join(''):'<div class="empty-state"><h3>Room for your favourites.</h3><p>Try a few pieces, then add your look to the bag.</p><button class="secondary-button" id="bag-start">Explore the collection</button></div>';
    $('#bag-bottom').innerHTML=bag.length?`<div class="bag-total"><span>Subtotal</span><strong>${E.money(cartPayload().subtotal)}</strong></div><button class="primary-button" id="checkout-button">${checkoutHandler?'Continue to checkout':'Download your look'} ${icon(checkoutHandler?'arrow-right':'download')}</button><p class="field-hint">${checkoutHandler?'Shipping and any taxes are calculated by your connected store.':'Your selections are saved in this browser. Download a copy of your look. This demo does not accept payments.'}</p>`:'';
    if($('#bag-start'))$('#bag-start').onclick=()=>{$('#bag-dialog').close();showView(false);$('#collection').scrollIntoView({behavior:'smooth'});};
    $$('[data-quantity]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.quantity);bag[i].quantity=Math.max(0,Math.min(99,bag[i].quantity+Number(b.dataset.delta)));bag=bag.filter(b=>b.quantity>0);persistBag();renderBag();});
    $$('[data-remove]').forEach(b=>b.onclick=()=>{bag.splice(Number(b.dataset.remove),1);persistBag();renderBag();});
    $$('[data-size]').forEach(b=>b.onchange=()=>{bag[Number(b.dataset.size)].size=b.value;persistBag();});
    if($('#checkout-button'))$('#checkout-button').onclick=async()=>{if(checkoutHandler){try{await checkoutHandler(cartPayload());}catch(e){notify('Checkout could not open. Please try again.');}}else{download('my-forme-look.json',cartPayload());notify('Your look is ready to keep.');}};
  }
  function showView(value){studio=value;$('#storefront').hidden=value;$('#dashboard').hidden=!value;document.body.dataset.view=value?'studio':'store';$('#dashboard-toggle').innerHTML=icon('grid')+`<span class="dashboard-label">${value?'Storefront':'Studio'}</span>`;$('#dashboard-toggle').title=value?'Back to storefront':'Product dashboard';window.scrollTo({top:0,behavior:'smooth'});if(value)renderAdmin();}
  function renderAdmin(){
    $('#catalog-stats').textContent=`${catalog.products.length} pieces · ${new Set(catalog.products.map(p=>p.person)).size} collections`;
    $('#admin-products').innerHTML=catalog.products.map(p=>`<tr><td><div class="admin-product"><div>${E.thumb(p)}</div><div>${E.esc(p.name)}<small>${E.esc(p.colors[0].name)}</small></div></div></td><td>${{women:'Women',men:'Men',kids:'Kids'}[p.person]}</td><td>${{top:'Top',bottom:'Bottom',outer:'Layer',dress:'Dress'}[p.slot]}</td><td>${E.money(p.price)}</td><td>${p.style==='custom'?'Uploaded image':'Built-in garment'}</td><td><div class="row-actions"><button data-edit="${E.esc(p.id)}">Edit</button><button class="delete-product" data-delete="${E.esc(p.id)}">Delete</button></div></td></tr>`).join('');
    $$('[data-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.edit));
    $$('[data-delete]').forEach(b=>b.onclick=()=>{const p=getProduct(b.dataset.delete);if(!confirm(`Delete “${p.name}” from this browser’s catalog?`))return;const next=structuredClone(catalog);next.products=next.products.filter(item=>item.id!==p.id);if(persistCatalog(next)){E.PEOPLE.forEach(type=>Object.keys(outfits[type]).forEach(slot=>{if(outfits[type][slot].id===p.id)delete outfits[type][slot];}));bag=bag.filter(i=>i.id!==p.id);persistBag();renderAdmin();renderProducts();renderMannequin();notify('Piece removed from the catalog.');}});
  }
  function updateStyleOptions(){const f=$('#product-form'),slot=f.elements.slot.value;Array.from(f.elements.style.options).forEach(o=>{o.hidden=o.value!=='custom'&&!E.STYLES[slot].includes(o.value);});if(f.elements.style.value!=='custom'&&!E.STYLES[slot].includes(f.elements.style.value))f.elements.style.value=E.STYLES[slot][0];}
  function editorProduct(){const f=$('#product-form'),style=f.elements.style.value;const p={id:editId||'forme-'+Date.now().toString(36),name:f.elements.name.value.trim()||'New piece',person:f.elements.person.value,slot:f.elements.slot.value,price:Number(f.elements.price.value)||0,description:f.elements.description.value,style,colors:[{name:f.elements.colorName.value||'Custom',hex:f.elements.color.value}]};
    if(style==='custom'&&draftAsset)p.asset={src:draftAsset.src,x:Number(f.elements.assetX.value),y:Number(f.elements.assetY.value),width:Number(f.elements.assetWidth.value),height:Number(f.elements.assetHeight.value)};return p;
  }
  function renderEditor(){const p=editorProduct();$('#alignment-controls').hidden=p.style!=='custom';['x','y','width','height'].forEach(k=>{$('#'+k+'-value').textContent=$('#product-form').elements['asset'+k[0].toUpperCase()+k.slice(1)].value;});$('#editor-mannequin').innerHTML=E.mannequin(p.person,p.style==='custom'&&!p.asset?[]:[{product:p,variant:0}]);}
  function openEditor(id){editId=id||null;draftAsset=null;const f=$('#product-form');f.reset();const p=id?getProduct(id):null;$('#editor-title').textContent=p?'Edit your piece':'Add a piece';
    if(p){['name','person','slot','price','description','style'].forEach(k=>f.elements[k].value=p[k]);f.elements.color.value=p.colors[0].hex;f.elements.colorName.value=p.colors[0].name;if(p.asset){draftAsset={...p.asset};['x','y','width','height'].forEach(k=>f.elements['asset'+k[0].toUpperCase()+k.slice(1)].value=p.asset[k]);}}
    else f.elements.person.value=person;updateStyleOptions();renderEditor();$('#product-dialog').showModal();$('#product-dialog').scrollTop=0;
  }
  try {
    if(window.FORME_CATALOG)baseCatalog=E.validateCatalog(window.FORME_CATALOG);
    else{const response=await fetch('products.json');if(!response.ok)throw Error('Catalog not found.');baseCatalog=E.validateCatalog(await response.json());}
    const cached=readLocal(KEY);try{catalog=cached?E.validateCatalog(cached):structuredClone(baseCatalog);}catch{catalog=structuredClone(baseCatalog);}
  } catch(e){$('#product-grid').innerHTML='<div class="empty-state"><h3>The collection could not load.</h3><p>Serve this folder using a local web server, or open the standalone HTML included in the source download.</p><button class="secondary-button" id="retry-catalog">Try again</button></div>';$('#retry-catalog').onclick=()=>location.reload();$('#mannequin').innerHTML=E.mannequin('women');$('#dashboard-toggle').disabled=true;$('#footer-studio').disabled=true;$('#add-look').disabled=true;return;}
  initOutfits();applyBrand();
  const savedBag=readLocal(CART);if(Array.isArray(savedBag))bag=savedBag.filter(i=>getProduct(i.id)&&Number.isInteger(i.variant)&&i.variant>=0&&i.variant<getProduct(i.id).colors.length&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=99&&typeof i.size==='string').map(i=>({id:i.id,variant:i.variant,quantity:i.quantity,size:i.size.slice(0,12)}));
  persistBag();renderMannequin();renderProducts();
  $$('[data-person]').forEach(b=>b.onclick=()=>{person=b.dataset.person;filter='all';query='';$('#product-search').value='';updateFilters();renderMannequin();renderProducts();emit('person-change',{person});});
  $$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;updateFilters();renderProducts();});
  $('#product-search').oninput=e=>{query=e.target.value.trim().toLowerCase();renderProducts();};$('#product-sort').onchange=e=>{sort=e.target.value;renderProducts();};
  $('#clear-look').onclick=()=>{outfits[person]={};renderMannequin();renderProducts();emit('outfit-change',{person,outfit:[]});notify('A fresh canvas for your next look.');};
  $('#reset-look').onclick=()=>{outfits[person]=defaultOutfit(person);Object.values(outfits[person]).forEach(i=>variants[i.id]=0);renderMannequin();renderProducts();emit('outfit-change',{person,outfit:equipped()});notify('Your everyday look is back.');};
  $('#add-look').onclick=()=>{equipped().forEach(({product,variant})=>addItem(product,variant));persistBag();notify('Your look has been added to the bag.');};
  $('#mobile-add-look').onclick=()=>$('#add-look').click();
  // Mobile keeps the hero quiet; the bag also offers the current look when empty.
  $('#bag-toggle').onclick=()=>{renderBag();if(!bag.length&&equipped().length){$('#bag-bottom').innerHTML=`<button class="primary-button" id="bag-add-current">Add current look · ${E.money(equipped().reduce((s,i)=>s+i.product.price,0))} ${icon('plus')}</button>`;$('#bag-add-current').onclick=()=>{equipped().forEach(({product,variant})=>addItem(product,variant));persistBag();renderBag();};}$('#bag-dialog').showModal();};
  $('#dashboard-toggle').onclick=()=>showView(!studio);$('#footer-studio').onclick=()=>showView(true);
  $$('a[href^="#"]').forEach(a=>a.onclick=e=>{if(studio)showView(false);if(a.getAttribute('href')==='#'){e.preventDefault();showView(false);}});
  $$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  $$('[data-dashboard-tab]').forEach(b=>b.onclick=()=>{$$('[data-dashboard-tab]').forEach(t=>t.classList.toggle('active',t===b));$('#products-panel').hidden=b.dataset.dashboardTab!=='products';$('#appearance-panel').hidden=b.dataset.dashboardTab!=='appearance';});
  $('#new-product').onclick=()=>openEditor();
  $('#product-form').addEventListener('input',()=>{updateStyleOptions();renderEditor();});
  $('#product-form').addEventListener('change',()=>{updateStyleOptions();renderEditor();});
  $('#garment-upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){notify('Choose a PNG or WebP image under 2 MB.');e.target.value='';return;}
    try{const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});if(img.naturalWidth>6000||img.naturalHeight>6000)throw Error('Use an image no larger than 6000 pixels.');draftAsset={src};const f=$('#product-form');f.elements.style.value='custom';const placement={top:[95,125,210,200],bottom:[140,280,120,320],outer:[90,125,220,250],dress:[125,125,150,400]}[f.elements.slot.value];['assetX','assetY','assetWidth','assetHeight'].forEach((k,i)=>f.elements[k].value=placement[i]);renderEditor();notify('Image added. Adjust its position in the preview.');}catch(err){notify(err.message||'This image could not be read.');}};
  $('#product-form').onsubmit=e=>{e.preventDefault();const p=editorProduct();if(p.style==='custom'&&!p.asset){notify('Upload a transparent garment image first.');return;}const original=editId?getProduct(editId):null;if(p.style!=='custom'&&original?.colors.length>1)p.colors=[p.colors[0],...original.colors.slice(1)];const next=structuredClone(catalog);if(editId)next.products=next.products.map(item=>item.id===editId?p:item);else next.products.push(p);if(persistCatalog(next)){variants[p.id]=0;E.PEOPLE.forEach(type=>Object.keys(outfits[type]).forEach(slot=>{const item=outfits[type][slot];if(item.id===p.id){if(type!==p.person||slot!==p.slot)delete outfits[type][slot];else item.variant=0;}}));bag=bag.map(i=>i.id===p.id?{...i,variant:Math.min(i.variant,p.colors.length-1)}:i);persistBag();$('#product-dialog').close();renderAdmin();renderProducts();renderMannequin();notify(editId?'Your piece has been updated.':'Your new piece is ready to try.');}};
  $('#appearance-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget,next=structuredClone(catalog);next.theme={brand:f.elements.brand.value.trim(),olive:f.elements.olive.value,camel:f.elements.camel.value};if(persistCatalog(next))notify('Your storefront has a fresh look.');};
  $('#reset-appearance').onclick=()=>{const next=structuredClone(catalog);next.theme={brand:'FORME',olive:'#596244',camel:'#b89470'};if(persistCatalog(next))notify('The FORME palette is back.');};
  $('#export-catalog').onclick=()=>{download('products.json',catalog);notify('Catalog exported with your products and palette.');};
  $('#import-catalog').onclick=()=>$('#catalog-import').click();
  $('#catalog-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>15*1024*1024)throw Error('Choose a catalog under 15 MB.');const imported=E.validateCatalog(JSON.parse(await file.text()));if(confirm(`Replace this browser’s catalog with ${imported.products.length} imported products?`)&&persistCatalog(imported)){initOutfits();variants={};bag=bag.filter(i=>getProduct(i.id)&&i.variant<getProduct(i.id).colors.length);persistBag();renderAdmin();renderMannequin();renderProducts();notify('Catalog imported. Your pieces are ready.');}}catch(err){notify(err.message||'This catalog could not be imported.');}finally{e.target.value='';}};
  $('#open-guide').onclick=()=>$('#guide-dialog').showModal();
  window.FormeStore={
    getCatalog:()=>structuredClone(catalog),getCart:()=>structuredClone(cartPayload()),getOutfit:()=>structuredClone({person,outfit:equipped()}),
    setCatalog(data,{persist=false}={}){const next=E.validateCatalog(data);if(persist){if(!persistCatalog(next))throw Error('Catalog could not be saved.');}else{catalog=next;applyBrand();}initOutfits();variants={};bag=bag.filter(i=>getProduct(i.id)&&i.variant<getProduct(i.id).colors.length);persistBag();renderMannequin();renderProducts();if(studio)renderAdmin();},
    tryOn,
    setPerson(type){if(!E.PEOPLE.includes(type))throw Error('Unknown collection.');person=type;filter='all';query='';$('#product-search').value='';updateFilters();renderMannequin();renderProducts();},
    setCheckoutHandler(handler){if(typeof handler!=='function')throw Error('Checkout handler must be a function.');checkoutHandler=handler;},
    clearLocalCatalog(){try{localStorage.removeItem(KEY);}catch{}this.setCatalog(baseCatalog);notify('Published catalog restored.');}
  };
  emit('ready',{productCount:catalog.products.length});
})();
