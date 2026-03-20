import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LOGO_SRC = "/logo.png";

const CONFIG = {
  nombre: "Shako Sushi", adminPin: "1234",
  ubicacion: "Hudson Plaza Comercial, Berazategui", horario: "16:30 a 23:30", abreH:16, abreM:30, cierraH:23, cierraM:30,
};

const MENU_DEFAULT = [
  { id:"rolls", nombre:"Rolls", emoji:"🍣", desc:"Clásicos, Especiales y Calientes", items:[
    {id:"r1", nombre:"Namazake (10u.)",              desc:"Makis de Salmón.",                                                                precio:16000},
    {id:"r2", nombre:"Maki Philadelphia (10u.)",      desc:"Makis de Salmón y queso Philadelphia.",                                        precio:17000},
    {id:"r3", nombre:"Futo Maki (8u.)",               desc:"Langostinos, Tamagoyaki, Zanahoria, Hongos Shitake y Pepino.",                 precio:17000},
    {id:"r4", nombre:"Philadelphia (8u.)",             desc:"Arroz por fuera, Salmón, Palta y Philadelphia.",                              precio:17000},
    {id:"r5", nombre:"California (8u.)",               desc:"Arroz por fuera, Kanikama y Palta.",                                          precio:15000},
    {id:"r6", nombre:"New York (8u.)",                 desc:"Arroz por fuera, Salmón y Palta.",                                            precio:17000},
    {id:"r7", nombre:"California Especial (8u.)",      desc:"Kanikama, Palta y Philadelphia.",                                             precio:15000},
    {id:"r8", nombre:"Philadelphia Especial (8u.)",    desc:"Salmón, Palta y Philadelphia. Cubierto con ciboulette.",                      precio:17000},
    {id:"r9", nombre:"Ebi Philadelphia (8u.)",         desc:"Langostinos, Palta y queso Philadelphia.",                                    precio:17000},
    {id:"r10",nombre:"Ebi Pinku (8u.)",                desc:"Langostinos, Palta, envuelto en Salmón Rosado.",                              precio:17000},
    {id:"r11",nombre:"Ebi Butterfly (8u.)",            desc:"Langostinos, Pepino, cubierto por Salmón crudo y Palta.",                     precio:17000},
    {id:"r12",nombre:"Magetzu Roll (8u.)",             desc:"Langostinos, Kanikama y Pepino, envuelto en Salmón ahumado.",                 precio:17000},
    {id:"r13",nombre:"Guacamole Roll (8u.)",           desc:"Salmón, Echalotte y Guacamole. Crocante de Won Ton.",                         precio:17000},
    {id:"r14",nombre:"Ginger Roll (8u.)",              desc:"Salmón cocido, Ciboulette, Pepino, Philadelphia. Sésamo.",                    precio:17000},
    {id:"r15",nombre:"Tuna Roll (8u.)",                desc:"Atún cocido, Ciboulette, Pepino, Philadelphia. Sésamo.",                      precio:17000},
    {id:"r16",nombre:"Supremo Roll (8u.)",             desc:"Salmón Rosado, Palta, Philadelphia. Praliné Almendras, Caviar. Maracuyá.",    precio:18000},
    {id:"r17",nombre:"Vegetariano (8u.)",              desc:"Palta, Philadelphia, Pepino, Zanahoria. Sésamo.",                             precio:15000},
    {id:"r18",nombre:"Samurai Roll (8u.)",             desc:"Langostinos, Philadelphia, Berenjena grillada, Bonito y salsa Teriyaki.",      precio:17000},
    {id:"r19",nombre:"Ceviche Roll (8u.)",             desc:"Langostino, Palta, Atún Rojo y Ceviche de Salmón Rosado.",                    precio:19000},
    {id:"r20",nombre:"Crocante Sake (8u.)",            desc:"Salmón Rosado, Salmón ahumado, Pepino, Palta, Philadelphia. Panko. Teriyaki.", precio:19000},
    {id:"r21",nombre:"Crocante Passion (8u.)",         desc:"Salmón Rosado, Langostino, Tamagoyaki, Pepino. Panko, Coco, Almendras. Maracuyá.",precio:19000},
    {id:"r22",nombre:"Kamikaze (8u.)",                 desc:"Langostino frito en Panko. Sésamo tostado. Salsa Tonkatsu.",                  precio:17000},
    {id:"r23",nombre:"Spicy (8u.)",                    desc:"Langostino frito, Palta, Salmón grillado, Shishito Garashi y Teriyaki.",       precio:19000},
    {id:"r24",nombre:"Dragon Sake (8u.)",              desc:"Salmón en pasta de tempura, Philadelphia, Pepino. Envuelto en Tamagoyaki.",    precio:19000},
    {id:"r25",nombre:"Avocado Roll (8u.)",             desc:"Arroz, Alga Nori, Philadelphia y Langostinos. Envuelto en Palta.",             precio:17000},
    {id:"r26",nombre:"Buenos Aires Smoke Roll (8u.)",  desc:"Palta, Salmón, Langostinos, Philadelphia. Salmón Ahumado y Salsa Buenos Aires.",precio:19000},
    {id:"r27",nombre:"Tempura Phila (8u.)",            desc:"Salmón, Palta, Philadelphia. Masa de Tempura frita.",                         precio:18000},
    {id:"r28",nombre:"Roll Lenguado Acevichado (8u.)", desc:"Langostino, Philadelphia de albaca y Ají Amarillo. Lenguado curado y Ceviche.",precio:19000},
  ]},
  { id:"nigiri", nombre:"Nigiri, Geisha & Sashimi", emoji:"🐟", desc:"Bocados premium", items:[
    {id:"n1",nombre:"Nigiri (6u.)",   desc:"Diferentes sabores sobre bocadito de arroz.",                precio:14000},
    {id:"n2",nombre:"Geishas (6u.)",  desc:"Rolls sin arroz, varios sabores.",                           precio:17000},
    {id:"n3",nombre:"Sashimi (15u.)", desc:"Cortes de Salmón crudo, Pulpo, Atún Rojo y/o Langostinos.", precio:57000},
  ]},
  { id:"combinados", nombre:"Combinados", emoji:"🎁", desc:"Combinados de Sushi", items:[
    {id:"c1",nombre:"Premium",      desc:"Nigiris de Salmón y Atún. Sashimi. Ceviche Roll. Pinku Ahumado. Supremo Roll.", precio:46000},
    {id:"c2",nombre:"Cocido+Crudo", desc:"Nigiris de Salmón y Langostinos, Philadelphia Roll, Ebi Philadelphia + 1 a elección.", precio:37000},
    {id:"c3",nombre:"Todo Salmón",  desc:"Sashimi, Nigiris, Geishas, Philadelphia Roll, New York.", precio:41000},
  ]},
  { id:"temaki", nombre:"Temaki y Chirashi", emoji:"🌮", desc:"Cono o ensalada", items:[
    {id:"tm1",nombre:"Temaki (2u.)",  desc:"Sake: Salmón crudo, Philadelphia, Palta. / Ebi: Langostinos, Pepino, Palta.", precio:20000},
    {id:"tm2",nombre:"Poke Bowl",     desc:"Arroz, Atún rojo, Palta, Cebolla morada, Tomate, Pepino.", precio:48000},
    {id:"tm3",nombre:"Chirashi",      desc:"Arroz, Salmón ahumado, Salmón crudo, Kanikama, Langostinos, Tamagoyaki...", precio:44000},
    {id:"tm4",nombre:"Ensalada Sake", desc:"Arroz, Salmón, Palta y Queso Philadelphia.", precio:38000},
  ]},
  { id:"teppan", nombre:"Teppan", emoji:"🍳", desc:"Cocina a la plancha", items:[
    {id:"tp1",nombre:"Yakimeshi",       desc:"Arroz a la plancha con vegetales e ingredientes a elección.", precio:23000},
    {id:"tp2",nombre:"Salmón Teriyaki", desc:"Salmón a la plancha laqueado con teriyaki, arroz y vegetales.", precio:52000},
    {id:"tp3",nombre:"Oishi",           desc:"Langostinos rebozados en panko. Arroz yamani, verduras y hongos.", precio:38000},
    {id:"tp4",nombre:"Cerdo Tonkatsu",  desc:"Cerdo rebozado en panko, salsa tonkatsu y sésamo. Repollo y nabo.", precio:44000},
  ]},
  { id:"ceviche", nombre:"Ceviche", emoji:"🍋", desc:"", items:[
    {id:"cv1",nombre:"Ceviche", desc:"Pescado o marisco crudo marinado en jugo de lima, rocoto, cebolla morada y cilantro.", precio:42000},
  ]},
  { id:"wok", nombre:"Wok", emoji:"🥢", desc:"Platos al Wok", items:[
    {id:"w1",nombre:"Yakisoba",   desc:"Fideos soba salteados con vegetales e ingredientes a elección.", precio:23000},
    {id:"w2",nombre:"Chop Suey", desc:"Vegetales salteados al wok con salsa de soja e ingredientes a elección.", precio:23000},
    {id:"w3",nombre:"Chap Chae", desc:"Fideos de arroz, lomo, pollo, vegetales, huevo y hongos salteados al wok.", precio:25000},
  ]},
  { id:"aperitivos", nombre:"Aperitivos Calientes", emoji:"🔥", desc:"", items:[
    {id:"a1",nombre:"Ika Rabas",                        desc:"Aros fritos de Calamar.", precio:21000},
    {id:"a2",nombre:"Gyozas (5u.)",                     desc:"5 Empanadas de cerdo y vegetales a la plancha.", precio:8000},
    {id:"a3",nombre:"Spring Rolls de Carne (2u.)",      desc:"2 Arrolladitos primavera de carne con Salsa agridulce.", precio:6000},
    {id:"a4",nombre:"Spring Rolls Vegetarianos (2u.)",  desc:"2 Arrolladitos primavera vegetarianos con Salsa agridulce.", precio:6000},
    {id:"a5",nombre:"Ebi Furai (9u.)",                  desc:"9 Langostinos apanados en Panko y Fritos.", precio:24000},
    {id:"a6",nombre:"Ostras Frescas Flambée (5u.)",     desc:"5 Ostras frescas, estilo Acevichadas y Flambeadas.", precio:15000},
    {id:"a7",nombre:"Ostras Empanadas (5u.)",            desc:"5 Ostras empanadas en Panko, con Salsa de miel y Mostaza.", precio:15000},
  ]},
  { id:"vegetarianos", nombre:"Vegetarianos", emoji:"🥑", desc:"Sushi vegetariano", items:[
    {id:"v1",nombre:"Roll Vegetariano",     desc:"Arroz, Alga nori, Philadelphia, Pepino, Palta y Zanahoria.", precio:15000},
    {id:"v2",nombre:"Maki Vegetariano",     desc:"Alga Nori, Arroz, Palta, Pepino, Tomate, Cebolla morada y Tamago.", precio:16000},
    {id:"v3",nombre:"Geishas Vegetarianas", desc:"Berenjena grill, Tamago, Philadelphia, Palta, Pepino, Zanahoria y Ciboulette.", precio:16000},
  ]},
  { id:"salsas", nombre:"Salsas", emoji:"🫙", desc:"", items:[
    {id:"s1",nombre:"Soja Extra",         desc:"", precio:3000},
    {id:"s2",nombre:"Salsa Agridulce",    desc:"Para Spring Rolls.", precio:2000},
    {id:"s3",nombre:"Salsa Teriyaki",     desc:"A base de salsa de soja agridulce y Sake.", precio:3000},
    {id:"s4",nombre:"Salsa Buenos Aires", desc:"Soja, miel y semillas de sésamo.", precio:3000},
    {id:"s5",nombre:"Salsa Tonkatzu",     desc:"", precio:3000},
    {id:"s6",nombre:"Salsa Maracuyá",     desc:"", precio:3000},
  ]},
  { id:"adicionales", nombre:"Adicionales", emoji:"➕", desc:"", items:[
    {id:"ad1",nombre:"Wasabi extra",       desc:"", precio:4000},
    {id:"ad2",nombre:"Gari (Jengibre)",    desc:"Jengibre encurtido para limpiar paladar.", precio:4000},
    {id:"ad3",nombre:"Pepinos encurtidos", desc:"Pepinos encurtidos en sushizu.", precio:4000},
  ]},
  { id:"bebidas", nombre:"Bebidas", emoji:"🥤", desc:"", items:[
    {id:"be1",nombre:"Coca Cola (1,5L)",       desc:"",precio:6000},{id:"be2",nombre:"Coca Cola Zero (1,5L)",desc:"",precio:6000},
    {id:"be3",nombre:"Coca Cola (500ml)",       desc:"",precio:4000},{id:"be4",nombre:"Coca Cola Zero (500ml)",desc:"",precio:4000},
    {id:"be5",nombre:"Sprite (1L)",             desc:"",precio:6000},{id:"be6",nombre:"Sprite (500ml)",       desc:"",precio:4000},
    {id:"be7",nombre:"Agua Gasificada (500ml)", desc:"",precio:4000},{id:"be8",nombre:"Agua Sin Gas (500ml)", desc:"",precio:4000},
  ]},
  { id:"cervezas", nombre:"Cervezas", emoji:"🍺", desc:"Cervezas Goyeneche", items:[
    {id:"ce1", nombre:"Goyeneche APA (500ml)",       desc:"",precio:5000},{id:"ce2", nombre:"Goyeneche Blonde (500ml)",   desc:"",precio:5000},
    {id:"ce3", nombre:"Goyeneche Doble IPA (500ml)", desc:"",precio:7000},{id:"ce4", nombre:"Goyeneche Golden (500ml)",  desc:"",precio:4000},
    {id:"ce5", nombre:"Goyeneche Hazy (500ml)",      desc:"",precio:8000},{id:"ce6", nombre:"Goyeneche Honey (500ml)",   desc:"",precio:4000},
    {id:"ce7", nombre:"Goyeneche IPA (500ml)",        desc:"",precio:6000},{id:"ce8", nombre:"Goyeneche Neipa (500ml)",  desc:"",precio:7000},
    {id:"ce9", nombre:"Goyeneche Porter (500ml)",     desc:"",precio:5000},{id:"ce10",nombre:"Goyeneche Scottish (500ml)",desc:"",precio:5000},
    {id:"ce11",nombre:"Goyeneche Tripel (500ml)",     desc:"",precio:6000},
  ]},
  { id:"postres", nombre:"Postres", emoji:"🍫", desc:"", items:[
    {id:"po1",nombre:"Franui — Chocolate con frambuesa",desc:"",precio:10000},
    {id:"po2",nombre:"Franui — Chocolate de leche",     desc:"",precio:10000},
    {id:"po3",nombre:"Franui — Chocolate amargo",       desc:"",precio:10000},
  ]},
];

const fmt     = (n) => `$${Number(n).toLocaleString("es-AR")}`;
const genId   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const timeAgo = (ts) => { const d=Math.floor((Date.now()-Number(ts))/1000); return d<60?`${d}s`:d<3600?`${Math.floor(d/60)}min`:`${Math.floor(d/3600)}h`; };

// Parse Argentine address into parts (handles La Plata/GBA formats)
const parseDireccion = (dir) => {
  if (!dir) return {calle:"", nro:"", entreCalle:"", barrio:""};
  dir = dir.trim().replace(/^[!%#@$,./]+/, "").trim();
  // CASE 1: Barrio privado / fincas / lotes — put everything in calle
  if (/\b(FINCA|ALTOS|LOTE|MZN|MZAN|MANZANA|MNA|UF|TORRE\d|RESERVA|CARMENCITO|VILLALOBOS|GREEN)\b/i.test(dir)) {
    return {calle:dir, nro:"", entreCalle:"", barrio:""};
  }
  // CASE 2: "X N NRO E/ A Y B  BARRIO" — most common La Plata format
  let m = dir.match(/^(.*?)\s+N(?:RO|°|º|\.?)?\s*(\d{3,5})\s+(?:E[/ ]|ENTRE)\s*(.+?)\s{2,}([\w][\w\s]*)$/i);
  if (m) return {calle:m[1].trim(), nro:m[2], entreCalle:m[3].trim(), barrio:m[4].trim()};
  // CASE 2b: "X N NRO E/ A Y B" without barrio
  m = dir.match(/^(.*?)\s+N(?:RO|°|º|\.?)?\s*(\d{3,5})\s+(?:E[/ ]|ENTRE)\s*(.+)$/i);
  if (m) return {calle:m[1].trim(), nro:m[2], entreCalle:m[3].trim(), barrio:""};
  // CASE 3: "X N NRO BARRIO" — no entre calles
  m = dir.match(/^(.*?)\s+N(?:RO|°|º|\.?)?\s*(\d{3,5})\s*(.*)$/i);
  if (m) return {calle:m[1].trim(), nro:m[2], entreCalle:"", barrio:m[3].trim()};
  // CASE 4: "NUM1 NUM2 BARRIO" — La Plata short "471 1470 City Bell"
  m = dir.match(/^(\d{1,4})\s+(\d{3,5})\s*(.*)$/);
  if (m) return {calle:m[1], nro:m[2], entreCalle:"", barrio:m[3].trim()};
  // CASE 5: "X E/ A Y B" — intersection, no house number
  m = dir.match(/^(.*?)\s+(?:E[/ ]|ENTRE|ESQ\.?)\s*(.+)$/i);
  if (m) return {calle:m[1].trim(), nro:"", entreCalle:m[2].trim(), barrio:""};
  // CASE 6: anything else — all in calle
  return {calle:dir, nro:"", entreCalle:"", barrio:""};
};





const ESTADOS = {
  nuevo:     {label:"Nuevo",      next:"preparando", nextLabel:"Empezar preparación",  color:"#CC1F1F", bg:"rgba(204,31,31,.1)",   ring:"#CC1F1F"},
  preparando:{label:"Preparando", next:"listo",      nextLabel:"Marcar como listo ✓",  color:"#D97706", bg:"rgba(217,119,6,.1)",   ring:"#D97706"},
  listo:     {label:"Listo ✓",   next:"entregado",  nextLabel:"Entregar / Despachar",  color:"#16A34A", bg:"rgba(22,163,74,.1)",   ring:"#16A34A"},
  entregado: {label:"Entregado",  next:null,         nextLabel:null,                    color:"#9CA3AF", bg:"rgba(156,163,175,.1)", ring:"#9CA3AF"},
};

const isOpen = () => {
  const now = new Date();
  const mins = now.getHours()*60 + now.getMinutes();
  const abre  = CONFIG.abreH*60  + CONFIG.abreM;
  const cierra= CONFIG.cierraH*60+ CONFIG.cierraM;
  return mins >= abre && mins < cierra;
};

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --red:#CC1F1F; --red-light:rgba(204,31,31,0.08); --red-border:rgba(204,31,31,0.25); --red-glow:rgba(204,31,31,0.2);
      --bg:#FFFFFF; --bg2:#F8F8F8; --surface:#FFFFFF; --surface2:#F3F3F3;
      --border:#E5E5E5; --border2:#D4D4D4;
      --text:#1A1A1A; --text2:#404040; --text3:#737373; --text4:#A3A3A3;
    }
    body,#root{background:var(--bg2);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh;}
    ::-webkit-scrollbar{width:3px;height:3px;}
    ::-webkit-scrollbar-track{background:var(--bg2);}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
    .fade-in{animation:fadeIn .25s ease forwards;}
    .slide-up{animation:slideUp .35s cubic-bezier(.22,1,.36,1) forwards;}
    .scale-in{animation:scaleIn .3s cubic-bezier(.22,1,.36,1) forwards;}
    .pulse-new{animation:pulseNew 2s ease-in-out infinite;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes scaleIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes pulseNew{0%,100%{box-shadow:0 0 0 0 rgba(204,31,31,.4)}60%{box-shadow:0 0 0 10px rgba(204,31,31,0)}}
    .btn{cursor:pointer;border:none;outline:none;transition:all .18s;font-family:'Barlow',sans-serif;}.btn:active{transform:scale(.95);}
    input,textarea{outline:none;border:none;background:transparent;color:var(--text);font-family:'Barlow',sans-serif;}
    input::placeholder,textarea::placeholder{color:var(--text4);}
    .upload-btn{cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;border:1.5px dashed var(--border2);border-radius:10px;background:transparent;color:var(--text3);font-size:13px;padding:10px;width:100%;transition:all .2s;font-family:'Barlow',sans-serif;}
    .upload-btn:hover{border-color:var(--red);color:var(--red);}
    .sh{font-family:'Barlow Condensed',sans-serif;font-weight:800;}
    @media print {
      * { margin:0; padding:0; box-sizing:border-box; }
      body { background:#fff !important; }
      .no-print { display:none !important; }
      .ticket-print {
        display:block !important;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        width: 72mm;
        max-width: 72mm;
        color: #000;
        background: #fff;
      }
      @page { margin: 2mm; size: 80mm auto; }
    }
    .ticket-print { display:none; }
  `}</style>
);

const Card  = ({children, style={}}) => (
  <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.04)",...style}}>{children}</div>
);
const Label = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:2,marginBottom:12,fontFamily:"'Barlow Condensed',sans-serif"}}>{children}</div>
);

export default function App() {
  const isAdmin = window.location.pathname === "/admin";
  const [menu,       setMenu]       = useState(MENU_DEFAULT);
  const [cajaStatus, setCajaStatus] = useState(null); // null=loading, 'abierta', 'cerrada'

  useEffect(() => {
    supabase.from("menu_config").select("data").eq("id",1).maybeSingle()
      .then(({data}) => { if (data?.data) setMenu(data.data); })
      .catch(() => {});
    // Check caja status - initial load
    const checkCaja = () => {
      const hoy = new Date().toISOString().split("T")[0];
      supabase.from("caja").select("estado").eq("fecha", hoy).eq("estado","abierta").limit(1)
        .then(({data}) => setCajaStatus(data && data.length > 0 ? "abierta" : "cerrada"))
        .catch(() => setCajaStatus("cerrada"));
    };
    checkCaja();
    // Poll every 30 seconds so page updates when caja opens/closes
    const iv = setInterval(checkCaja, 30000);
    // Also realtime
    const ch = supabase.channel("caja-status")
      .on("postgres_changes", {event:"*", schema:"public", table:"caja"}, checkCaja)
      .subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(ch); };
  }, []);

  const saveMenu = async (m) => {
    setMenu(m);
    supabase.from("menu_config").upsert({id:1, data:m}).then(()=>{});
  };

  return (
    <>
      <GS/>
      {isAdmin
        ? <AdminLogin menu={menu} saveMenu={saveMenu}/>
        : <CustomerView menu={menu} cajaStatus={cajaStatus}/>}
    </>
  );
}

function AdminLogin({ menu, saveMenu }) {
  const [authed,  setAuthed]  = useState(false);
  const [pin,     setPin]     = useState("");
  const [pinErr,  setPinErr]  = useState(false);
  const [shake,   setShake]   = useState(false);

  const submitPin = () => {
    if (pin === CONFIG.adminPin) {
      setAuthed(true);
    } else {
      setPinErr(true);
      setShake(true);
      setPin("");
      setTimeout(() => { setPinErr(false); setShake(false); }, 700);
    }
  };

  if (authed) return <AdminView onExit={()=>{ window.location.href="/"; }} menu={menu} saveMenu={saveMenu}/>;

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg2)"}}>
      <div className="scale-in" style={{background:"#fff",borderRadius:24,padding:40,width:320,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.1)",border:"1px solid var(--border)"}}>
        <img src={LOGO_SRC} alt="Shako Sushi" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",marginBottom:20,boxShadow:"0 4px 16px var(--red-glow)"}}/>
        <div className="sh" style={{fontSize:24,color:"var(--text)",marginBottom:4}}>Panel de Cocina</div>
        <div style={{fontSize:13,color:"var(--text3)",marginBottom:28}}>Ingresá tu PIN para continuar</div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e=>setPin(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submitPin()}
          autoFocus
          placeholder="• • • • • •"
          style={{
            width:"100%",padding:"16px 18px",
            background:pinErr?"rgba(204,31,31,.05)":"var(--bg2)",
            border:`2px solid ${pinErr?"var(--red)":"var(--border)"}`,
            borderRadius:14,fontSize:28,letterSpacing:12,textAlign:"center",
            marginBottom:14,transition:"all .2s",
            animation:shake?"shake .3s":"none",
            outline:"none",color:"var(--text)",fontFamily:"monospace"
          }}
        />
        {pinErr&&<div style={{fontSize:12,color:"var(--red)",marginBottom:10,fontWeight:600}}>PIN incorrecto</div>}
        <button
          className="btn"
          onClick={submitPin}
          style={{width:"100%",padding:"14px 0",background:"var(--red)",borderRadius:14,color:"#fff",fontSize:16,fontWeight:800,boxShadow:"0 6px 20px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}
        >
          INGRESAR
        </button>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      </div>
    </div>
  );
}

function CustomerView({ menu, cajaStatus }) {
  const menuVis = menu.map(c=>({...c,items:c.items.filter(i=>i.disponible!==false)})).filter(c=>c.items.length>0);
  // Detect mesa from URL: ?mesa=m5
  const mesaQR = new URLSearchParams(window.location.search).get("mesa") || "";
  const [activeCat,  setActiveCat]  = useState(menuVis[0]?.id);
  const [search,     setSearch]     = useState("");
  const [cart,       setCart]       = useState([]);
  const [step,       setStep]       = useState("menu");
  const [form,       setForm]       = useState({nombre:"",telefono:"",notas:"",tipo:"retiro",calle:"",numero:"",entreCalle:"",piso:"",barrio:"",pago:"efectivo",dni:""});
  const [dniLooking, setDniLooking] = useState(false);
  const [dniFound,   setDniFound]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [orderId,    setOrderId]    = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const tabsRef = useRef(null);
  const sRefs   = useRef({});
  const menuFiltered = search.trim()
    ? menuVis.map(c=>({...c,items:c.items.filter(i=>i.nombre.toLowerCase().includes(search.toLowerCase())||i.desc.toLowerCase().includes(search.toLowerCase()))}))
        .filter(c=>c.items.length>0)
    : menuVis;

  useEffect(() => {
    const obs = new IntersectionObserver(
      en => { en.forEach(e => { if (e.isIntersecting) setActiveCat(e.target.dataset.cat); }); },
      { threshold:.25, rootMargin:"-80px 0px -55% 0px" }
    );
    Object.values(sRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [menu]);

  const scrollTo = (id) => {
    sRefs.current[id]?.scrollIntoView({behavior:"smooth",block:"start"});
    tabsRef.current?.querySelector(`[data-tid="${id}"]`)?.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  };
  const add    = (item) => setCart(p => { const ex=p.find(c=>c.item.id===item.id); return ex?p.map(c=>c.item.id===item.id?{...c,qty:c.qty+1}:c):[...p,{item,qty:1}]; });
  const setQty = (id,q) => setCart(p => q<=0?p.filter(c=>c.item.id!==id):p.map(c=>c.item.id===id?{...c,qty:q}:c));
  const getQty = (id)   => cart.find(c=>c.item.id===id)?.qty||0;
  const total      = cart.reduce((s,c) => s+c.item.precio*c.qty, 0);
  const count      = cart.reduce((s,c) => s+c.qty, 0);
  const canConfirm = form.nombre.trim() && (form.tipo==="retiro"||(form.calle.trim()&&(form.numero.trim()||form.entreCalle.trim())));

  const lookupDni = async (val) => {
    setForm(p=>({...p,dni:val}));
    if (val.length < 6) { setDniFound(false); return; }
    setDniLooking(true);
    const {data} = await supabase.from("customers")
      .select("*").or(`dni.eq.${val},telefono.eq.${val}`).limit(1);
    setDniLooking(false);
    if (data && data.length > 0) {
      const c = data[0];
      setDniFound(true);
      const {calle:pc, nro:pn, entreCalle:pec, barrio:pb} = parseDireccion(c.direccion);
      setForm(p=>({...p,
        nombre:      p.nombre      || c.nombre   || "",
        telefono:    p.telefono    || c.telefono || "",
        calle:       p.calle       || pc  || "",
        numero:      p.numero      || pn  || "",
        entreCalle:  p.entreCalle  || pec || "",
        barrio:      p.barrio      || pb  || "",
        tipo:        pc ? "delivery" : p.tipo,
      }));
    } else {
      setDniFound(false);
    }
  };

  const saveCustomer = async (order) => {
    if (!order.dni && !order.telefono) return;
    const key = `dni.eq.${order.dni||"NADA"},telefono.eq.${order.telefono||"NADA"}`;
    const {data} = await supabase.from("customers").select("id,direccion").or(key).limit(1);
    const direccion = [order.calle, order.numero, order.entrecalle?"E/"+order.entrecalle:"", order.piso, order.barrio].filter(Boolean).join(" ");
    if (!data || data.length === 0) {
      // New customer
      supabase.from("customers").insert({
        nombre: order.nombre, dni: order.dni||"", telefono: order.telefono||"", direccion
      }).then(()=>{});
    } else if (direccion && !data[0].direccion) {
      // Update address if we now have one
      supabase.from("customers").update({direccion, nombre: order.nombre}).eq("id", data[0].id).then(()=>{});
    }
  };

  const placeOrder = async () => {
    if (!canConfirm) return;
    setLoading(true);
    const {entreCalle, ...formRest} = form;
    const order = { id:genId(), ...formRest, entrecalle:entreCalle||"", items:cart, total, status:"nuevo", created_at:Date.now(), mesa_id: mesaQR };
    // Esperar confirmación de Supabase antes de mostrar éxito
    const {error} = await supabase.from("orders").insert(order);
    if (error) {
      console.error("Error guardando pedido:", error);
      setLoading(false);
      alert("Hubo un error al enviar tu pedido. Por favor intentá de nuevo.");
      return;
    }
    setOrderId(order.id);
    setOrderTotal(order.total);
    setCart([]);
    setStep("confirm");
    setLoading(false);
    saveCustomer(order);
  };

  const PAGOS = [
    {v:"efectivo",      l:"💵 Efectivo",      desc:"Pagás al recibir / retirar"},
    {v:"transferencia", l:"📲 Transferencia",  desc:"Te mandamos el CBU al confirmar"},
    {v:"tarjeta",       l:"💳 Tarjeta",        desc:"Débito o crédito en el local"},
  ];

  // Caja cerrada — mostrar pantalla de local cerrado
  if (cajaStatus === "cerrada") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",background:"var(--bg2)"}}>
      <img src={LOGO_SRC} alt="Shako Sushi" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",marginBottom:20,opacity:.7}}/>
      <div className="sh" style={{fontSize:30,color:"var(--text)",marginBottom:8}}>Estamos cerrados</div>
      <div style={{color:"var(--text3)",fontSize:15,marginBottom:16,lineHeight:1.7}}>
        Por el momento no estamos tomando pedidos.<br/>
        Volvemos pronto.
      </div>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:40,padding:"10px 22px"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#DC2626",boxShadow:"0 0 6px #DC2626"}}/>
        <span style={{fontSize:13,color:"var(--text3)",fontWeight:600}}>Cerrado</span>
        <span style={{color:"var(--text4)"}}>·</span>
        <span style={{fontSize:13,color:"var(--text3)"}}>{CONFIG.horario}</span>
      </div>
    </div>
  );

  if (step === "confirm") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",background:"var(--bg2)"}}>
      <div className="slide-up">
        <img src={LOGO_SRC} alt="Shako Sushi" style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",boxShadow:"0 8px 32px var(--red-glow)",marginBottom:20}}/>
        <div className="sh" style={{fontSize:32,color:"var(--text)",marginBottom:8}}>¡Pedido enviado!</div>
        <div style={{color:"var(--text3)",fontSize:15,marginBottom:28,lineHeight:1.7}}>Tu pedido fue recibido en Shako Sushi.<br/>En breve comenzamos a prepararlo.</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"var(--red-light)",border:"1px solid var(--red-border)",borderRadius:40,padding:"10px 22px",marginBottom:36}}>
          <span style={{color:"var(--text3)",fontSize:13}}>Pedido</span>
          <span style={{color:"var(--red)",fontFamily:"monospace",fontSize:15,fontWeight:700}}>#{orderId?.slice(-6).toUpperCase()}</span>
          <span style={{color:"var(--text4)"}}>·</span>
          <span style={{color:"var(--text2)",fontSize:13}}>{fmt(orderTotal)}</span>
        </div><br/>
        <button className="btn" onClick={()=>setStep("menu")} style={{background:"var(--red)",color:"#fff",padding:"14px 40px",borderRadius:40,fontSize:16,fontWeight:700,boxShadow:"0 8px 24px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
          HACER OTRO PEDIDO
        </button>
      </div>
    </div>
  );

  if (step === "checkout") return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"var(--bg2)"}}>
      <div style={{position:"sticky",top:0,background:"rgba(255,255,255,.97)",backdropFilter:"blur(14px)",borderBottom:"1px solid var(--border)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,zIndex:10}}>
        <button className="btn" onClick={()=>setStep("menu")} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"7px 16px",color:"var(--text2)",fontSize:14,fontWeight:600}}>← Volver</button>
        <span className="sh" style={{fontSize:20,color:"var(--text)"}}>Confirmá tu pedido</span>
      </div>
      <div style={{padding:16,paddingBottom:32}}>
        <Card>
          <Label>TU PEDIDO</Label>
          {cart.map(c=>(
            <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{flex:1,paddingRight:12}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{c.item.nombre}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{fmt(c.item.precio)} c/u</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button className="btn" onClick={()=>setQty(c.item.id,c.qty-1)} style={{width:30,height:30,borderRadius:8,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontSize:15,fontWeight:800,minWidth:22,textAlign:"center",color:"var(--red)"}}>{c.qty}</span>
                <button className="btn" onClick={()=>add(c.item)} style={{width:30,height:30,borderRadius:8,background:"var(--red)",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                <span style={{fontSize:14,fontWeight:700,color:"var(--red)",minWidth:72,textAlign:"right"}}>{fmt(c.item.precio*c.qty)}</span>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",fontSize:20,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:"var(--text)"}}>
            <span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(total)}</span>
          </div>
        </Card>
        <Card>
          <Label>TUS DATOS</Label>
          {/* DNI / Teléfono para autocompletar */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>DNI O TELÉFONO</div>
            <div style={{position:"relative"}}>
              <input value={form.dni} onChange={e=>lookupDni(e.target.value)} placeholder="Ingresá tu DNI o teléfono"
                style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:`1px solid ${dniFound?"#16A34A":"var(--border)"}`,borderRadius:10,fontSize:14,transition:"border .2s"}}/>
              {dniLooking&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--text4)"}}>🔍</span>}
              {dniFound&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#16A34A"}}>✓</span>}
            </div>
            {dniFound&&<div style={{fontSize:11,color:"#16A34A",marginTop:5,fontWeight:600}}>✓ Cliente encontrado — datos completados automáticamente</div>}
          </div>
          {[{k:"nombre",l:"Nombre *",p:"¿Cómo te llamás?"},{k:"telefono",l:"Teléfono",p:"(opcional)"}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>{f.l}</div>
              <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}
                style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14}}/>
            </div>
          ))}
        </Card>
        <Card>
          <Label>TIPO DE PEDIDO</Label>
          <div style={{display:"flex",gap:8,marginBottom:form.tipo==="delivery"?16:0}}>
            {[{v:"retiro",l:"🏃 Retiro en local"},{v:"delivery",l:"🛵 Delivery"}].map(t=>(
              <button key={t.v} className="btn" onClick={()=>setForm(p=>({...p,tipo:t.v}))}
                style={{flex:1,padding:"13px 0",borderRadius:12,fontSize:14,fontWeight:700,background:form.tipo===t.v?"var(--red-light)":"var(--bg2)",border:`2px solid ${form.tipo===t.v?"var(--red)":"var(--border)"}`,color:form.tipo===t.v?"var(--red)":"var(--text3)",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif"}}>{t.l}</button>
            ))}
          </div>
          {form.tipo==="delivery"&&(
            <div className="fade-in">
              <div style={{height:1,background:"var(--border)",margin:"0 0 16px"}}/>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:2}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Calle *</div>
                  <input value={form.calle} onChange={e=>setForm(p=>({...p,calle:e.target.value}))} placeholder="Ej: Av. San Martín"
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:`1px solid ${form.calle.trim()?"var(--red-border)":"var(--border)"}`,borderRadius:10,fontSize:14}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Número *</div>
                  <input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="1234"
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:`1px solid ${form.numero.trim()?"var(--red-border)":"var(--border)"}`,borderRadius:10,fontSize:14}}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Entre calles (opcional)</div>
                <input value={form.entreCalle} onChange={e=>setForm(p=>({...p,entreCalle:e.target.value}))} placeholder="Ej: 150 y 151"
                  style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14}}/>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Piso / Depto</div>
                  <input value={form.piso} onChange={e=>setForm(p=>({...p,piso:e.target.value}))} placeholder="Ej: 3° B"
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14}}/>
                </div>
                <div style={{flex:2}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Barrio / Localidad</div>
                  <input value={form.barrio} onChange={e=>setForm(p=>({...p,barrio:e.target.value}))} placeholder="Ej: Hudson, Berazategui..."
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14}}/>
                </div>
              </div>
              {(!form.calle.trim()||!form.numero.trim())&&<div style={{fontSize:12,color:"var(--red)",marginTop:6}}>⚠ Completá calle y número para continuar</div>}
            </div>
          )}
          {form.tipo==="retiro"&&<div style={{marginTop:8,background:"var(--bg2)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border)",fontSize:12,color:"var(--text3)"}}>📍 Retirás en <strong style={{color:"var(--text2)"}}>Hudson Plaza Comercial, Berazategui</strong></div>}
        </Card>
        <Card>
          <Label>MÉTODO DE PAGO</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {PAGOS.map(p=>(
              <button key={p.v} className="btn" onClick={()=>setForm(f=>({...f,pago:p.v}))}
                style={{padding:"13px 16px",borderRadius:12,background:form.pago===p.v?"var(--red-light)":"var(--bg2)",border:`2px solid ${form.pago===p.v?"var(--red)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:form.pago===p.v?"var(--red)":"transparent",border:`2px solid ${form.pago===p.v?"var(--red)":"var(--border2)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {form.pago===p.v&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                  </div>
                  <span style={{fontSize:14,fontWeight:600,color:form.pago===p.v?"var(--red)":"var(--text2)"}}>{p.l}</span>
                </div>
                <span style={{fontSize:12,color:"var(--text4)"}}>{p.desc}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NOTAS ADICIONALES (opcional)</div>
          <textarea value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} placeholder="Alergias, aclaraciones, referencias para llegar..." rows={3}
            style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,resize:"none",lineHeight:1.6}}/>
        </Card>
        <button className="btn" onClick={placeOrder} disabled={!canConfirm||loading}
          style={{width:"100%",padding:"16px 0",borderRadius:14,fontSize:18,fontWeight:800,background:canConfirm?"var(--red)":"var(--border)",color:canConfirm?"#fff":"var(--text4)",boxShadow:canConfirm?"0 8px 24px var(--red-glow)":"none",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
          {loading?"ENVIANDO...":`CONFIRMAR PEDIDO · ${fmt(total)}`}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",paddingBottom:90,background:"var(--bg2)"}}>
      <div style={{background:"var(--red)",padding:"18px 18px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src={LOGO_SRC} alt="Shako Sushi" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.4)",flexShrink:0}}/>
            <div>
              <div className="sh" style={{fontSize:26,color:"#fff",lineHeight:1,letterSpacing:1}}>SHAKO SUSHI</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:3}}>{mesaQR ? `🪑 Mesa ${mesaQR.replace("m","").replace("v","Vereda ")}` : CONFIG.ubicacion}</div>
            </div>
          </div>
          {count>0&&(
            <button className="btn" onClick={()=>setStep("checkout")}
              style={{background:"#fff",borderRadius:40,padding:"9px 14px",display:"flex",alignItems:"center",gap:8,color:"var(--red)",fontSize:14,fontWeight:800,boxShadow:"0 4px 12px rgba(0,0,0,.15)"}}>
              🛒 <span style={{background:"var(--red)",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:12,fontWeight:700}}>{count}</span>
              <span style={{fontSize:12}}>·</span><span>{fmt(total)}</span>
            </button>
          )}
        </div>
        {(()=>{
          const open=isOpen();
          return(
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:open?"#4ADE80":"#FF4757",boxShadow:open?"0 0 6px #4ADE80":"0 0 6px #FF4757"}}/>
              <span style={{fontSize:12,color:"rgba(255,255,255,.9)",fontWeight:600}}>{open?"Abierto ahora":"Cerrado"}</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>·</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{CONFIG.horario}</span>
            </div>
          );
        })()}
      </div>
      <div style={{position:"sticky",top:0,background:"rgba(255,255,255,.98)",backdropFilter:"blur(14px)",zIndex:9,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
        <div style={{padding:"10px 14px 8px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:12,padding:"9px 14px"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos..." style={{flex:1,fontSize:14,color:"var(--text)",background:"transparent",border:"none",outline:"none",fontFamily:"'Barlow',sans-serif"}}/>
            {search&&<button className="btn" onClick={()=>setSearch("")} style={{color:"var(--text4)",fontSize:16,lineHeight:1,padding:0,background:"transparent"}}>✕</button>}
          </div>
        </div>
        <div ref={tabsRef} style={{overflowX:"auto",display:"flex",whiteSpace:"nowrap",padding:"2px 2px 0",borderBottom:"1px solid var(--border)"}}>
          {menuVis.map(c=>{
            const active=activeCat===c.id;
            const COLORS={rolls:"#CC1F1F",nigiri:"#E07B39",combinados:"#7C3AED",temaki:"#16A34A",teppan:"#D97706",ceviche:"#0EA5E9",wok:"#EA580C",aperitivos:"#DC2626",vegetarianos:"#16A34A",salsas:"#CA8A04",adicionales:"#6B7280",bebidas:"#2563EB",cervezas:"#D97706",postres:"#DB2877"};
            const col=COLORS[c.id]||"#CC1F1F";
            const ICONS={
              rolls:     (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={c} stroke="none"/></svg>,
              nigiri:    (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><ellipse cx="12" cy="15" rx="7" ry="4"/><path d="M8 15 Q9 9 12 8 Q15 9 16 15"/></svg>,
              combinados:(c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
              temaki:    (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M7 3 L17 3 L13 21 L11 21 Z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="8" y1="14" x2="16" y2="14"/></svg>,
              teppan:    (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="2" y="14" width="20" height="6" rx="2"/><line x1="7" y1="14" x2="7" y2="10"/><line x1="12" y1="14" x2="12" y2="7"/><line x1="17" y1="14" x2="17" y2="10"/></svg>,
              ceviche:   (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M3 12 Q7 5 12 12 Q17 19 21 12"/><circle cx="6" cy="8" r="1.5" fill={c} stroke="none"/><path d="M15 6 Q17 4 19 6"/></svg>,
              wok:       (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M4 8 Q12 17 20 8"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="9" y1="8" x2="7" y2="19"/><line x1="15" y1="8" x2="17" y2="19"/><line x1="7" y1="19" x2="17" y2="19"/></svg>,
              aperitivos:(c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 3 Q14 7 14 10 Q14 13 12 13 Q10 13 10 10 Q10 7 12 3Z"/><path d="M7 13 Q5 16 5 18 Q5 21 9 21 L15 21 Q19 21 19 18 Q19 16 17 13Z"/></svg>,
              vegetarianos:(c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 21 L12 11"/><path d="M12 11 Q17 7 21 9 Q19 16 12 15"/><path d="M12 11 Q7 7 3 9 Q5 16 12 15"/></svg>,
              salsas:    (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M9 3h6l1 5H8z"/><rect x="7" y="8" width="10" height="12" rx="2"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="10" y1="15" x2="14" y2="15"/></svg>,
              adicionales:(c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
              bebidas:   (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M7 4h10l-2 15a2 2 0 0 1-2 1H11a2 2 0 0 1-2-1Z"/><path d="M7 4 L5 10 L7 11"/><line x1="9" y1="9" x2="15" y2="9"/></svg>,
              cervezas:  (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="6" y="6" width="10" height="14" rx="2"/><path d="M16 9h2a2 2 0 0 1 0 4h-2"/><line x1="10" y1="3" x2="10" y2="6"/><line x1="14" y1="3" x2="14" y2="6"/></svg>,
              postres:   (c)=><svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M4 17 Q4 21 12 21 Q20 21 20 17 L18 8 Q16 4 12 4 Q8 4 6 8Z"/><path d="M8 13 Q10 15 12 13 Q14 11 16 13"/></svg>,
            };
            const Icon=ICONS[c.id];
            return(
              <button key={c.id} data-tid={c.id} className="btn" onClick={()=>scrollTo(c.id)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 10px 6px",borderRadius:0,borderBottom:active?"3px solid "+col:"3px solid transparent",background:"transparent",transition:"all .2s",flexShrink:0,minWidth:62}}>
                <div style={{width:40,height:40,borderRadius:10,background:active?col+"15":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                  {Icon?Icon(active?col:"#BBBBBB"):<span style={{fontSize:16}}>{c.emoji}</span>}
                </div>
                <span style={{fontSize:9,fontWeight:700,color:active?col:"#AAAAAA",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.3,textTransform:"uppercase",lineHeight:1.2,maxWidth:58,textAlign:"center",whiteSpace:"normal"}}>
                  {c.nombre.split(",")[0].split(" ").slice(0,2).join(" ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {menuFiltered.map(cat=>(
        <div key={cat.id} ref={el=>{if(el)sRefs.current[cat.id]=el;}} data-cat={cat.id}>
          <div style={{padding:"20px 18px 8px"}}>
            <div className="sh" style={{fontSize:22,color:"var(--text)"}}>{cat.nombre}</div>
            {cat.desc&&<div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{cat.desc}</div>}
          </div>
          {cat.items.map(item=>{
            const qty=getQty(item.id);
            return(
              <div key={item.id} style={{margin:"0 14px 8px",background:"var(--surface)",border:`2px solid ${qty>0?"var(--red)":"var(--border)"}`,borderRadius:14,overflow:"hidden",display:"flex",transition:"border .2s",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                {item.imagen&&<div style={{width:90,minWidth:90,overflow:"hidden"}}><img src={item.imagen} alt={item.nombre} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.parentNode.style.display="none";}}/></div>}
                <div style={{flex:1,padding:"13px 14px",display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,lineHeight:1.35,color:"var(--text)"}}>{item.nombre}</div>
                    {item.desc&&<div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5,marginTop:3}}>{item.desc}</div>}
                    <div className="sh" style={{fontSize:18,color:"var(--red)",marginTop:6}}>{fmt(item.precio)}</div>
                  </div>
                  {qty===0
                    ?<button className="btn" onClick={()=>add(item)} style={{width:40,height:40,borderRadius:10,background:"var(--red-light)",border:"2px solid var(--red-border)",color:"var(--red)",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>+</button>
                    :<div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <button className="btn" onClick={()=>setQty(item.id,qty-1)} style={{width:32,height:32,borderRadius:9,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                      <span style={{fontSize:17,fontWeight:900,minWidth:22,textAlign:"center",color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}>{qty}</span>
                      <button className="btn" onClick={()=>add(item)} style={{width:32,height:32,borderRadius:9,background:"var(--red)",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    </div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {count>0&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"10px 14px",background:"rgba(255,255,255,.97)",backdropFilter:"blur(18px)",borderTop:"1px solid var(--border)",zIndex:20}}>
          <button className="btn" onClick={()=>setStep("checkout")}
            style={{width:"100%",padding:"14px 20px",borderRadius:14,background:"var(--red)",color:"#fff",fontSize:17,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 6px 20px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
            <span style={{background:"rgba(255,255,255,.25)",borderRadius:20,padding:"3px 11px",fontSize:14}}>{count}</span>
            <span>VER PEDIDO</span><span>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const printTicket = (order) => {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;
  const fecha = new Date(Number(order.created_at)).toLocaleDateString("es-AR",{day:"numeric",month:"numeric",year:"numeric"});
  const hora  = new Date(Number(order.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
  const linea = "-".repeat(32);
  const dir = [order.calle, order.numero, order.entrecalle?"e/"+order.entrecalle:"", order.piso, order.barrio].filter(Boolean).join(" ");

  const itemsHtml = (order.items||[]).map(c =>
    `<div style="display:flex;justify-content:space-between;margin:2px 0">
      <span>${c.qty},00 ${c.item.nombre.toUpperCase().substring(0,22)}</span>
      <span>${fmt(c.item.precio*c.qty)}</span>
    </div>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Courier New',monospace; font-size:11px; width:72mm; color:#000; padding:4mm 2mm; }
    .center { text-align:center; }
    .bold { font-weight:bold; }
    .line { border-top:1px dashed #000; margin:4px 0; }
    .row { display:flex; justify-content:space-between; }
    .total { font-size:14px; font-weight:bold; }
    @page { margin:2mm; size:80mm auto; }
  </style></head><body>
  <div class="center bold" style="font-size:13px">SHAKO SUSHI</div>
  <div class="center" style="font-size:9px">Hudson Plaza Comercial, Berazategui</div>
  <div class="center" style="font-size:9px">&lt;&lt; Aceptacion de Consumo &gt;&gt;</div>
  <div class="center" style="font-size:9px">&lt;&lt;&lt; No valido como comp. fiscal &gt;&gt;&gt;</div>
  <div class="line"></div>
  <div>Fecha: ${fecha} - ${hora}</div>
  <div>Pedido Nro: ${order.id.slice(-5).toUpperCase()}</div>
  <div class="line"></div>
  <div>Cliente: ${(order.nombre||"").toUpperCase()}</div>
  ${dir ? `<div>Direccion: ${dir.toUpperCase()}</div>` : ""}
  ${order.telefono ? `<div>TE: ${order.telefono}</div>` : ""}
  ${order.pago ? `<div>Pago: ${order.pago.toUpperCase()}</div>` : ""}
  ${order.notas ? `<div>Nota: ${order.notas}</div>` : ""}
  <div class="line"></div>
  <div class="row"><span>Cant. Descripcion</span><span>Importe</span></div>
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="row total"><span>TOTAL:</span><span>${fmt(order.total)}</span></div>
  <div class="line"></div>
  <br/><br/><br/>
  </body></html>`;

  const win = window.open("","_blank","width=400,height=600");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(()=>{ win.print(); win.close(); }, 400);
};

function AdminView({ onExit, menu, saveMenu }) {
  const [orders,     setOrders]     = useState([]);
  const [filter,     setFilter]     = useState("activos");
  const [expandedId, setExpandedId] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [nuevoPedidoMesaId, setNuevoPedidoMesaId] = useState(null);

  const [caja,         setCaja]         = useState(null);
  const [cajaLoading,  setCajaLoading]  = useState(false);
  const [historialCaja,setHistorialCaja] = useState([]);
  const [cajaVista,    setCajaVista]     = useState("hoy"); // 'hoy' | 'semana' | 'mes'

  const loadCaja = useCallback(async () => {
    const hoy = new Date().toISOString().split("T")[0];
    // Prefer open caja, fallback to most recent of today
    const {data: abierta} = await supabase.from("caja").select("*").eq("fecha", hoy).eq("estado","abierta").limit(1);
    if (abierta && abierta.length > 0) { setCaja(abierta[0]); return; }
    const {data: reciente} = await supabase.from("caja").select("*").eq("fecha", hoy).order("created_at",{ascending:false}).limit(1);
    setCaja(reciente && reciente.length > 0 ? reciente[0] : null);
  }, []);

  const loadHistorialCaja = useCallback(async () => {
    // Último mes de caja
    const hace30 = new Date();
    hace30.setDate(hace30.getDate()-30);
    const desde = hace30.toISOString().split("T")[0];
    const {data} = await supabase.from("caja").select("*").gte("fecha", desde).order("fecha", {ascending:false});
    setHistorialCaja(data || []);
  }, []);

  const abrirCaja = async (monto, notas) => {
    setCajaLoading(true);
    const hoy = new Date().toISOString().split("T")[0];
    const now = new Date(); const hora = now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
    const {data} = await supabase.from("caja").insert({fecha:hoy, estado:"abierta", hora_apertura:hora, monto_apertura:Number(monto), notas_apertura:notas}).select().single();
    setCaja(data);
    setCajaLoading(false);
  };

  const cerrarCaja = async (monto, notas) => {
    if (!caja) return;
    setCajaLoading(true);
    const now2 = new Date(); const hora = now2.getHours().toString().padStart(2,"0")+":"+now2.getMinutes().toString().padStart(2,"0");
    const hoy = new Date().toISOString().split("T")[0];
    const ordersHoyLocal = orders.filter(o=>Number(o.created_at)>=new Date(hoy).setHours(0,0,0,0));
    const totalVentas = ordersHoyLocal.filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0);
    const {data} = await supabase.from("caja").update({estado:"cerrada", hora_cierre:hora, monto_cierre:Number(monto), notas_cierre:notas, total_ventas:totalVentas}).eq("id",caja.id).select().single();
    setCaja(data);
    setCajaLoading(false);
  };

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", {ascending:false});
    if (!error && data) setOrders(data);
  }, []);

  useEffect(() => {
    loadOrders();
    loadCaja();
    loadHistorialCaja();
    // Polling cada 5 segundos como fallback
    const iv = setInterval(loadOrders, 5000);
    // Realtime
    const channel = supabase.channel("orders-rt")
      .on("postgres_changes", {event:"*", schema:"public", table:"orders"}, () => loadOrders())
      .subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(channel); };
  }, [loadOrders]);

  const updateStatus = async (order, ns) => {
    setOrders(p => p.map(o => o.id===order.id ? {...o,status:ns} : o));
    await supabase.from("orders").update({status:ns}).eq("id", order.id);
    // Imprimir ticket automáticamente cuando el pedido está listo
    if (ns === "listo") printTicket({...order, status:"listo"});
  };
  const updatePago = async (order, pago) => {
    setOrders(p => p.map(o => o.id===order.id ? {...o,pago} : o));
    await supabase.from("orders").update({pago}).eq("id", order.id);
  };
  const deleteOrder = async (id) => {
    setOrders(p => p.filter(o => o.id!==id));
    await supabase.from("orders").delete().eq("id", id);
  };

  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const hoyTs = hoy.getTime();
  const ordersHoy = orders.filter(o => Number(o.created_at) >= hoyTs);
  const entH   = ordersHoy.filter(o => o.status === "entregado");
  const totDia = entH.reduce((s,o)=>s+Number(o.total),0);
  const totEf  = entH.filter(o=>o.pago==="efectivo").reduce((s,o)=>s+Number(o.total),0);
  const totTr  = entH.filter(o=>o.pago==="transferencia").reduce((s,o)=>s+Number(o.total),0);
  const totTj  = entH.filter(o=>o.pago==="tarjeta").reduce((s,o)=>s+Number(o.total),0);
  const totDel = entH.filter(o=>o.tipo==="delivery").reduce((s,o)=>s+Number(o.total),0);
  const totRet = entH.filter(o=>o.tipo==="retiro").reduce((s,o)=>s+Number(o.total),0);
  const proyect = ordersHoy.reduce((s,o)=>s+Number(o.total),0);
  const prodMap = {};
  entH.forEach(o => o.items?.forEach(c => {
    if (!prodMap[c.item.nombre]) prodMap[c.item.nombre]={nombre:c.item.nombre,qty:0,total:0};
    prodMap[c.item.nombre].qty   += c.qty;
    prodMap[c.item.nombre].total += c.item.precio*c.qty;
  }));
  const topProds = Object.values(prodMap).sort((a,b)=>b.qty-a.qty).slice(0,8);
  const todayStr = new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
  const filtered = orders.filter(o => filter==="activos"?["nuevo","preparando","listo"].includes(o.status):filter==="entregados"?o.status==="entregado":o.status===filter);
  const counts   = {
    nuevo:     orders.filter(o=>o.status==="nuevo").length,
    preparando:orders.filter(o=>o.status==="preparando").length,
    listo:     orders.filter(o=>o.status==="listo").length,
    entregado: orders.filter(o=>o.status==="entregado").length,
  };
  const TABS = [
    {key:"activos",     label:"Activos",   val:counts.nuevo+counts.preparando+counts.listo, color:"var(--text)"},
    {key:"nuevo",       label:"🔴 Nuevos", val:counts.nuevo,       color:"#CC1F1F"},
    {key:"preparando",  label:"🟡 Prep.",  val:counts.preparando,  color:"#D97706"},
    {key:"listo",       label:"🟢 Listos", val:counts.listo,       color:"#16A34A"},
    {key:"entregados",  label:"Historial", val:counts.entregado,   color:"var(--text3)"},
    {key:"facturacion", label:"Caja",      val:null,               color:"#D97706"},
    {key:"editor",      label:"Menú",      val:null,               color:"#7C3AED"},
    {key:"nuevo_pedido", label:"Pedido",    val:null,               color:"#16A34A"},
    {key:"mesas",        label:"Mesas",     val:null,               color:"#0EA5E9"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"var(--bg2)"}}>
      <div style={{background:"var(--red)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src={LOGO_SRC} alt="Shako" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.4)"}}/>
          <div>
            <div className="sh" style={{fontSize:18,color:"#fff"}}>PANEL DE COCINA</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>Shako Sushi</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#4ADE80",display:"inline-block",boxShadow:"0 0 5px #4ADE80"}}/>En vivo
          </div>
          <button className="btn" onClick={onExit} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:8,padding:"7px 16px",color:"#fff",fontSize:13,fontWeight:600}}>Salir</button>
        </div>
      </div>
      <div style={{display:"flex",background:"var(--surface)",borderBottom:"1px solid var(--border)",overflowX:"auto",boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
        {TABS.map(f=>(
          <button key={f.key} className="btn" onClick={()=>setFilter(f.key)}
            style={{flex:1,minWidth:48,padding:"12px 4px",textAlign:"center",borderBottom:filter===f.key?"3px solid var(--red)":"3px solid transparent",background:"transparent",transition:"all .2s",flexShrink:0}}>
            {f.val!==null
              ?<div className="sh" style={{fontSize:20,color:filter===f.key?"var(--red)":f.val>0?f.color:"var(--text4)"}}>{f.val}</div>
              :<div style={{fontSize:18,color:filter===f.key?"var(--red)":"var(--text4)"}}>
                {f.key==="facturacion"?"💰":f.key==="editor"?"✏️":f.key==="mesas"?"🍽️":"🛒"}
              </div>}
            <div style={{fontSize:10,color:filter===f.key?"var(--red)":"var(--text4)",marginTop:1,whiteSpace:"nowrap",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600}}>{f.label}</div>
          </button>
        ))}
      </div>

      {/* Banner caja cerrada */}
      {!["editor","nuevo_pedido"].includes(filter) && filter!=="facturacion" && (!caja || caja.estado==="cerrada") && (
        <div style={{margin:"12px 12px 0",background:"#FFF7ED",border:"2px solid #FED7AA",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#EA580C",flexShrink:0,boxShadow:"0 0 6px #EA580C"}}/>
          <div style={{flex:1}}>
            <div className="sh" style={{fontSize:14,color:"#EA580C"}}>CAJA CERRADA</div>
            <div style={{fontSize:12,color:"#9A3412",marginTop:2}}>Abrí la caja antes de empezar a tomar pedidos — andá a la tab 💰 Caja</div>
          </div>
          <button className="btn" onClick={()=>setFilter("facturacion")}
            style={{background:"#EA580C",borderRadius:10,padding:"7px 14px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>
            ABRIR CAJA
          </button>
        </div>
      )}

      {filter==="editor" && <MenuEditor menu={menu} saveMenu={saveMenu}/>}

      {filter==="facturacion" && (
        <div className="fade-in" style={{padding:14,paddingBottom:40}}>
          {/* ── ESTADO DE CAJA ── */}
          <CajaWidget caja={caja} cajaLoading={cajaLoading} onAbrir={abrirCaja} onCerrar={cerrarCaja}/>
          {/* ── TABS HOY / SEMANA / MES ── */}
          <div style={{display:"flex",gap:6,marginBottom:16,background:"var(--surface2)",borderRadius:12,padding:4}}>
            {[{k:"hoy",l:"Hoy"},{k:"semana",l:"Esta semana"},{k:"mes",l:"Este mes"},{k:"historial",l:"Historial"}].map(t=>(
              <button key={t.k} className="btn" onClick={()=>setCajaVista(t.k)}
                style={{flex:1,padding:"8px 0",borderRadius:9,fontSize:12,fontWeight:700,background:cajaVista===t.k?"var(--surface)":"transparent",color:cajaVista===t.k?"var(--red)":"var(--text4)",boxShadow:cajaVista===t.k?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.3}}>{t.l}</button>
            ))}
          </div>

          {cajaVista==="hoy"&&<>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div className="sh" style={{fontSize:24,color:"var(--text)"}}>FACTURACIÓN DEL DÍA</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2,textTransform:"capitalize"}}>{todayStr}</div>
            </div>
            <div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#92400E",letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>PEDIDOS HOY</div>
              <div className="sh" style={{fontSize:26,color:"#D97706"}}>{ordersHoy.length}</div>
            </div>
          </div>
          <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:16,padding:"20px 20px 16px",marginBottom:12}}>
            <div style={{fontSize:11,color:"#16A34A",fontWeight:700,letterSpacing:2,marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif"}}>TOTAL COBRADO (ENTREGADOS)</div>
            <div className="sh" style={{fontSize:36,color:"#16A34A"}}>{fmt(totDia)}</div>
            <div style={{marginTop:8,fontSize:12,color:"var(--text3)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"#D97706"}}>⏳</span><span>Proyectado con pedidos en curso:</span>
              <span style={{color:"#D97706",fontWeight:700}}>{fmt(proyect)}</span>
            </div>
          </div>
          <Card style={{marginBottom:12}}>
            <Label>DESGLOSE POR PAGO</Label>
            {[
              {label:"💵 Efectivo",     total:totEf, count:entH.filter(o=>o.pago==="efectivo").length,     color:"#16A34A",bg:"#F0FDF4",border:"#BBF7D0"},
              {label:"📲 Transferencia",total:totTr, count:entH.filter(o=>o.pago==="transferencia").length,color:"#D97706",bg:"#FFFBEB",border:"#FDE68A"},
              {label:"💳 Tarjeta",      total:totTj, count:entH.filter(o=>o.pago==="tarjeta").length,      color:"#2563EB",bg:"#EFF6FF",border:"#BFDBFE"},
            ].map(p=>(
              <div key={p.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:12,background:p.bg,border:`1px solid ${p.border}`,marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:14,fontWeight:700,color:p.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{p.label}</span>
                  <span style={{fontSize:11,color:"var(--text3)",background:"var(--bg2)",padding:"2px 8px",borderRadius:20,border:"1px solid var(--border)"}}>{p.count} pedido{p.count!==1?"s":""}</span>
                </div>
                <span className="sh" style={{fontSize:18,color:p.color}}>{fmt(p.total)}</span>
              </div>
            ))}
            {totDia>0&&(
              <div style={{marginTop:10,height:8,borderRadius:8,background:"var(--bg2)",overflow:"hidden",display:"flex",border:"1px solid var(--border)"}}>
                {totEf>0&&<div style={{width:`${(totEf/totDia*100).toFixed(1)}%`,background:"#16A34A"}}/>}
                {totTr>0&&<div style={{width:`${(totTr/totDia*100).toFixed(1)}%`,background:"#D97706"}}/>}
                {totTj>0&&<div style={{width:`${(totTj/totDia*100).toFixed(1)}%`,background:"#2563EB"}}/>}
              </div>
            )}
          </Card>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[
              {label:"🏃 Retiro",  total:totRet, count:entH.filter(o=>o.tipo==="retiro").length,   color:"#7C3AED",bg:"#FAF5FF",border:"#E9D5FF"},
              {label:"🛵 Delivery",total:totDel, count:entH.filter(o=>o.tipo==="delivery").length, color:"#D97706",bg:"#FFFBEB",border:"#FDE68A"},
            ].map(t=>(
              <div key={t.label} style={{flex:1,background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:"14px 16px"}}>
                <div className="sh" style={{fontSize:14,color:t.color,marginBottom:4}}>{t.label}</div>
                <div className="sh" style={{fontSize:22,color:t.color}}>{fmt(t.total)}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:3}}>{t.count} pedido{t.count!==1?"s":""}</div>
              </div>
            ))}
          </div>
          <Card style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:"var(--text3)",letterSpacing:1.5,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>TICKET PROMEDIO</div>
              <div className="sh" style={{fontSize:26,color:"var(--red)"}}>{entH.length>0?fmt(Math.round(totDia/entH.length)):"—"}</div>
            </div>
            <div style={{width:1,height:40,background:"var(--border)"}}/>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"var(--text3)",letterSpacing:1.5,marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>UNIDADES VENDIDAS</div>
              <div className="sh" style={{fontSize:26,color:"var(--text2)"}}>{entH.reduce((s,o)=>s+(o.items?.reduce((a,c)=>a+c.qty,0)||0),0)}</div>
            </div>
          </Card>
          {topProds.length>0&&(
            <Card style={{marginBottom:12}}>
              <Label>🏆 PRODUCTOS MÁS VENDIDOS</Label>
              {topProds.map((p,i)=>(
                <div key={p.nombre} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<topProds.length-1?"1px solid var(--border)":"none"}}>
                  <div style={{width:24,height:24,borderRadius:8,background:i===0?"#FEF3C7":i===1?"#F3F4F6":"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:i===0?"#D97706":i===1?"#6B7280":"var(--text4)",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",border:"1px solid var(--border)"}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--text)"}}>{p.nombre}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{fmt(p.total)} · {p.qty} unid.</div>
                  </div>
                  <div style={{width:70,height:5,borderRadius:5,background:"var(--bg2)",overflow:"hidden",flexShrink:0,border:"1px solid var(--border)"}}>
                    <div style={{height:"100%",background:i===0?"#D97706":i===1?"#9CA3AF":"var(--red)",width:`${(p.qty/topProds[0].qty*100).toFixed(0)}%`}}/>
                  </div>
                </div>
              ))}
            </Card>
          )}
          <Card>
            <Label>TODOS LOS PEDIDOS DE HOY</Label>
            {ordersHoy.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"var(--text4)",fontSize:14}}>Todavía no hay pedidos hoy</div>}
            {ordersHoy.map((o,i)=>{
              const est=ESTADOS[o.status]||ESTADOS.nuevo;
              return(
                <div key={o.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<ordersHoy.length-1?"1px solid var(--border)":"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:est.ring,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{o.nombre}</span>
                      <span style={{fontSize:10,color:"var(--text4)",fontFamily:"monospace"}}>#{o.id.slice(-5).toUpperCase()}</span>
                      <span style={{fontSize:10,fontWeight:700,color:est.color,background:est.bg,padding:"1px 6px",borderRadius:20}}>{est.label}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                      {new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})} · {o.items?.reduce((s,c)=>s+c.qty,0)||0} items
                      {o.pago&&<span style={{marginLeft:4,color:o.pago==="efectivo"?"#16A34A":o.pago==="transferencia"?"#D97706":"#2563EB"}}>· {o.pago==="efectivo"?"💵":o.pago==="transferencia"?"📲":"💳"}</span>}
                      {o.tipo==="delivery"&&<span style={{marginLeft:4,color:"#D97706"}}>· 🛵</span>}
                    </div>
                  </div>
                  <span className="sh" style={{fontSize:15,color:o.status==="entregado"?"#16A34A":"var(--text3)",flexShrink:0}}>{fmt(o.total)}</span>
                </div>
              );
            })}
            {entH.length>0&&(
              <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",fontWeight:800,fontSize:16,borderTop:"1px solid var(--border)",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif"}}>
                <span style={{color:"var(--text3)"}}>Total cobrado</span>
                <span style={{color:"#16A34A"}}>{fmt(totDia)}</span>
              </div>
            )}
          </Card>
          </>}

          {(cajaVista==="semana"||cajaVista==="mes")&&<HistorialCajaResumen historial={historialCaja} vista={cajaVista} orders={orders}/>}
          {cajaVista==="historial"&&<HistorialCajaTabla historial={historialCaja} onReload={loadHistorialCaja}/>}
        </div>
      )}

      {filter==="mesas"&&<MesasView onNewOrder={(mesaId)=>{setFilter("nuevo_pedido");setNuevoPedidoMesaId(mesaId);}} />}
      {filter==="nuevo_pedido"&&<NuevoPedidoAdmin menu={menu} mesaId={nuevoPedidoMesaId} onClose={()=>{setFilter(nuevoPedidoMesaId?"mesas":"activos");setNuevoPedidoMesaId(null);}} onOrderPlaced={()=>{loadOrders();}} />}

      {!["editor","facturacion"].includes(filter)&&(
        <div style={{padding:"12px 12px 40px"}}>
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"48px 20px",color:"var(--text3)"}}>
              <img src={LOGO_SRC} alt="" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",opacity:.3,marginBottom:12}}/>
              <div className="sh" style={{fontSize:18,marginBottom:4,color:"var(--text2)"}}>Sin pedidos</div>
              <div style={{fontSize:13}}>No hay pedidos en esta categoría</div>
            </div>
          )}
          {filtered.map(order=>{
            const est=ESTADOS[order.status]||ESTADOS.nuevo; const isExp=expandedId===order.id;
            return(
              <div key={order.id} className={order.status==="nuevo"?"pulse-new":""}
                style={{background:"var(--surface)",border:`2px solid ${isExp?est.ring:order.status==="nuevo"?"rgba(204,31,31,.3)":"var(--border)"}`,borderRadius:16,marginBottom:10,overflow:"hidden",transition:"all .2s",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"}} onClick={()=>setExpandedId(isExp?null:order.id)}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:est.ring,boxShadow:`0 0 6px ${est.ring}`,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span className="sh" style={{fontSize:15,color:"var(--text)"}}>#{order.id.slice(-6).toUpperCase()}</span>
                      <span style={{fontSize:12,fontWeight:700,color:est.color,background:est.bg,padding:"2px 8px",borderRadius:20}}>{est.label}</span>
                      {order.tipo==="delivery"&&<span style={{fontSize:11,color:"#D97706",background:"#FFFBEB",padding:"2px 6px",borderRadius:20,fontWeight:600}}>🛵 Delivery</span>}
                    </div>
                    <div style={{fontSize:13,color:"var(--text3)",marginTop:3}}>{order.nombre} · {timeAgo(order.created_at)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="sh" style={{fontSize:17,color:"var(--red)"}}>{fmt(order.total)}</div>
                    <div style={{fontSize:11,color:"var(--text4)",marginTop:1}}>{order.items?.reduce((s,c)=>s+c.qty,0)||0} items</div>
                  </div>
                  <span style={{color:"var(--text4)",fontSize:13}}>{isExp?"▲":"▼"}</span>
                </div>
                {isExp&&(
                  <div className="fade-in" style={{padding:"0 14px 14px",borderTop:"1px solid var(--border)"}}>
                    <div style={{paddingTop:12,marginBottom:10}}>
                      {order.items?.map(c=>(
                        <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                          <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                          <span style={{color:"var(--text3)"}}>{fmt(c.item.precio*c.qty)}</span>
                        </div>
                      ))}
                    </div>
                    {order.telefono&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:13,color:"var(--text3)"}}>📞 {order.telefono}</span>
                        <a href={`https://wa.me/54${order.telefono.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                          style={{color:"#16A34A",fontSize:12,textDecoration:"none",background:"#F0FDF4",border:"1px solid #BBF7D0",padding:"2px 8px",borderRadius:20,fontWeight:600}}>WhatsApp →</a>
                      </div>
                    )}
                    {order.tipo==="delivery"&&order.calle&&(
                      <div style={{fontSize:13,background:"#FFFBEB",borderRadius:10,padding:"9px 13px",marginBottom:10,border:"1px solid #FDE68A",display:"flex",gap:8}}>
                        <span>🛵</span>
                        <div>
                          <div style={{color:"#D97706",fontSize:11,fontWeight:700,marginBottom:3,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>DIRECCIÓN DE ENTREGA</div>
                          <div style={{color:"var(--text2)"}}>{order.calle} {order.numero}{order.entrecalle?` e/ ${order.entrecalle}`:""}{order.piso?`, ${order.piso}`:""}</div>
                          {order.barrio&&<div style={{color:"var(--text3)",fontSize:12,marginTop:1}}>{order.barrio}</div>}
                        </div>
                      </div>
                    )}
                    {order.notas&&(
                      <div style={{fontSize:13,color:"var(--text2)",background:"var(--bg2)",borderRadius:10,padding:"10px 14px",marginBottom:12,borderLeft:`3px solid ${est.ring}`,lineHeight:1.5}}>
                        💬 <em>{order.notas}</em>
                      </div>
                    )}
                    {/* Cambio de método de pago */}
                    <div style={{marginTop:10,marginBottom:8}}>
                      <div style={{fontSize:10,color:"var(--text4)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,marginBottom:6}}>MÉTODO DE PAGO</div>
                      <div style={{display:"flex",gap:6}}>
                        {[{v:"efectivo",l:"💵 Efectivo"},{v:"transferencia",l:"📲 Transf."},{v:"tarjeta",l:"💳 Tarjeta"}].map(p=>(
                          <button key={p.v} className="btn" onClick={()=>updatePago(order,p.v)}
                            style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:11,fontWeight:700,
                              background:order.pago===p.v?"var(--red-light)":"var(--bg2)",
                              border:`2px solid ${order.pago===p.v?"var(--red)":"var(--border)"}`,
                              color:order.pago===p.v?"var(--red)":"var(--text3)",
                              transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif"}}>
                            {p.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      {est.next&&<button className="btn" onClick={()=>updateStatus(order,est.next)} style={{flex:1,padding:"12px 0",borderRadius:12,background:est.bg,border:`1px solid ${est.ring}`,color:est.color,fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>{est.nextLabel} →</button>}
                      <button className="btn" onClick={()=>printTicket(order)} style={{padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:13,fontWeight:600}}>🖨️ Ticket</button>
                      {order.status==="entregado"&&<button className="btn" onClick={()=>deleteOrder(order.id)} style={{padding:"12px 16px",borderRadius:12,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:13,fontWeight:600}}>Eliminar</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MenuEditor({ menu, saveMenu }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [editId,      setEditId]      = useState(null);
  const [saved,       setSaved]       = useState(false);
  const editCatId  = editId?.split(":")[0];
  const editItemId = editId?.split(":")[1];
  const editCat    = editCatId  ? menu.find(c=>c.id===editCatId)  : null;
  const editItem   = editCat    ? editCat.items.find(i=>i.id===editItemId) : null;
  const updCat  = (catId,ch)        => saveMenu(menu.map(c=>c.id===catId?{...c,...ch}:c));
  const updItem = (catId,itemId,ch) => saveMenu(menu.map(c=>c.id===catId?{...c,items:c.items.map(i=>i.id===itemId?{...i,...ch}:i)}:c));
  const delItem = (catId,itemId)    => { saveMenu(menu.map(c=>c.id===catId?{...c,items:c.items.filter(i=>i.id!==itemId)}:c)); if(editItemId===itemId)setEditId(null); };
  const addItem = (catId)           => { const ni={id:genId(),nombre:"Nuevo producto",desc:"",precio:0}; saveMenu(menu.map(c=>c.id===catId?{...c,items:[...c.items,ni]}:c)); setEditId(`${catId}:${ni.id}`); setExpandedCat(catId); };
  const addCat  = ()                => { const nc={id:genId(),nombre:"Nueva categoría",emoji:"🍴",desc:"",items:[]}; saveMenu([...menu,nc]); setExpandedCat(nc.id); };
  const delCat  = (catId)           => { if(!window.confirm("¿Eliminar esta categoría?"))return; saveMenu(menu.filter(c=>c.id!==catId)); if(expandedCat===catId)setExpandedCat(null); };
  const handleFile = (catId,itemId,file) => { if(!file)return; const r=new FileReader(); r.onload=e=>updItem(catId,itemId,{imagen:e.target.result}); r.readAsDataURL(file); };
  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <div className="fade-in" style={{padding:14,paddingBottom:40}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div className="sh" style={{fontSize:24,color:"var(--text)"}}>EDITOR DEL MENÚ</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Tocá cualquier producto para editarlo</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {saved&&<span className="fade-in" style={{fontSize:12,color:"#16A34A",fontWeight:700}}>✓ Guardado</span>}
          <button className="btn" onClick={flash} style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"8px 16px",color:"#16A34A",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>GUARDAR</button>
        </div>
      </div>
      {editItem&&(
        <div className="slide-up" style={{background:"var(--surface)",border:"2px solid #E9D5FF",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span className="sh" style={{fontSize:16,color:"#7C3AED"}}>✏️ EDITANDO PRODUCTO</span>
            <button className="btn" onClick={()=>setEditId(null)} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:"5px 12px",color:"var(--text3)",fontSize:13,fontWeight:600}}>✕ Cerrar</button>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>IMAGEN</div>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:88,height:88,borderRadius:10,overflow:"hidden",flexShrink:0,background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                {editItem.imagen
                  ?<><img src={editItem.imagen} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                    <button className="btn" onClick={()=>updItem(editCatId,editItemId,{imagen:""})} style={{position:"absolute",top:4,right:4,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,.6)",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </>:<span style={{color:"var(--text4)",fontSize:28}}>📷</span>}
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                <label className="upload-btn"><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(editCatId,editItemId,e.target.files[0])}/>📤 Subir foto</label>
                <div style={{textAlign:"center",fontSize:11,color:"var(--text4)"}}>— o pegá una URL —</div>
                <input value={editItem.imagen||""} onChange={e=>updItem(editCatId,editItemId,{imagen:e.target.value})} placeholder="https://foto.com/imagen.jpg"
                  style={{width:"100%",padding:"9px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,fontSize:12}}/>
              </div>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NOMBRE *</div>
            <input value={editItem.nombre} onChange={e=>updItem(editCatId,editItemId,{nombre:e.target.value})}
              style={{width:"100%",padding:"11px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,fontWeight:600}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>DESCRIPCIÓN</div>
            <textarea value={editItem.desc||""} onChange={e=>updItem(editCatId,editItemId,{desc:e.target.value})} rows={2}
              style={{width:"100%",padding:"11px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,resize:"none",lineHeight:1.5}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>PRECIO ($)</div>
            <input type="number" min="0" step="100" value={editItem.precio} onChange={e=>updItem(editCatId,editItemId,{precio:Number(e.target.value)})}
              style={{width:"100%",padding:"11px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:20,fontWeight:800,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"var(--bg2)",borderRadius:10,border:"1px solid var(--border)",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Disponible en el menú</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>Si está desactivado no aparece a los clientes</div>
            </div>
            <div onClick={()=>updItem(editCatId,editItemId,{disponible:editItem.disponible===false})}
              style={{width:44,height:24,borderRadius:12,background:editItem.disponible!==false?"var(--red)":"var(--border)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:editItem.disponible!==false?"23px":"3px",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
            </div>
          </div>
          <button className="btn" onClick={()=>delItem(editCatId,editItemId)}
            style={{width:"100%",padding:"10px 0",borderRadius:10,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
            🗑 ELIMINAR ESTE PRODUCTO
          </button>
        </div>
      )}
      {menu.map(cat=>(
        <div key={cat.id} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,marginBottom:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer",borderBottom:expandedCat===cat.id?"1px solid var(--border)":"none"}}
            onClick={()=>setExpandedCat(expandedCat===cat.id?null:cat.id)}>
            <input value={cat.emoji} onChange={e=>updCat(cat.id,{emoji:e.target.value})} onClick={e=>e.stopPropagation()}
              style={{width:36,padding:"4px 0",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,fontSize:18,textAlign:"center"}}/>
            <input value={cat.nombre} onChange={e=>updCat(cat.id,{nombre:e.target.value})} onClick={e=>e.stopPropagation()}
              style={{flex:1,padding:"7px 10px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,fontSize:14,fontWeight:700,color:"var(--text)"}}/>
            <span style={{fontSize:11,color:"var(--text4)",whiteSpace:"nowrap"}}>{cat.items.length} prod.</span>
            <span style={{color:"var(--text4)",fontSize:13}}>{expandedCat===cat.id?"▲":"▼"}</span>
          </div>
          {expandedCat===cat.id&&(
            <div className="fade-in" style={{padding:"8px 10px 12px",background:"var(--bg2)"}}>
              <div style={{marginBottom:10}}>
                <input value={cat.desc||""} onChange={e=>updCat(cat.id,{desc:e.target.value})} placeholder="Descripción (opcional)"
                  style={{width:"100%",padding:"8px 12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,fontSize:12,color:"var(--text2)"}}/>
              </div>
              {cat.items.map(item=>(
                <div key={item.id} onClick={()=>setEditId(editId===`${cat.id}:${item.id}`?null:`${cat.id}:${item.id}`)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",marginBottom:6,
                    background:editId===`${cat.id}:${item.id}`?"#FAF5FF":"var(--surface)",
                    border:`1px solid ${editId===`${cat.id}:${item.id}`?"#E9D5FF":"var(--border)"}`,transition:"all .2s"}}>
                  <div style={{width:38,height:38,borderRadius:8,overflow:"hidden",flexShrink:0,background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border)"}}>
                    {item.imagen?<img src={item.imagen} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:<span style={{color:"var(--text4)",fontSize:16}}>📷</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:item.disponible===false?"var(--text4)":"var(--text)"}}>
                      {item.disponible===false?"🚫 ":""}{item.nombre}
                    </div>
                    <div className="sh" style={{fontSize:13,color:"var(--red)",marginTop:1}}>{fmt(item.precio)}</div>
                  </div>
                  <span style={{fontSize:12,color:"#7C3AED",flexShrink:0}}>✏️</span>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button className="btn" onClick={()=>addItem(cat.id)}
                  style={{flex:1,padding:"10px 0",borderRadius:10,background:"var(--red-light)",border:"1px dashed var(--red-border)",color:"var(--red)",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                  + AGREGAR PRODUCTO
                </button>
                <button className="btn" onClick={()=>delCat(cat.id)}
                  style={{padding:"10px 14px",borderRadius:10,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:13}}>🗑</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button className="btn" onClick={addCat}
        style={{width:"100%",padding:"13px 0",borderRadius:14,background:"transparent",border:"1.5px dashed var(--border2)",color:"var(--text3)",fontSize:14,fontWeight:700,marginTop:4,fontFamily:"'Barlow Condensed',sans-serif"}}>
        + AGREGAR CATEGORÍA
      </button>
    </div>
  );
}

/* ══ CAJA WIDGET ══════════════════════════════════════════════ */
function CajaWidget({ caja, cajaLoading, onAbrir, onCerrar }) {
  const [showForm, setShowForm] = useState(false);
  const [monto,    setMonto]    = useState("");
  const [notas,    setNotas]    = useState("");
  const abierta = caja?.estado === "abierta";

  const handleSubmit = async () => {
    if (abierta) await onCerrar(monto, notas);
    else         await onAbrir(monto, notas);
    setShowForm(false); setMonto(""); setNotas("");
  };

  return (
    <div style={{marginBottom:16}}>
      {/* Estado actual */}
      <div style={{background:abierta?"#F0FDF4":"#FFF1F2",border:`1px solid ${abierta?"#BBF7D0":"#FECDD3"}`,borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:12,height:12,borderRadius:"50%",background:abierta?"#16A34A":"#DC2626",boxShadow:`0 0 8px ${abierta?"#16A34A":"#DC2626"}`}}/>
          <div>
            <div className="sh" style={{fontSize:18,color:abierta?"#16A34A":"#DC2626"}}>{caja?`CAJA ${abierta?"ABIERTA":"CERRADA"}`:"SIN CAJA HOY"}</div>
            {caja&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
              {abierta?`Apertura: ${caja.hora_apertura}`:`Cierre: ${caja.hora_cierre}`}
              {caja.monto_apertura>0&&` · Efectivo inicial: $${Number(caja.monto_apertura).toLocaleString("es-AR")}`}
            </div>}
          </div>
        </div>
        <button className="btn" onClick={()=>setShowForm(!showForm)}
          style={{padding:"9px 18px",borderRadius:12,background:abierta?"rgba(220,38,38,.1)":"rgba(22,163,74,.1)",border:`1px solid ${abierta?"#DC2626":"#16A34A"}`,color:abierta?"#DC2626":"#16A34A",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
          {abierta?"CERRAR CAJA":"ABRIR CAJA"}
        </button>
      </div>

      {/* Formulario apertura/cierre */}
      {showForm&&(
        <div className="slide-up" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:16,marginTop:8}}>
          <div className="sh" style={{fontSize:16,color:"var(--text)",marginBottom:14}}>{abierta?"CERRAR CAJA":"ABRIR CAJA"}</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
              {abierta?"EFECTIVO EN CAJA AL CIERRE ($)":"EFECTIVO INICIAL EN CAJA ($)"}
            </div>
            <input type="number" min="0" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0"
              style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:18,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>NOTAS (opcional)</div>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} placeholder="Observaciones del día..."
              style={{width:"100%",padding:"11px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,resize:"none",lineHeight:1.5}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn" onClick={()=>{setShowForm(false);setMonto("");setNotas("");}}
              style={{flex:1,padding:"11px 0",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,color:"var(--text3)",fontSize:14,fontWeight:600}}>Cancelar</button>
            <button className="btn" onClick={handleSubmit} disabled={cajaLoading}
              style={{flex:2,padding:"11px 0",background:abierta?"#DC2626":"#16A34A",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
              {cajaLoading?"...":(abierta?"CONFIRMAR CIERRE":"CONFIRMAR APERTURA")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ NUEVO PEDIDO DESDE ADMIN ═════════════════════════════════ */
function NuevoPedidoAdmin({ menu, mesaId, onClose, onOrderPlaced }) {
  const menuVis = menu.map(c=>({...c,items:c.items.filter(i=>i.disponible!==false)})).filter(c=>c.items.length>0);
  const [cart,     setCart]     = useState([]);
  const [form,     setForm]     = useState({nombre:"",telefono:"",tipo:mesaId?"mesa":"retiro",calle:"",numero:"",entreCalle:"",piso:"",barrio:"",pago:"efectivo",notas:"",dni:""});
  const [loading,  setLoading]  = useState(false);
  const [dniFound, setDniFound] = useState(false);
  const [search,   setSearch]   = useState("");

  const add    = (item) => setCart(p => { const ex=p.find(c=>c.item.id===item.id); return ex?p.map(c=>c.item.id===item.id?{...c,qty:c.qty+1}:c):[...p,{item,qty:1}]; });
  const setQty = (id,q) => setCart(p => q<=0?p.filter(c=>c.item.id!==id):p.map(c=>c.item.id===id?{...c,qty:q}:c));
  const getQty = (id)   => cart.find(c=>c.item.id===id)?.qty||0;
  const total  = cart.reduce((s,c)=>s+c.item.precio*c.qty,0);
  const fmt    = (n) => `$${Number(n).toLocaleString("es-AR")}`;

  const menuFiltered = search.trim()
    ? menuVis.map(c=>({...c,items:c.items.filter(i=>i.nombre.toLowerCase().includes(search.toLowerCase()))})).filter(c=>c.items.length>0)
    : menuVis;

  const lookupDni = async (val) => {
    setForm(p=>({...p,dni:val}));
    if (val.length < 6) { setDniFound(false); return; }
    const {data} = await supabase.from("customers").select("*").or(`dni.eq.${val},telefono.eq.${val}`).limit(1);
    if (data && data.length > 0) {
      const c = data[0];
      setDniFound(true);
      const {calle:pc2, nro:pn2, entreCalle:pec2, barrio:pb2} = parseDireccion(c.direccion);
      setForm(p=>({...p,
        nombre:     p.nombre     || c.nombre   || "",
        telefono:   p.telefono   || c.telefono || "",
        calle:      p.calle      || pc2  || "",
        numero:     p.numero     || pn2  || "",
        entreCalle: p.entreCalle || pec2 || "",
        barrio:     p.barrio     || pb2  || "",
        tipo:       pc2 ? "delivery" : p.tipo,
      }));
    } else { setDniFound(false); }
  };

  const placeOrder = async () => {
    if (!cart.length || !form.nombre.trim()) return;
    setLoading(true);
    const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    const {entreCalle:ec2, ...formRest2} = form;
    const order = { id:genId(), ...formRest2, entrecalle:ec2||"", items:cart, total, status:"nuevo", created_at:Date.now(), mesa_id: mesaId||"" };
    await supabase.from("orders").insert(order);
    // Mark mesa as ocupada
    if (mesaId) await supabase.from("mesas").update({estado:"ocupada"}).eq("id", mesaId);
    onOrderPlaced();
    onClose();
    setLoading(false);
  };

  const PAGOS=[{v:"efectivo",l:"💵 Efectivo"},{v:"transferencia",l:"📲 Transferencia"},{v:"tarjeta",l:"💳 Tarjeta"}];

  return (
    <div className="fade-in" style={{padding:14,paddingBottom:40}}>
      {mesaId&&(
        <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🪑</span>
          <div className="sh" style={{fontSize:16,color:"#2563EB"}}>PEDIDO PARA MESA {mesaId.toUpperCase().replace("M","")}</div>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div className="sh" style={{fontSize:22,color:"var(--text)"}}>NUEVO PEDIDO</div>
        <button className="btn" onClick={onClose} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"7px 16px",color:"var(--text3)",fontSize:13,fontWeight:600}}>← Volver</button>
      </div>

      {/* Buscador de productos */}
      <div style={{marginBottom:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..." style={{flex:1,fontSize:13,background:"transparent",border:"none",outline:"none"}}/>
        </div>
        <div style={{maxHeight:280,overflowY:"auto"}}>
          {menuFiltered.map(cat=>(
            <div key={cat.id}>
              <div className="sh" style={{fontSize:12,color:"var(--text4)",padding:"6px 4px 4px",letterSpacing:1}}>{cat.nombre}</div>
              {cat.items.map(item=>{
                const qty=getQty(item.id);
                return(
                  <div key={item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 4px",borderBottom:"1px solid var(--border)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{item.nombre}</div>
                      <div style={{fontSize:12,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{fmt(item.precio)}</div>
                    </div>
                    {qty===0
                      ?<button className="btn" onClick={()=>add(item)} style={{width:32,height:32,borderRadius:8,background:"var(--red-light)",border:"1px solid var(--red-border)",color:"var(--red)",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      :<div style={{display:"flex",alignItems:"center",gap:6}}>
                        <button className="btn" onClick={()=>setQty(item.id,qty-1)} style={{width:28,height:28,borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                        <span style={{fontSize:14,fontWeight:800,minWidth:18,textAlign:"center",color:"var(--red)"}}>{qty}</span>
                        <button className="btn" onClick={()=>add(item)} style={{width:28,height:28,borderRadius:7,background:"var(--red)",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen carrito */}
      {cart.length>0&&(
        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:14,padding:14,marginBottom:14}}>
          <div className="sh" style={{fontSize:13,color:"#16A34A",marginBottom:8}}>PRODUCTOS SELECCIONADOS</div>
          {cart.map(c=>(
            <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid #BBF7D0"}}>
              <span>{c.qty}× {c.item.nombre}</span>
              <span style={{fontWeight:700}}>{fmt(c.item.precio*c.qty)}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontWeight:800,fontSize:16,fontFamily:"'Barlow Condensed',sans-serif"}}>
            <span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(total)}</span>
          </div>
        </div>
      )}

      {/* Datos del cliente */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:14,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",marginBottom:12,letterSpacing:1}}>DATOS DEL CLIENTE</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>DNI O TELÉFONO</div>
          <div style={{position:"relative"}}>
            <input value={form.dni} onChange={e=>lookupDni(e.target.value)} placeholder="Para autocompletar datos"
              style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:`1px solid ${dniFound?"#16A34A":"var(--border)"}`,borderRadius:10,fontSize:13}}/>
            {dniFound&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#16A34A",fontSize:14}}>✓</span>}
          </div>
        </div>
        {[{k:"nombre",l:"Nombre *",p:"Nombre del cliente"},{k:"telefono",l:"Teléfono",p:"(opcional)"}].map(f=>(
          <div key={f.k} style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{f.l}</div>
            <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}
              style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {[{v:"retiro",l:"🏃 Retiro"},{v:"delivery",l:"🛵 Delivery"}].map(t=>(
            <button key={t.v} className="btn" onClick={()=>setForm(p=>({...p,tipo:t.v}))}
              style={{flex:1,padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:700,background:form.tipo===t.v?"var(--red-light)":"var(--bg2)",border:`2px solid ${form.tipo===t.v?"var(--red)":"var(--border)"}`,color:form.tipo===t.v?"var(--red)":"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif"}}>{t.l}</button>
          ))}
        </div>
        {form.tipo==="delivery"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:2}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Calle</div>
                <input value={form.calle} onChange={e=>setForm(p=>({...p,calle:e.target.value}))} placeholder="Calle"
                  style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Número</div>
                <input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="Nro"
                  style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
              </div>
            </div>
            <div>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Barrio / Localidad</div>
              <input value={form.barrio} onChange={e=>setForm(p=>({...p,barrio:e.target.value}))} placeholder="Ej: Hudson, Berazategui..."
                style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
            </div>
          </div>
        )}
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>MÉTODO DE PAGO</div>
          <div style={{display:"flex",gap:6}}>
            {PAGOS.map(p=>(
              <button key={p.v} className="btn" onClick={()=>setForm(f=>({...f,pago:p.v}))}
                style={{flex:1,padding:"9px 0",borderRadius:10,fontSize:11,fontWeight:700,background:form.pago===p.v?"var(--red-light)":"var(--bg2)",border:`2px solid ${form.pago===p.v?"var(--red)":"var(--border)"}`,color:form.pago===p.v?"var(--red)":"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif"}}>{p.l}</button>
            ))}
          </div>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>NOTAS</div>
          <textarea value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} placeholder="Aclaraciones..." rows={2}
            style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,resize:"none",lineHeight:1.5}}/>
        </div>
      </div>

      <button className="btn" onClick={placeOrder} disabled={!cart.length||!form.nombre.trim()||loading}
        style={{width:"100%",padding:"15px 0",borderRadius:14,fontSize:17,fontWeight:800,background:cart.length&&form.nombre.trim()?"#16A34A":"var(--border)",color:cart.length&&form.nombre.trim()?"#fff":"var(--text4)",boxShadow:cart.length&&form.nombre.trim()?"0 6px 20px rgba(22,163,74,.3)":"none",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
        {loading?"CREANDO PEDIDO...":`CONFIRMAR PEDIDO · ${fmt(total)}`}
      </button>
    </div>
  );
}

/* ══ HISTORIAL CAJA RESUMEN (SEMANA / MES) ════════════════════ */
function HistorialCajaResumen({ historial, vista, orders }) {
  const fmt = (n) => `$${Number(n||0).toLocaleString("es-AR")}`;
  const now = new Date();

  const filtrado = historial.filter(c => {
    const d = new Date(c.fecha);
    if (vista === "semana") {
      const lunes = new Date(now);
      lunes.setDate(now.getDate() - now.getDay() + 1);
      lunes.setHours(0,0,0,0);
      return d >= lunes;
    } else {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
  });

  const dias          = filtrado.length;
  const totalVentas   = filtrado.reduce((s,c)=>s+Number(c.total_ventas||0),0);
  const promDiario    = dias>0 ? totalVentas/dias : 0;
  const diasAbiertos  = filtrado.filter(c=>c.estado==="cerrada").length;
  const maxDia        = filtrado.reduce((max,c)=>Number(c.total_ventas||0)>Number(max.total_ventas||0)?c:max, filtrado[0]||{});

  // Bar chart data
  const maxVal = Math.max(...filtrado.map(c=>Number(c.total_ventas||0)), 1);

  return (
    <div className="fade-in">
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {l:vista==="semana"?"TOTAL SEMANA":"TOTAL MES",    v:fmt(totalVentas),  bg:"#F0FDF4",bc:"#BBF7D0",c:"#16A34A"},
          {l:"PROMEDIO DIARIO",  v:fmt(promDiario),  bg:"#EFF6FF",bc:"#BFDBFE",c:"#2563EB"},
          {l:"DÍAS TRABAJADOS",  v:`${diasAbiertos}/${dias}`, bg:"#FAF5FF",bc:"#E9D5FF",c:"#7C3AED"},
          {l:"MEJOR DÍA",        v:maxDia?.fecha?new Date(maxDia.fecha+"T12:00:00").toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"}):"—", bg:"#FEF3C7",bc:"#FDE68A",c:"#D97706"},
        ].map(k=>(
          <div key={k.l} style={{background:k.bg,border:`1px solid ${k.bc}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:9,fontWeight:700,color:k.c,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,marginBottom:4}}>{k.l}</div>
            <div className="sh" style={{fontSize:20,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      {filtrado.length > 0 && (
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:2,marginBottom:14,fontFamily:"'Barlow Condensed',sans-serif"}}>
            VENTAS POR DÍA
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:120,overflowX:"auto",paddingBottom:8}}>
            {[...filtrado].reverse().map(c=>{
              const pct = (Number(c.total_ventas||0)/maxVal)*100;
              const fecha = new Date(c.fecha+"T12:00:00");
              const label = fecha.toLocaleDateString("es-AR",{weekday:"short",day:"numeric"});
              const isHoy = c.fecha === new Date().toISOString().split("T")[0];
              return(
                <div key={c.fecha} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:32}}>
                  <div style={{fontSize:9,color:"var(--text4)",marginBottom:3,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
                    {pct>5?`$${(Number(c.total_ventas||0)/1000).toFixed(0)}k`:""}
                  </div>
                  <div style={{width:"100%",background:isHoy?"var(--red)":"#CBD5E1",borderRadius:"4px 4px 0 0",height:`${Math.max(pct,2)}%`,minHeight:2,transition:"height .4s",position:"relative"}}>
                    {c.estado==="abierta"&&<div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",width:6,height:6,borderRadius:"50%",background:"#D97706"}}/>}
                  </div>
                  <div style={{fontSize:8,color:isHoy?"var(--red)":"var(--text4)",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:isHoy?700:400,textAlign:"center",lineHeight:1.2}}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:10,color:"var(--text4)",marginTop:4,display:"flex",alignItems:"center",gap:8}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:"50%",background:"#D97706",display:"inline-block"}}/> Caja aún abierta</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"var(--red)",display:"inline-block"}}/> Hoy</span>
          </div>
        </div>
      )}

      {filtrado.length === 0 && (
        <div style={{textAlign:"center",padding:"32px 0",color:"var(--text4)"}}>
          <div style={{fontSize:32,marginBottom:8}}>📊</div>
          <div className="sh" style={{fontSize:16,color:"var(--text3)"}}>Sin datos para este período</div>
        </div>
      )}
    </div>
  );
}

/* ══ HISTORIAL CAJA TABLA ═════════════════════════════════════ */
function HistorialCajaTabla({ historial, onReload }) {
  const fmt = (n) => `$${Number(n||0).toLocaleString("es-AR")}`;
  const [expandedId,      setExpandedId]      = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pedidosDia,      setPedidosDia]      = useState({});
  const [loadingDia,      setLoadingDia]      = useState(null);

  useEffect(() => { onReload(); }, []);

  const toggleDia = async (c) => {
    const isExp = expandedId === c.id;
    setExpandedId(isExp ? null : c.id);
    if (!isExp && !pedidosDia[c.id]) {
      setLoadingDia(c.fecha);
      const parseHora = (h) => { if (!h) return null; const m = h.match(/(\d{1,2}):(\d{2})/); if (!m) return null; let hh=parseInt(m[1]); const mm=m[2]; if (h.toLowerCase().includes("p") && hh<12) hh+=12; if (h.toLowerCase().includes("a") && hh===12) hh=0; return hh.toString().padStart(2,"0")+":"+mm; };
      const aperturaHora = parseHora(c.hora_apertura);
      const cierreHora   = parseHora(c.hora_cierre);
      const aperturaStr = aperturaHora ? c.fecha + "T" + aperturaHora + ":00" : c.fecha + "T00:00:00";
      const cierreStr   = cierreHora   ? c.fecha + "T" + cierreHora   + ":59" : c.fecha + "T23:59:59";
      const inicio = new Date(aperturaStr).getTime();
      const fin    = new Date(cierreStr).getTime();
      const {data} = await supabase.from("orders")
        .select("*")
        .gte("created_at", inicio)
        .lte("created_at", fin)
        .order("created_at", {ascending:true});
      setPedidosDia(p => ({...p, [c.id]: data || []}));
      setLoadingDia(null);
    }
  };

  const ESTADOS = {
    nuevo:     {label:"Nuevo",     color:"#CC1F1F"},
    preparando:{label:"Preparando",color:"#D97706"},
    listo:     {label:"Listo",     color:"#16A34A"},
    entregado: {label:"Entregado", color:"#9CA3AF"},
  };

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div className="sh" style={{fontSize:20,color:"var(--text)"}}>HISTORIAL DE CAJA</div>
        <button className="btn" onClick={onReload}
          style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"6px 12px",fontSize:12,color:"var(--text3)",fontWeight:600}}>↻ Actualizar</button>
      </div>

      {historial.length === 0 && (
        <div style={{textAlign:"center",padding:"32px 0",color:"var(--text4)"}}>
          <div style={{fontSize:32,marginBottom:8}}>🗂️</div>
          <div className="sh" style={{fontSize:16,color:"var(--text3)"}}>No hay registros de caja todavía</div>
        </div>
      )}

      {historial.map(c => {
        const isExp   = expandedId === c.id;
        const abierta = c.estado === "abierta";
        const fecha   = new Date(c.fecha+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
        const pedidos = pedidosDia[c.id] || [];
        const loading = loadingDia === c.fecha;
        return (
          <div key={c.id} style={{background:"var(--surface)",border:`1px solid ${isExp?"var(--red-border)":"var(--border)"}`,borderRadius:14,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            {/* Header del día */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>toggleDia(c)}>
              <div style={{width:9,height:9,borderRadius:"50%",background:abierta?"#D97706":"#16A34A",flexShrink:0,boxShadow:`0 0 5px ${abierta?"#D97706":"#16A34A"}`}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",textTransform:"capitalize"}}>{fecha}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                  {c.hora_apertura&&`Apertura: ${c.hora_apertura}`}
                  {c.hora_cierre&&` · Cierre: ${c.hora_cierre}`}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="sh" style={{fontSize:17,color:abierta?"#D97706":"#16A34A"}}>
                  {pedidosDia[c.id]
                    ? fmt(pedidosDia[c.id].filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0))
                    : fmt(c.total_ventas)}
                </div>
                <div style={{fontSize:10,color:"var(--text4)",marginTop:1,fontWeight:600}}>{abierta?"EN CURSO":"CERRADA"}</div>
              </div>
              <span style={{color:"var(--text4)",fontSize:12}}>{isExp?"▲":"▼"}</span>
            </div>

            {/* Detalle expandido */}
            {isExp&&(
              <div className="fade-in" style={{padding:"0 14px 14px",borderTop:"1px solid var(--border)"}}>
                {/* KPIs del día */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12,marginBottom:14}}>
                  {[
                    {l:"Efectivo apertura", v:fmt(c.monto_apertura),                                          col:"#2563EB"},
                    {l:"Efectivo cierre",   v:abierta?"—":fmt(c.monto_cierre),                               col:abierta?"var(--text4)":"#16A34A"},
                    {l:"Total ventas",      v:pedidosDia[c.id] ? fmt(pedidosDia[c.id].filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0)) : fmt(c.total_ventas), col:"var(--red)"},
                    {l:"Diferencia caja",   v:abierta?"—":fmt(Number(c.monto_cierre||0)-Number(c.monto_apertura||0)), col:"#7C3AED"},
                  ].map(k=>(
                    <div key={k.l} style={{background:"var(--bg2)",borderRadius:10,padding:"10px 12px",border:"1px solid var(--border)"}}>
                      <div style={{fontSize:9,color:"var(--text4)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:.5,marginBottom:3}}>{k.l.toUpperCase()}</div>
                      <div className="sh" style={{fontSize:17,color:k.col}}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {/* Notas */}
                {c.notas_apertura&&<div style={{marginBottom:6,fontSize:12,color:"var(--text2)",background:"var(--bg2)",borderRadius:9,padding:"8px 12px",border:"1px solid var(--border)"}}>📝 Apertura: <em>{c.notas_apertura}</em></div>}
                {c.notas_cierre&&<div style={{marginBottom:14,fontSize:12,color:"var(--text2)",background:"var(--bg2)",borderRadius:9,padding:"8px 12px",border:"1px solid var(--border)"}}>📝 Cierre: <em>{c.notas_cierre}</em></div>}

                {/* Pedidos del día */}
                <div style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:2,marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif"}}>
                  PEDIDOS DE LA CAJA {!loading&&`(${pedidos.length})`}
                </div>

                {loading&&<div style={{textAlign:"center",padding:"16px 0",color:"var(--text4)",fontSize:13}}>Cargando pedidos...</div>}

                {!loading&&pedidos.length===0&&(
                  <div style={{textAlign:"center",padding:"16px 0",color:"var(--text4)",fontSize:12}}>No hay pedidos registrados este día</div>
                )}

                {!loading&&pedidos.map((o,i)=>{
                  const est = ESTADOS[o.status]||ESTADOS.entregado;
                  const isExpO = expandedOrderId === o.id;
                  return(
                    <div key={o.id} style={{borderBottom:i<pedidos.length-1?"1px solid var(--border)":"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",cursor:"pointer"}} onClick={()=>setExpandedOrderId(isExpO?null:o.id)}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:est.color,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{o.nombre}</span>
                            <span style={{fontSize:10,color:"var(--text4)",fontFamily:"monospace"}}>#{o.id.slice(-5).toUpperCase()}</span>
                            <span style={{fontSize:10,fontWeight:700,color:est.color,background:est.color+"15",padding:"1px 6px",borderRadius:20}}>{est.label}</span>
                            {o.tipo==="delivery"&&<span style={{fontSize:10,color:"#D97706",background:"#FFFBEB",padding:"1px 6px",borderRadius:20,fontWeight:600}}>🛵</span>}
                          </div>
                          <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                            {new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}
                            {" · "}{o.items?.reduce((s,c)=>s+c.qty,0)||0} items
                            {o.pago&&<span style={{marginLeft:4}}>{o.pago==="efectivo"?"💵":o.pago==="transferencia"?"📲":"💳"} {o.pago}</span>}
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
                          <button className="btn" onClick={e=>{e.stopPropagation();printTicket(o);}} style={{padding:"4px 8px",borderRadius:8,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:11}}>🖨️</button>
                          <div className="sh" style={{fontSize:14,color:o.status==="entregado"?"#16A34A":"var(--text3)"}}>{fmt(o.total)}</div>
                          <span style={{fontSize:10,color:"var(--text4)"}}>{isExpO?"▲":"▼"}</span>
                        </div>
                      </div>
                      {isExpO&&(
                        <div className="fade-in" style={{background:"var(--bg2)",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid var(--border)"}}>
                          {o.items?.map(c=>(
                            <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid var(--border)"}}>
                              <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                              <span style={{color:"var(--text3)",fontWeight:600}}>{fmt(c.item.precio*c.qty)}</span>
                            </div>
                          ))}
                          {o.tipo==="delivery"&&o.calle&&(
                            <div style={{marginTop:8,fontSize:11,color:"#D97706",fontWeight:600}}>
                              🛵 {o.calle} {o.numero}{o.entrecalle?` e/${o.entrecalle}`:""}{o.piso?`, ${o.piso}`:""}{o.barrio?` — ${o.barrio}`:""}
                            </div>
                          )}
                          {o.notas&&<div style={{marginTop:6,fontSize:11,color:"var(--text3)",fontStyle:"italic"}}>💬 {o.notas}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Resumen pedidos del día */}
                {!loading&&pedidos.length>0&&(
                  <div style={{marginTop:10,padding:"10px 0 0",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,color:"var(--text3)"}}>
                      {pedidos.filter(o=>o.status==="entregado").length} entregados · {pedidos.filter(o=>o.tipo==="delivery").length} delivery · {pedidos.filter(o=>o.tipo==="retiro").length} retiro
                    </div>
                    <div className="sh" style={{fontSize:15,color:"var(--red)"}}>
                      {fmt(pedidos.filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══ MESAS VIEW ═══════════════════════════════════════════════ */
function MesasView({ onNewOrder }) {
  const [mesas,       setMesas]       = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [selectedMesa,setSelectedMesa]= useState(null);
  const [unirMode,    setUnirMode]    = useState(false);
  const [unirTarget,  setUnirTarget]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  const fmt = (n) => `$${Number(n||0).toLocaleString("es-AR")}`;

  const SECTORES = ["Salón","Vereda","Barra"];
  const ESTADOS_COLOR = {
    libre:   {bg:"#F0FDF4", border:"#BBF7D0", text:"#16A34A", dot:"#16A34A"},
    ocupada: {bg:"#FFF7ED", border:"#FED7AA", text:"#EA580C", dot:"#EA580C"},
    cuenta:  {bg:"#FEF3C7", border:"#FDE68A", text:"#D97706", dot:"#D97706"},
  };

  const load = useCallback(async () => {
    const [{ data: mesasData }, { data: ordersData }] = await Promise.all([
      supabase.from("mesas").select("*").order("id"),
      supabase.from("orders").select("*").in("status",["nuevo","preparando","listo"]).neq("mesa_id",""),
    ]);
    setMesas(mesasData || []);
    setOrders(ordersData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    const ch = supabase.channel("mesas-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"mesas"},()=>load())
      .on("postgres_changes",{event:"*",schema:"public",table:"orders"},()=>load())
      .subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(ch); };
  }, [load]);

  const getMesaOrders = (mesaId) => orders.filter(o => o.mesa_id === mesaId);
  const getMesaTotal  = (mesaId) => getMesaOrders(mesaId).reduce((s,o)=>s+Number(o.total),0);

  const setEstado = async (mesaId, estado) => {
    await supabase.from("mesas").update({estado}).eq("id", mesaId);
    setMesas(p => p.map(m => m.id===mesaId ? {...m,estado} : m));
  };

  const liberarMesa = async (mesaId) => {
    if (!window.confirm("¿Cerrar la cuenta y liberar la mesa?")) return;
    await supabase.from("orders").update({status:"entregado"})
      .eq("mesa_id", mesaId).in("status",["nuevo","preparando","listo"]);
    await supabase.from("mesas").update({estado:"libre", pedidos_ids:[]}).eq("id", mesaId);
    load();
  };

  const unirMesas = async (mesa1Id, mesa2Id) => {
    // Mark mesa2 orders as belonging to mesa1
    await supabase.from("orders").update({mesa_id: mesa1Id})
      .eq("mesa_id", mesa2Id).in("status",["nuevo","preparando","listo"]);
    await supabase.from("mesas").update({estado:"libre", pedidos_ids:[]}).eq("id", mesa2Id);
    setUnirMode(false); setUnirTarget(null);
    load();
    setSelectedMesa(mesa1Id);
  };

  const mesaSeleccionada = mesas.find(m => m.id === selectedMesa);
  const mesaOrders = selectedMesa ? getMesaOrders(selectedMesa) : [];

  const ESTADOS = {
    nuevo:     {label:"Nuevo",     color:"#CC1F1F", bg:"rgba(204,31,31,.1)"},
    preparando:{label:"Preparando",color:"#D97706", bg:"rgba(217,119,6,.1)"},
    listo:     {label:"Listo ✓",  color:"#16A34A", bg:"rgba(22,163,74,.1)"},
  };

  if (loading) return <div style={{padding:40,textAlign:"center",color:"var(--text4)"}}>Cargando mesas...</div>;

  return (
    <div className="fade-in" style={{padding:14,paddingBottom:40}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div className="sh" style={{fontSize:24,color:"var(--text)"}}>MESAS</div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={()=>{setUnirMode(!unirMode);setUnirTarget(null);}}
            style={{padding:"8px 14px",borderRadius:10,background:unirMode?"#FEF3C7":"var(--bg2)",border:`1px solid ${unirMode?"#FDE68A":"var(--border)"}`,color:unirMode?"#D97706":"var(--text3)",fontSize:13,fontWeight:600}}>
            {unirMode?"✕ Cancelar unir":"⊕ Unir mesas"}
          </button>
          <button className="btn" onClick={load}
            style={{padding:"8px 12px",borderRadius:10,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:13}}>↻</button>
        </div>
      </div>

      {unirMode && (
        <div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#92400E"}}>
          {!unirTarget
            ? "Tocá la mesa ORIGEN (la que va a absorber los pedidos)"
            : `Mesa ${mesas.find(m=>m.id===unirTarget)?.nombre} seleccionada. Ahora tocá la mesa que querés UNIR a ella.`}
        </div>
      )}

      {/* Leyenda */}
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {[{e:"libre",l:"Libre"},{e:"ocupada",l:"Ocupada"},{e:"cuenta",l:"Pidiendo cuenta"}].map(x=>(
          <div key={x.e} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text3)"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:ESTADOS_COLOR[x.e].dot}}/>
            {x.l}
          </div>
        ))}
      </div>

      {/* Mesas por sector */}
      {SECTORES.map(sector => {
        const mesasSector = mesas.filter(m => m.sector === sector);
        if (!mesasSector.length) return null;
        return (
          <div key={sector} style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:10}}>{sector.toUpperCase()}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {mesasSector.map(mesa => {
                const ec = ESTADOS_COLOR[mesa.estado] || ESTADOS_COLOR.libre;
                const total = getMesaTotal(mesa.id);
                const nOrders = getMesaOrders(mesa.id).length;
                const isSelected = selectedMesa === mesa.id;
                const isUnirTarget = unirTarget === mesa.id;

                const handleClick = () => {
                  if (unirMode) {
                    if (!unirTarget) { setUnirTarget(mesa.id); return; }
                    if (mesa.id !== unirTarget) unirMesas(unirTarget, mesa.id);
                    return;
                  }
                  setSelectedMesa(isSelected ? null : mesa.id);
                };

                return (
                  <div key={mesa.id} onClick={handleClick}
                    style={{
                      width:90, minHeight:80, borderRadius:14, padding:"10px 8px",
                      background:isUnirTarget?"#FEF3C7":isSelected?"var(--red-light)":ec.bg,
                      border:`2px solid ${isUnirTarget?"#D97706":isSelected?"var(--red)":ec.border}`,
                      cursor:"pointer", transition:"all .2s", textAlign:"center",
                      boxShadow: mesa.estado!=="libre"?"0 2px 8px rgba(0,0,0,.08)":"none",
                      position:"relative",
                    }}>
                    {/* Estado dot */}
                    <div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:ec.dot}}/>
                    <div className="sh" style={{fontSize:16,color:isSelected?"var(--red)":ec.text,marginBottom:4}}>{mesa.nombre}</div>
                    {mesa.estado === "libre"
                      ? <div style={{fontSize:10,color:"var(--text4)"}}>Libre</div>
                      : <>
                          <div style={{fontSize:10,color:ec.text,fontWeight:600}}>{nOrders} pedido{nOrders!==1?"s":""}</div>
                          {total>0&&<div className="sh" style={{fontSize:13,color:ec.text,marginTop:2}}>{fmt(total)}</div>}
                        </>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Panel de mesa seleccionada */}
      {mesaSeleccionada && (
        <div className="slide-up" style={{background:"var(--surface)",border:"2px solid var(--red-border)",borderRadius:16,padding:16,marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div className="sh" style={{fontSize:20,color:"var(--text)"}}>{mesaSeleccionada.nombre}</div>
            <div style={{display:"flex",gap:8}}>
              {/* Cambiar estado */}
              {["libre","ocupada","cuenta"].map(e=>(
                <button key={e} className="btn" onClick={()=>setEstado(mesaSeleccionada.id,e)}
                  style={{padding:"6px 12px",borderRadius:9,fontSize:11,fontWeight:700,
                    background:mesaSeleccionada.estado===e?ESTADOS_COLOR[e].bg:"var(--bg2)",
                    border:`1px solid ${mesaSeleccionada.estado===e?ESTADOS_COLOR[e].border:"var(--border)"}`,
                    color:mesaSeleccionada.estado===e?ESTADOS_COLOR[e].text:"var(--text4)",
                    fontFamily:"'Barlow Condensed',sans-serif",textTransform:"capitalize"}}>
                  {e==="libre"?"Libre":e==="ocupada"?"Ocupada":"Cuenta"}
                </button>
              ))}
            </div>
          </div>

          {/* Pedidos de la mesa */}
          {mesaOrders.length === 0
            ? <div style={{textAlign:"center",padding:"20px 0",color:"var(--text4)",fontSize:13}}>Sin pedidos activos en esta mesa</div>
            : <>
                {mesaOrders.map(o => {
                  const est = ESTADOS[o.status]||ESTADOS.nuevo;
                  return(
                    <div key={o.id} style={{background:"var(--bg2)",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid var(--border)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span className="sh" style={{fontSize:14,color:"var(--text)"}}>#{o.id.slice(-5).toUpperCase()}</span>
                          <span style={{fontSize:11,fontWeight:700,color:est.color,background:est.bg,padding:"2px 8px",borderRadius:20}}>{est.label}</span>
                        </div>
                        <span className="sh" style={{fontSize:15,color:"var(--red)"}}>{fmt(o.total)}</span>
                      </div>
                      {o.items?.map(c=>(
                        <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0",borderBottom:"1px solid var(--border)"}}>
                          <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                          <span style={{color:"var(--text3)"}}>{fmt(c.item.precio*c.qty)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {/* Total y acciones */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 0",borderTop:"1px solid var(--border)",marginTop:4}}>
                  <div className="sh" style={{fontSize:20,color:"var(--text)"}}>TOTAL: <span style={{color:"var(--red)"}}>{fmt(getMesaTotal(mesaSeleccionada.id))}</span></div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn" onClick={()=>printTicket({
                      ...mesaOrders[0],
                      nombre: mesaSeleccionada.nombre,
                      items: mesaOrders.flatMap(o=>o.items||[]),
                      total: getMesaTotal(mesaSeleccionada.id),
                      notas: mesaOrders.map(o=>o.notas).filter(Boolean).join(" | "),
                    })}
                      style={{padding:"10px 16px",borderRadius:12,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:13,fontWeight:600}}>
                      🖨️ Ticket
                    </button>
                    <button className="btn" onClick={()=>liberarMesa(mesaSeleccionada.id)}
                      style={{padding:"10px 16px",borderRadius:12,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#16A34A",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      ✓ Cerrar cuenta
                    </button>
                  </div>
                </div>
              </>
          }

          {/* Nuevo pedido para esta mesa */}
          <button className="btn" onClick={()=>onNewOrder(mesaSeleccionada.id)}
            style={{width:"100%",marginTop:12,padding:"12px 0",borderRadius:12,background:"var(--red-light)",border:"1px dashed var(--red-border)",color:"var(--red)",fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
            + AGREGAR PEDIDO A {mesaSeleccionada.nombre.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}
