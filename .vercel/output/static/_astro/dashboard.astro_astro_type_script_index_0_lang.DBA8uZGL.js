import{t as l}from"./i18n.D94vWysp.js";const p="Baku452/pdf-selector",m={en:{open:"Open","in-progress":"In Progress",fixed:"Fixed"},es:{open:"Abierto","in-progress":"En Progreso",fixed:"Resuelto"}};let c="all",r=[];function d(){return localStorage.getItem("lang")||"en"}function f(t){const e=t.labels.map(a=>a.name.toLowerCase());return e.includes("fixed")||t.state==="closed"?"fixed":e.includes("in-progress")||e.includes("wip")?"in-progress":"open"}function h(t){if(!t)return"Unknown";const e=t.match(/\*\*Reported by:\*\*\s*(.+)/);return e?e[1].trim():"Unknown"}async function b(){const t=`https://api.github.com/repos/${p}/issues?labels=bug&state=all&per_page=100`,e=await fetch(t,{headers:{Accept:"application/vnd.github+json"}});return e.ok?(await e.json()).filter(n=>!n.title.startsWith("[PR]")).map(n=>({id:n.number,title:n.title.replace(/^\[Bug\]\s*/i,""),description:n.body?n.body.replace(/## Bug Report[\s\S]*?### Description\n\n/m,"").slice(0,200):"",status:f(n),date:n.created_at,reporter:h(n.body),url:n.html_url})):[]}function y(t){const e=t.length,a=t.filter(o=>o.status==="open").length,n=t.filter(o=>o.status==="in-progress").length,s=t.filter(o=>o.status==="fixed").length;document.getElementById("stat-total").textContent=e.toString(),document.getElementById("stat-open").textContent=a.toString(),document.getElementById("stat-progress").textContent=n.toString(),document.getElementById("stat-fixed").textContent=s.toString()}function i(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function u(){const t=d(),e=document.getElementById("bug-list"),a=l[t].reportedBy;y(r);const n=c==="all"?r:r.filter(s=>s.status===c);if(n.length===0){e.innerHTML=`<p class="empty-state">${l[t].noBugsFound}</p>`;return}e.innerHTML=n.sort((s,o)=>new Date(o.date).getTime()-new Date(s.date).getTime()).map(s=>`
				<a class="bug-card" data-status="${s.status}" href="${i(s.url)}" target="_blank">
					<div class="bug-card-header">
						<div class="bug-info">
							<h3>#${s.id} ${i(s.title)}</h3>
						</div>
						<span class="status-badge status-${s.status}">
							${m[t]?.[s.status]||s.status}
						</span>
					</div>
					<p class="bug-description">${i(s.description)}</p>
					<div class="bug-meta">
						<span>${a} ${i(s.reporter)}</span>
						<span>${new Date(s.date).toLocaleDateString(t==="es"?"es-ES":"en-US",{year:"numeric",month:"short",day:"numeric"})}</span>
					</div>
				</a>
			`).join("")}document.querySelectorAll(".filter-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(e=>e.classList.remove("active")),t.classList.add("active"),c=t.dataset.filter||"all",u()})});function g(t){const e=l[t];document.documentElement.lang=t,document.querySelectorAll("[data-i18n]").forEach(a=>{const n=a.dataset.i18n;e[n]&&(a.textContent=e[n])}),u()}const L=d(),E=document.getElementById("bug-list");E.innerHTML='<p class="empty-state loading">Loading...</p>';b().then(t=>{r=t,g(L)});document.addEventListener("langchange",t=>{g(t.detail.lang)});
