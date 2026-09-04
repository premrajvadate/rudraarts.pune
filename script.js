let services = [];
const serviceGrid = document.querySelector("#servicesGrid");
const serviceSelect = document.querySelector('select[name="service"]');
const galleryGrid = document.querySelector("#galleryGrid");
let publicSettings={};

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

async function loadServices(){
  try{
    const res=await fetch("/api/services");
    if(!res.ok) throw new Error("Services unavailable");
    services=await res.json();
    const sc=document.querySelector("#serviceCount"); if(sc) sc.textContent=services.length+"+";
    serviceGrid.innerHTML="";
    serviceSelect.innerHTML='<option value="">Select service</option>';
    if(!services.length){serviceGrid.innerHTML='<div class="gallery-empty"><b>Services coming soon.</b><span>Please contact Rudra Arts for current work.</span></div>';return;}
    services.forEach((x,i)=>{
      const photo=x.photos?.[0]?.image_url;
      const price=x.starting_price!=null?`<small class="service-price">Starting ₹${Number(x.starting_price).toLocaleString("en-IN")}</small>`:"";
      const badge=x.badge?`<span class="service-badge">${escapeHtml(x.badge)}</span>`:"";
      const media=photo?`<div class="service-photo" style="background-image:url('${String(photo).replace(/'/g,"%27")}')"></div>`:`<div class="service-icon">${["💡","🏷️","🚘","✂️","🔤","✨"][i%6]}</div>`;
      serviceGrid.insertAdjacentHTML("beforeend",`<article class="service">${media}${badge}<span class="num">${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.description||"")}</p>${price}<br><a class="text-btn" href="#quote" data-service="${escapeHtml(x.name)}">Get Quote →</a></article>`);
      serviceSelect.insertAdjacentHTML("beforeend",`<option value="${escapeHtml(x.name)}">${escapeHtml(x.name)}</option>`);
    });
    document.querySelectorAll("[data-service]").forEach(a=>a.addEventListener("click",()=>{serviceSelect.value=a.dataset.service;}));
  }catch(e){serviceGrid.innerHTML='<div class="gallery-empty"><b>Services are temporarily unavailable.</b><span>Please refresh the page.</span></div>';}
}

async function loadFeaturedGallery(){
  try{
    const res=await fetch("/api/gallery");
    if(!res.ok) throw new Error("Gallery unavailable");
    const items=(await res.json()).filter(x=>Number(x.featured)===1 && Number(x.visible)===1);
    galleryGrid.innerHTML="";
    if(!items.length){galleryGrid.innerHTML='<div class="gallery-empty"><b>Featured work coming soon.</b><span>Admin can mark uploaded photos as Featured from the Gallery panel.</span></div>';return;}
    items.forEach((x,i)=>galleryGrid.insertAdjacentHTML("beforeend",`<article class="gallery-item" style="background-image:url('${String(x.image_url).replace(/'/g,"%27")}');"><div><span>Featured Work ${String(i+1).padStart(2,"0")}</span><b>${escapeHtml(x.title||"Rudra Arts Work")}</b></div></article>`));
  }catch(e){galleryGrid.innerHTML='<div class="gallery-empty"><b>Gallery is loading...</b><span>Please try again in a moment.</span></div>';}
}
loadServices();
loadFeaturedGallery();

document.querySelector("#recommend").addEventListener("click",()=>{
  const p=document.querySelector("#purpose").value,b=document.querySelector("#budget").value;
  const out=document.querySelector("#recommendation");
  if(!p||!b){out.textContent="Choose your purpose and budget first.";return}
  const map={Vehicle:["Number Plates","Radium Work"],Home:["Name Plates"],Office:["Acrylic & 3D Letters"],Business:["LED Boards","Acrylic & 3D Letters"]};
  const rec=(map[p]||[services[0]?.name||"our services"]).filter(n=>services.some(s=>s.name===n)).join(" or ")||services[0]?.name||"our services";
  out.innerHTML=`<b>Suggested:</b> ${escapeHtml(rec)}. <a href="#quote" class="text-btn">Get a custom quote →</a>`;
});

const modal=document.querySelector("#loginModal");
document.querySelector("#openLogin").onclick=()=>modal.classList.add("show");
document.querySelector("#closeLogin").onclick=()=>modal.classList.remove("show");
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("show")});

const quoteForm=document.querySelector("#quoteForm");
quoteForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const data=Object.fromEntries(fd.entries());
  data.quantity=Number(data.quantity||1);data.delivery=!!data.delivery;data.installation=!!data.installation;
  try{
    const customerToken=localStorage.getItem("ra_customer_token");
    const headers={"Content-Type":"application/json"};
    if(customerToken)headers.Authorization="Bearer "+customerToken;
    let url="/api/enquiries";
    if(customerToken)url="/api/customer/enquiries";
    const payload=customerToken?{phone:data.phone,service:data.service,size:data.size,quantity:data.quantity,requirement:data.requirement,delivery:data.delivery,installation:data.installation}:{customer_name:data.name,phone:data.phone,service:data.service,size:data.size,quantity:data.quantity,requirement:data.requirement,delivery:data.delivery,installation:data.installation};
    const r=await fetch(url,{method:"POST",headers,body:JSON.stringify(payload)});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||"Could not submit enquiry");
    const toast=document.querySelector("#toast");toast.textContent=`Enquiry #RA${String(d.id).padStart(4,"0")} saved successfully. WhatsApp is ready.`;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3500);
    if(d.whatsappUrl)window.open(d.whatsappUrl,"_blank");
    e.target.reset();
  }catch(err){const toast=document.querySelector("#toast");toast.textContent=err.message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3500);}
});

const translations={
  en:{home:"Home",services:"Services",gallery:"Gallery",offers:"Offers",about:"About",contact:"Contact",explore:"Explore Services",quote:"Get a Quote",custom:"Need something custom?",start:"Start Enquiry",what:"WHAT WE DO",serviceTitle:"Services built to stand out.",work:"OUR WORK",workTitle:"Recent work & featured creations.",assist:"SMART ASSIST",assistTitle:"Not sure what you need?",recommend:"Recommend",current:"CURRENT OFFERS",offerTitle:"Deals & highlights.",quoteEyebrow:"CUSTOM QUOTE",quoteTitle:"Tell us what you need.",send:"Send Enquiry",aboutEyebrow:"ABOUT RUDRA ARTS",aboutTitle:"Local craftsmanship. Professional presentation.",reviewsEyebrow:"CUSTOMER REVIEWS",reviewsTitle:"What customers say.",contactEyebrow:"VISIT OR CONTACT",contactTitle:"Let’s create something memorable."},
  mr:{home:"मुख्यपृष्ठ",services:"सेवा",gallery:"गॅलरी",offers:"ऑफर्स",about:"आमच्याबद्दल",contact:"संपर्क",explore:"सेवा पहा",quote:"कोट मिळवा",custom:"काही खास काम हवे आहे?",start:"चौकशी सुरू करा",what:"आमच्या सेवा",serviceTitle:"लक्षवेधी सेवा.",work:"आमचे काम",workTitle:"अलीकडील आणि निवडक कामे.",assist:"स्मार्ट सहाय्य",assistTitle:"काय हवे आहे हे ठरत नाहीये?",recommend:"शिफारस",current:"सध्याच्या ऑफर्स",offerTitle:"डील्स आणि हायलाइट्स.",quoteEyebrow:"कस्टम कोट",quoteTitle:"तुमची गरज सांगा.",send:"चौकशी पाठवा",aboutEyebrow:"रुद्र आर्ट्स बद्दल",aboutTitle:"स्थानिक कौशल्य. व्यावसायिक सादरीकरण.",reviewsEyebrow:"ग्राहकांचे अभिप्राय",reviewsTitle:"ग्राहक काय म्हणतात.",contactEyebrow:"भेट द्या किंवा संपर्क करा",contactTitle:"चला, काहीतरी लक्षात राहील असे बनवूया."},
  hi:{home:"होम",services:"सेवाएँ",gallery:"गैलरी",offers:"ऑफर्स",about:"हमारे बारे में",contact:"संपर्क",explore:"सेवाएँ देखें",quote:"कोटेशन लें",custom:"कुछ कस्टम चाहिए?",start:"पूछताछ शुरू करें",what:"हम क्या करते हैं",serviceTitle:"बेहतरीन सेवाएँ।",work:"हमारा काम",workTitle:"हाल का और चुनिंदा काम।",assist:"स्मार्ट असिस्ट",assistTitle:"समझ नहीं आ रहा क्या चाहिए?",recommend:"सुझाव दें",current:"वर्तमान ऑफर्स",offerTitle:"डील्स और हाइलाइट्स।",quoteEyebrow:"कस्टम कोट",quoteTitle:"आपको क्या चाहिए बताएं।",send:"पूछताछ भेजें",aboutEyebrow:"रुद्र आर्ट्स के बारे में",aboutTitle:"स्थानीय कौशल। प्रोफेशनल प्रस्तुति।",reviewsEyebrow:"ग्राहक समीक्षा",reviewsTitle:"ग्राहक क्या कहते हैं।",contactEyebrow:"मिलें या संपर्क करें",contactTitle:"आइए कुछ यादगार बनाएं."}
};
function setText(selector,key,t){const el=document.querySelector(selector);if(el&&t[key])el.textContent=t[key]}
function applyLanguage(lang){const t=translations[lang]||translations.en;const nav=['home','services','gallery','offers','about','contact'];document.querySelectorAll('.nav nav a').forEach((a,i)=>{if(nav[i])a.textContent=t[nav[i]]});setText('.hero-cta .gold','explore',t);setText('.hero-cta .ghost','quote',t);setText('#adminServices','services',t);setText('.strip b','custom',t);setText('.strip .btn','start',t);setText('#services .eyebrow','what',t);setText('#services h2','serviceTitle',t);setText('#gallery .eyebrow','work',t);setText('#gallery h2','workTitle',t);setText('#smart .eyebrow','assist',t);setText('#smart h2','assistTitle',t);setText('#recommend','recommend',t);setText('#offers .eyebrow','current',t);setText('#offers h2','offerTitle',t);setText('#quote .eyebrow','quoteEyebrow',t);setText('#quote h2','quoteTitle',t);setText('#quoteForm button','send',t);setText('#reviews .eyebrow','reviewsEyebrow',t);setText('#reviews h2','reviewsTitle',t);setText('#about .eyebrow','aboutEyebrow',t);setText('#about h2','aboutTitle',t);setText('#contact .eyebrow','contactEyebrow',t);setText('#contact h2','contactTitle',t);const qf=document.querySelector('#quoteForm');if(qf){const map={name:t.name,phone:t.phone,size:t.size,requirement:t.requirement};Object.entries(map).forEach(([n,v])=>{const el=qf.querySelector('[name="'+n+'"]');if(el)el.placeholder=v});const qty=qf.querySelector('[name="quantity"]');if(qty)qty.placeholder=t.quantity;const first=qf.querySelector('[name="service"] option');if(first)first.textContent=t.services;const checks=qf.querySelectorAll('label.check');if(checks[0]&&checks[0].lastChild)checks[0].lastChild.textContent=' '+t.delivery;if(checks[1]&&checks[1].lastChild)checks[1].lastChild.textContent=' '+t.installation}const purpose=document.querySelector('#purpose');if(purpose){purpose.options[0].text=t.purpose;purpose.options[1].text=t.shopBranding;purpose.options[2].text=t.home;purpose.options[3].text=t.office;purpose.options[4].text=t.vehicle}const budget=document.querySelector('#budget');if(budget)budget.options[0].text=t.budget;document.documentElement.lang=lang==='mr'?'mr':lang==='hi'?'hi':'en';localStorage.setItem('ra_language',lang)}
document.querySelectorAll(".lang").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".lang").forEach(x=>x.classList.remove("active"));btn.classList.add("active");applyLanguage(btn.dataset.lang)}));


async function loadPublicSettings(){try{const r=await fetch('/api/public/settings');if(!r.ok)throw Error();publicSettings=await r.json();const name=publicSettings.shop_name||'Rudra Arts',code=publicSettings.brand_code||'#1771';const brand=document.querySelector('#brandName');if(brand)brand.innerHTML=`${escapeHtml(name)} <small>${escapeHtml(code)}</small>`;const trust=document.querySelector('#hoursTrust');if(trust)trust.textContent=publicSettings.hours||'10 AM – 10 PM';const area=document.querySelector('#areaTrust');if(area)area.textContent=publicSettings.service_area||'Pune + nearby cities';const hs=document.querySelector('#hoursStat');if(hs)hs.textContent=String(publicSettings.hours||'10–10').replace(/[^0-9–-]/g,'').replace('–','–');const ht=document.querySelector('#hoursText');if(ht)ht.innerHTML=`Every day<br>${escapeHtml(publicSettings.hours||'10 AM – 10 PM')}`;const phones=document.querySelector('#phonesText');if(phones)phones.innerHTML=`${escapeHtml(publicSettings.whatsapp||'08080330153')}<br>${escapeHtml(publicSettings.whatsapp2||'9356474304')}`;const wa=document.querySelector('#whatsappLink');if(wa)wa.href='https://wa.me/'+String(publicSettings.whatsapp||'08080330153').replace(/\D/g,'');}catch(e){console.warn('Public settings unavailable',e)}}
async function loadReviews(){try{const r=await fetch('/api/public/reviews');if(!r.ok)throw Error();const d=await r.json();const avg=Number(d.average||0),count=Number(d.count||0);document.querySelector('#ratingTrust').textContent=`★ ${avg.toFixed(1)} Rating`;document.querySelector('#ratingStat').textContent=`${avg.toFixed(1)}★`;document.querySelector('#reviewCount').textContent=`${count} approved review${count===1?'':'s'}`;const grid=document.querySelector('#reviewsGrid');if(!d.reviews?.length)return;grid.innerHTML=d.reviews.map(x=>`<article class="service"><div class="service-icon">★</div><span class="num">${Number(x.rating)}/5</span><h3>${escapeHtml(x.customer_name)}</h3><p>${escapeHtml(x.review)}</p><small class="service-price">${'★'.repeat(Number(x.rating))}</small></article>`).join('')}catch(e){console.warn('Reviews unavailable',e)}}
const reviewForm=document.querySelector('#reviewForm');if(reviewForm)reviewForm.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());const msg=document.querySelector('#reviewMsg');try{const r=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const x=await r.json();if(!r.ok)throw Error(x.error||'Could not submit review');msg.textContent='Review submitted. It will appear after admin approval.';e.target.reset()}catch(err){msg.textContent=err.message}});
loadPublicSettings();loadReviews();applyLanguage(localStorage.getItem('ra_language')||'en');setInterval(()=>{loadPublicSettings();loadReviews();loadServices();loadFeaturedGallery()},30000);
document.querySelector("#adminServices").onclick=()=>{document.querySelector("#toast").textContent="Admin service management is available from the protected dashboard.";document.querySelector("#toast").classList.add("show");setTimeout(()=>document.querySelector("#toast").classList.remove("show"),2500)};
