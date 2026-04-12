import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LOGO_SRC = "/logo.png";

// Fecha local (Argentina UTC-3) — evita el bug de toISOString() que usa UTC
const fechaLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const CONFIG = {
  nombre: "Shako Sushi", adminPin: "1234",
  ubicacion: "Hudson Plaza Comercial, Berazategui", horario: "16:30 a 23:30", abreH:16, abreM:30, cierraH:23, cierraM:30,
  aliasBanco: "CHACRA.BARRA.OSO",
  aliasMP: "turo22.mp",
  titular: "Juan Agusto Zaro",
  whatsapp: "5491124832305",
  recargoMP: 0.0868, // 8.68% para cubrir comision MP al instante
  tarjetaHabilitada: false, // cambiar a true para habilitar tarjeta/MP en el checkout
  repartidores: ["Marcos", "Lucas", "Nico", "Santiago"], // nombres de los repartidores
  webHabilitada: true, // false = web cerrada manualmente
  promociones: [], // ids de items en promocion: [{itemId, precioPromo, etiqueta}]
};

// ── Grupos de opciones reutilizables ─────────────────────────────────────
const SALSAS_COMUNES = [
  {id:"sc1",nombre:"Buenos Aires",precio:3000},
  {id:"sc2",nombre:"Teriyaki",precio:3000},
  {id:"sc3",nombre:"Tonkatzu",precio:3000},
  {id:"sc4",nombre:"Maracuyá",precio:3000},
  {id:"sc5",nombre:"Agridulce Spring Roll",precio:3000},
  {id:"sc6",nombre:"Soja extra",precio:3000},
];
const INGREDIENTES_WOK = [
  {id:"iw1",nombre:"Pollo",precio:3000},
  {id:"iw2",nombre:"Lomo",precio:4000},
  {id:"iw3",nombre:"Cerdo",precio:0,disponible:false},
  {id:"iw4",nombre:"Camarones",precio:6000},
  {id:"iw5",nombre:"Salmón",precio:7800},
  {id:"iw6",nombre:"Almendras",precio:2000},
  {id:"iw7",nombre:"Hongos",precio:6000},
  {id:"iw8",nombre:"Huevo",precio:1800},
];

const MENU_DEFAULT = [
  { id:"rolls", nombre:"Rolls", emoji:"🍣", desc:"Clásicos, Especiales y Calientes", items:[
    {id:"r1", nombre:"Namazake (10u.)",              desc:"Makis de Salmón.",                                                                precio:16000,imagen:"/imgs/rolls-r1.webp"},
    {id:"r2", nombre:"Maki Philadelphia (10u.)",      desc:"Makis de Salmón y queso Philadelphia.",                                        precio:17000,imagen:"/imgs/rolls-r2.webp"},
    {id:"r3", nombre:"Futo Maki (8u.)",               desc:"Langostinos, Tamagoyaki, Zanahoria, Hongos Shitake y Pepino.",                 precio:17000,imagen:"/imgs/rolls-r3.webp"},
    {id:"r4", nombre:"Philadelphia (8u.)",             desc:"Arroz por fuera, Salmón, Palta y Philadelphia.",                              precio:17000,imagen:"/imgs/rolls-r4.webp"},
    {id:"r5", nombre:"California (8u.)",               desc:"Arroz por fuera, Kanikama y Palta.",                                          precio:15000,imagen:"/imgs/rolls-r5.webp"},
    {id:"r6", nombre:"New York (8u.)",                 desc:"Arroz por fuera, Salmón y Palta.",                                            precio:17000,imagen:"/imgs/rolls-r6.webp"},
    {id:"r7", nombre:"California Especial (8u.)",      desc:"Kanikama, Palta y Philadelphia.",                                             precio:15000,imagen:"/imgs/rolls-r7.webp"},
    {id:"r8", nombre:"Philadelphia Especial (8u.)",    desc:"Salmón, Palta y Philadelphia. Cubierto con ciboulette.",                      precio:17000,imagen:"/imgs/rolls-r8.webp"},
    {id:"r9", nombre:"Ebi Philadelphia (8u.)",         desc:"Langostinos, Palta y queso Philadelphia.",                                    precio:17000,imagen:"/imgs/rolls-r9.webp"},
    {id:"r10",nombre:"Ebi Pinku (8u.)",                desc:"Langostinos, Palta, envuelto en Salmón Rosado.",                              precio:17000,imagen:"/imgs/rolls-r10.webp"},
    {id:"r11",nombre:"Ebi Butterfly (8u.)",            desc:"Langostinos, Pepino, cubierto por Salmón crudo y Palta.",                     precio:17000,imagen:"/imgs/rolls-r11.webp"},
    {id:"r12",nombre:"Magetzu Roll (8u.)",             desc:"Langostinos, Kanikama y Pepino, envuelto en Salmón ahumado.",                 precio:17000,imagen:"/imgs/rolls-r12.webp"},
    {id:"r13",nombre:"Guacamole Roll (8u.)",           desc:"Salmón, Echalotte y Guacamole. Crocante de Won Ton.",                         precio:17000,imagen:"/imgs/rolls-r13.webp"},
    {id:"r14",nombre:"Ginger Roll (8u.)",              desc:"Salmón cocido, Ciboulette, Pepino, Philadelphia. Sésamo.",                    precio:17000,imagen:"/imgs/rolls-r14.webp"},
    {id:"r15",nombre:"Tuna Roll (8u.)",                desc:"Atún cocido, Ciboulette, Pepino, Philadelphia. Sésamo.",                      precio:17000,imagen:"/imgs/rolls-r15.webp"},
    {id:"r16",nombre:"Supremo Roll (8u.)",             desc:"Salmón Rosado, Palta, Philadelphia. Praliné Almendras, Caviar. Maracuyá.",    precio:18000,imagen:"/imgs/rolls-r16.webp"},
    {id:"r17",nombre:"Vegetariano (8u.)",              desc:"Palta, Philadelphia, Pepino, Zanahoria. Sésamo.",                             precio:15000,imagen:"/imgs/rolls-r17.webp"},
    {id:"r18",nombre:"Samurai Roll (8u.)",             desc:"Langostinos, Philadelphia, Berenjena grillada, Bonito y salsa Teriyaki.",      precio:17000,imagen:"/imgs/rolls-r18.webp"},
    {id:"r19",nombre:"Ceviche Roll (8u.)",             desc:"Langostino, Palta, Atún Rojo y Ceviche de Salmón Rosado.",                    precio:19000,imagen:"/imgs/rolls-r19.webp"},
    {id:"r20",nombre:"Crocante Sake (8u.)",            desc:"Salmón Rosado, Salmón ahumado, Pepino, Palta, Philadelphia. Panko. Teriyaki.", precio:19000,imagen:"/imgs/rolls-r20.webp"},
    {id:"r21",nombre:"Crocante Passion (8u.)",         desc:"Salmón Rosado, Langostino, Tamagoyaki, Pepino. Panko, Coco, Almendras. Maracuyá.",precio:19000,imagen:"/imgs/rolls-r21.webp"},
    {id:"r22",nombre:"Kamikaze (8u.)",                 desc:"Langostino frito en Panko. Sésamo tostado. Salsa Tonkatsu.",                  precio:17000},
    {id:"r23",nombre:"Spicy (8u.)",                    desc:"Langostino frito, Palta, Salmón grillado, Shishito Garashi y Teriyaki.",       precio:19000},
    {id:"r24",nombre:"Dragon Sake (8u.)",              desc:"Salmón en pasta de tempura, Philadelphia, Pepino. Envuelto en Tamagoyaki.",    precio:19000},
    {id:"r25",nombre:"Avocado Roll (8u.)",             desc:"Arroz, Alga Nori, Philadelphia y Langostinos. Envuelto en Palta.",             precio:17000},
    {id:"r26",nombre:"Buenos Aires Smoke Roll (8u.)",  desc:"Palta, Salmón, Langostinos, Philadelphia. Salmón Ahumado y Salsa Buenos Aires.",precio:19000},
    {id:"r27",nombre:"Tempura Phila (8u.)",            desc:"Salmón, Palta, Philadelphia. Masa de Tempura frita.",                         precio:18000},
    {id:"r28",nombre:"Roll Lenguado Acevichado (8u.)", desc:"Langostino, Philadelphia de albaca y Ají Amarillo. Lenguado curado y Ceviche.",precio:19000},
  ]},
  { id:"nigiri", nombre:"Nigiri, Geisha & Sashimi", emoji:"🐟", desc:"Bocados premium", items:[
    {id:"n1",nombre:"Nigiri (6u.)",   desc:"Diferentes sabores sobre bocadito de arroz.",                precio:14000,
    opciones:[{id:"og1",nombre:"Elegí la variedad",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Sake (Salmón)",precio:14000},{id:"c2",nombre:"Ebi (Langostinos)",precio:14000},{id:"c3",nombre:"Tako (Pulpo)",precio:23000},{id:"c4",nombre:"Salmón Ahumado",precio:19000},{id:"c5",nombre:"Atún Rojo",precio:22000},{id:"c6",nombre:"Mixto (Salmón, Langostinos y Atún Rojo)",precio:19000}]}]},
    {id:"n2",nombre:"Geishas (6u.)",  desc:"Rolls sin arroz, varios sabores.",                           precio:16000,
    opciones:[{id:"og2",nombre:"Elegí la variante",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Sake (Salmón)",precio:17000},{id:"c2",nombre:"Ebi (Langostinos envueltos en salmón crudo)",precio:17000},{id:"c3",nombre:"Atún Rojo",precio:22000},{id:"c4",nombre:"Vegetariana",precio:16000},{id:"c5",nombre:"Mixta (Salmón, Langostinos y Atún Rojo)",precio:20000}]}]},
    {id:"n3",nombre:"Sashimi (15u.)", desc:"Cortes de Salmón crudo, Pulpo, Atún Rojo y/o Langostinos.", precio:50000,
    opciones:[{id:"og3",nombre:"Elegí la variedad",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Sake (Salmón)",precio:57000},{id:"c2",nombre:"Tako (Pulpo)",precio:72000},{id:"c3",nombre:"Ebi (Langostinos)",precio:50000},{id:"c4",nombre:"Atún Rojo",precio:67000},{id:"c5",nombre:"Mixto (Sake y Tako)",precio:65000},{id:"c6",nombre:"Mixto (Sake y Atún Rojo)",precio:61000}]}]},
  ]},
  { id:"combinados", nombre:"Combinados", emoji:"🎁", desc:"Combinados de Sushi", items:[
    {id:"c1",nombre:"Premium",      desc:"Nigiris de Salmón y Atún. Sashimi. Ceviche Roll. Pinku Ahumado. Supremo Roll.", precio:46000,
    opciones:[{id:"og4",nombre:"Elegí el tamaño",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"20 Unidades",precio:46000},{id:"c2",nombre:"30 Unidades",precio:73000},{id:"c3",nombre:"40 Unidades",precio:79000}]},{id:"og5",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
    {id:"c2",nombre:"Cocido+Crudo", desc:"Nigiris de Salmón y Langostinos, Philadelphia Roll, Ebi Philadelphia + 1 a elección.", precio:37000,
    opciones:[{id:"og6",nombre:"Elegí el tamaño",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"16 Unidades",precio:37000},{id:"c2",nombre:"30 Unidades",precio:64000},{id:"c3",nombre:"40 Unidades",precio:70000}]},{id:"og7",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES},{id:"og8",nombre:"Sabor de las piezas a elección",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Ginger",precio:0},{id:"c2",nombre:"Tuna",precio:0},{id:"c3",nombre:"Kanikama",precio:0}]}]},
    {id:"c3",nombre:"Todo Salmón",  desc:"Sashimi, Nigiris, Geishas, Philadelphia Roll, New York.", precio:41000,
    opciones:[{id:"og9",nombre:"Elegí el tamaño",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"15 Unidades",precio:41000},{id:"c2",nombre:"20 Unidades",precio:46000},{id:"c3",nombre:"30 Unidades",precio:68000},{id:"c4",nombre:"40 Unidades",precio:74000}]},{id:"og10",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
  ]},
  { id:"temaki", nombre:"Temaki y Chirashi", emoji:"🌮", desc:"Cono o ensalada", items:[
    {id:"tm1",nombre:"Temaki (2u.)",  desc:"Sake: Salmón crudo, Philadelphia, Palta. / Ebi: Langostinos, Pepino, Palta.", precio:19000,
    opciones:[{id:"og11",nombre:"Elegí la variante",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Sake (Salmón, 2u.)",precio:20000},{id:"c2",nombre:"Ebi (Langostinos, 2u.)",precio:19000}]}]},
    {id:"tm2",nombre:"Poke Bowl",     desc:"Arroz, Atún rojo, Palta, Cebolla morada, Tomate, Pepino.", precio:48000},
    {id:"tm3",nombre:"Chirashi",      desc:"Arroz, Salmón ahumado, Salmón crudo, Kanikama, Langostinos, Tamagoyaki...", precio:44000},
    {id:"tm4",nombre:"Ensalada Sake", desc:"Arroz, Salmón, Palta y Queso Philadelphia.", precio:38000},
  ]},
  { id:"teppan", nombre:"Teppan", emoji:"🍳", desc:"Cocina a la plancha", items:[
    {id:"tp1",nombre:"Yakimeshi",       desc:"Arroz a la plancha con vegetales e ingredientes a elección.", precio:23000,
    opciones:[{id:"og12",nombre:"Elegí la variante",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Yakimeshi de Pollo",precio:25000},{id:"c2",nombre:"Yakimeshi de Pollo y Almendras",precio:27000},{id:"c3",nombre:"Yakimeshi de Cerdo",precio:25000},{id:"c4",nombre:"Yakimeshi de Lomo",precio:27000},{id:"c5",nombre:"Yakimeshi de Camarones",precio:30000},{id:"c6",nombre:"Yakimeshi de Salmón y Pesca Blanca",precio:32000},{id:"c7",nombre:"Yakimeshi Umi",precio:30000},{id:"c8",nombre:"Yakimeshi de Vegetales",precio:23000}]},{id:"og13",nombre:"Agregá ingredientes",tipo:"checkbox",obligatorio:false,choices:INGREDIENTES_WOK}]},
    {id:"tp2",nombre:"Salmón Teriyaki", desc:"Salmón a la plancha laqueado con teriyaki, arroz y vegetales.", precio:52000},
    {id:"tp3",nombre:"Oishi",           desc:"Langostinos rebozados en panko. Arroz yamani, verduras y hongos.", precio:38000},
    {id:"tp4",nombre:"Cerdo Tonkatsu",  desc:"Cerdo rebozado en panko, salsa tonkatsu y sésamo. Repollo y nabo.", precio:44000},
  ]},
  { id:"ceviche", nombre:"Ceviche", emoji:"🍋", desc:"", items:[
    {id:"cv1",nombre:"Ceviche", desc:"Pescado o marisco crudo marinado en jugo de lima, rocoto, cebolla morada y cilantro.", precio:42000},
  ]},
  { id:"wok", nombre:"Wok", emoji:"🥢", desc:"Platos al Wok", items:[
    {id:"w1",nombre:"Yakisoba",   desc:"Fideos soba salteados con vegetales e ingredientes a elección.", precio:23000,
    opciones:[{id:"og14",nombre:"Elegí la variante",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Yakisoba de Pollo",precio:25000},{id:"c2",nombre:"Yakisoba de Pollo y Almendras",precio:27000},{id:"c3",nombre:"Yakisoba de Cerdo",precio:0,disponible:false},{id:"c4",nombre:"Yakisoba de Lomo",precio:27000},{id:"c5",nombre:"Yakisoba de Camarones",precio:30000},{id:"c6",nombre:"Yakisoba de Pescado",precio:32000},{id:"c7",nombre:"Yakisoba Mizu",precio:30000},{id:"c8",nombre:"Yakisoba de Vegetales",precio:23000}]},{id:"og15",nombre:"Agregá ingredientes",tipo:"checkbox",obligatorio:false,choices:INGREDIENTES_WOK}]},
    {id:"w2",nombre:"Chop Suey", desc:"Vegetales salteados al wok con salsa de soja e ingredientes a elección.", precio:23000,
    opciones:[{id:"og16",nombre:"Elegí la variante",tipo:"radio",obligatorio:true,choices:[{id:"c1",nombre:"Chop Suey de Vegetales y Hongos",precio:25000},{id:"c2",nombre:"Chop Suey de Pollo",precio:25000},{id:"c3",nombre:"Chop Suey de Vegetales",precio:23000}]},{id:"og17",nombre:"Agregá ingredientes",tipo:"checkbox",obligatorio:false,choices:INGREDIENTES_WOK}]},
    {id:"w3",nombre:"Chap Chae", desc:"Fideos de arroz, lomo, pollo, vegetales, huevo y hongos salteados al wok.", precio:25000,
    opciones:[{id:"og18",nombre:"Agregá ingredientes",tipo:"checkbox",obligatorio:false,choices:INGREDIENTES_WOK}]},
  ]},
  { id:"aperitivos", nombre:"Aperitivos Calientes", emoji:"🔥", desc:"", items:[
    {id:"a1",nombre:"Ika Rabas",                        desc:"Aros fritos de Calamar.", precio:21000},
    {id:"a2",nombre:"Gyozas (5u.)",                     desc:"5 Empanadas de cerdo y vegetales a la plancha.", precio:8000,
    opciones:[{id:"og19",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
    {id:"a3",nombre:"Spring Rolls de Carne (2u.)",      desc:"2 Arrolladitos primavera de carne con Salsa agridulce.", precio:6000,
    opciones:[{id:"og20",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
    {id:"a4",nombre:"Spring Rolls Vegetarianos (2u.)",  desc:"2 Arrolladitos primavera vegetarianos con Salsa agridulce.", precio:6000,
    opciones:[{id:"og21",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
    {id:"a5",nombre:"Ebi Furai (9u.)",                  desc:"9 Langostinos apanados en Panko y Fritos.", precio:24000,
    opciones:[{id:"og22",nombre:"Salsas",tipo:"checkbox",obligatorio:false,choices:SALSAS_COMUNES}]},
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
  // New structured format: calle|numero|barrio|entreCalle|piso
  if (dir.includes("|")) {
    const [calle, nro, barrio, entreCalle, piso] = dir.split("|");
    return {calle:calle||"", nro:nro||"", entreCalle:entreCalle||"", barrio:barrio||""};
  }
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

const isOpen = (cfg=CONFIG) => {
  const now = new Date();
  const mins = now.getHours()*60 + now.getMinutes();
  const abre  = cfg.abreH*60  + cfg.abreM;
  const cierra= cfg.cierraH*60+ cfg.cierraM;
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
    .leaflet-container { font-family: 'Barlow', sans-serif !important; }
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
    .cv-cart-panel{display:none;}
    .cv-menu-panel{padding-bottom:90px;}
    @media(min-width:900px){
      .cv-root{width:100%!important;max-width:100%!important;margin:0!important;display:flex!important;flex-direction:row;align-items:flex-start;min-height:100vh;}
      .cv-menu-panel{flex:1;min-width:0;padding-bottom:60px;}
      .cv-cart-panel{width:420px;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;border-left:1px solid var(--border);background:#fff;padding:28px 24px;display:flex!important;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,.04);}
      .cv-bottom-cart{display:none!important;}
      .cv-checkout-root{max-width:900px!important;margin:0 auto!important;}
    }
  `}</style>
);

const Card  = ({children, style={}}) => (
  <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.04)",...style}}>{children}</div>
);
const Label = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:2,marginBottom:12,fontFamily:"'Barlow Condensed',sans-serif"}}>{children}</div>
);

// Load QZ Tray script
if (typeof window !== "undefined" && !window._qzLoaded) {
  window._qzLoaded = true;
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js";
  document.head.appendChild(s);
}

export default function App() {
  const isAdmin = window.location.pathname === "/admin";
  const [menu,       setMenu]       = useState(MENU_DEFAULT);
  const menuLoaded = useRef(false);
  const [cajaStatus, setCajaStatus] = useState(null); // null=loading, 'abierta', 'cerrada'
  const [appConfig,  setAppConfig]  = useState({...CONFIG});

  const saveAppConfig = async (cfg) => {
    setAppConfig(cfg);
    supabase.from("menu_config").upsert({id:2, data:cfg}).then(()=>{});
  };

  useEffect(() => {
    supabase.from("menu_config").select("data").eq("id",2).maybeSingle()
      .then(({data}) => { if (data?.data) setAppConfig(prev=>({...prev,...data.data})); });

    supabase.from("menu_config").select("data").eq("id",1).maybeSingle()
      .then(({data}) => {
        if (!data?.data) { menuLoaded.current = true; return; }
        // Merge opciones from MENU_DEFAULT: if a stored item is missing option groups that
        // MENU_DEFAULT defines (by group id), add them — handles when code adds new groups
        // without requiring a manual menu resave in the admin panel.
        try {
          const defById = {};
          MENU_DEFAULT.forEach(cat => (cat.items||[]).forEach(it => { defById[it.id] = it; }));
          const merged = data.data.map(cat => ({
            ...cat,
            items: (cat.items||[]).map(item => {
              const def = defById[item.id];
              if (!def?.opciones?.length) return item;
              if (!item.opciones?.length) return {...item, opciones: def.opciones};
              const existingIds = new Set(item.opciones.map(g=>g.id));
              const missing = def.opciones.filter(g=>!existingIds.has(g.id));
              return missing.length ? {...item, opciones:[...item.opciones,...missing]} : item;
            })
          }));
          setMenu(merged);
        } catch (err) {
          // Defensive fallback: if merge fails for any reason, use raw stored menu so the
          // user never loses their custom menu and edits don't overwrite it with the default.
          console.error("Error merging menu, using raw stored menu:", err);
          setMenu(data.data);
        }
        menuLoaded.current = true;
      })
      .catch((err) => {
        // Don't mark menuLoaded if fetch failed, to prevent overwriting Supabase with the default
        console.error("Error loading menu from Supabase:", err);
      });
    // Check caja status - initial load
    const checkCaja = () => {
      const hoy = fechaLocal();
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
    if (!menuLoaded.current) return; // prevent saving default menu before Supabase loads
    setMenu(m);
    supabase.from("menu_config").upsert({id:1, data:m}).then(()=>{});
  };

  return (
    <>
      <GS/>
      {isAdmin
        ? <AdminLogin menu={menu} saveMenu={saveMenu} appConfig={appConfig} saveAppConfig={saveAppConfig} />
        : <CustomerView menu={menu} cajaStatus={cajaStatus} appConfig={appConfig}/>}
    </>
  );
}

function AdminLogin({ menu, saveMenu, appConfig, saveAppConfig }) {
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

  if (authed) return <AdminView onExit={()=>{ window.location.href="/"; }} menu={menu} saveMenu={saveMenu} appConfig={appConfig} saveAppConfig={saveAppConfig} />;

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

// ── Helpers para opciones ─────────────────────────────────────────────────
const calcOpcionesPrice = (item, selecciones) => {
  if (!item.opciones?.length) return item.precio;
  // Check if there's any radio (obligatorio) group — that sets the base price
  const hasRadioBase = item.opciones.some(g => g.tipo === "radio" && g.obligatorio);
  let base = hasRadioBase ? 0 : item.precio; // if no obligatorio radio, use item.precio as base
  let extras = 0;
  (item.opciones||[]).forEach(grupo => {
    const sel = selecciones?.find(s => s.grupoId === grupo.id);
    if (!sel || !sel.choiceIds.length) return;
    if (grupo.tipo === "radio" && grupo.obligatorio) {
      const choice = grupo.choices.find(c => c.id === sel.choiceIds[0]);
      if (choice) base += choice.precio; // obligatorio radio contributes to base (additive for multiple groups)
    } else {
      sel.choiceIds.forEach(cid => {
        const choice = grupo.choices.find(c => c.id === cid);
        if (choice) extras += choice.precio;
      });
    }
  });
  return base + extras;
};

const getCartKey = (item, selecciones) => {
  if (!item.opciones?.length) return item.id;
  return item.id + "|" + (selecciones||[]).map(s=>s.grupoId+":"+s.choiceIds.join(",")).join("|");
};

const seleccionesLabel = (item, selecciones) => {
  if (!selecciones?.length) return "";
  const parts = [];
  item.opciones?.forEach(grupo => {
    const sel = selecciones.find(s=>s.grupoId===grupo.id);
    if (!sel || !sel.choiceIds.length) return;
    const names = sel.choiceIds.map(cid => grupo.choices.find(c=>c.id===cid)?.nombre).filter(Boolean);
    if (names.length) parts.push(names.join(", "));
  });
  return parts.join(" · ");
};

// Igual que seleccionesLabel pero devuelve un array (una línea por grupo) para tickets
const seleccionesLines = (item, selecciones) => {
  if (!selecciones?.length) return [];
  const lines = [];
  item.opciones?.forEach(grupo => {
    const sel = selecciones.find(s=>s.grupoId===grupo.id);
    if (!sel || !sel.choiceIds.length) return;
    const names = sel.choiceIds.map(cid => grupo.choices.find(c=>c.id===cid)?.nombre).filter(Boolean);
    if (names.length) lines.push(names.join(", "));
  });
  return lines;
};


// ── Zonas de envío con polígonos exactos del KMZ ─────────────────────────
const ZONAS_ENVIO = [
  {nombre:"abril", grupo:1, precio:4000, coords:[[-34.7998116,-58.1614657],[-34.8068593,-58.170907],[-34.823419,-58.1510801],[-34.8155271,-58.1418963]]},
  {nombre:"hudson park", grupo:1, precio:4000, coords:[[-34.8068593,-58.170907],[-34.8098711,-58.1747966],[-34.8199479,-58.1626945],[-34.8170589,-58.1587463]]},
  {nombre:"green ville", grupo:1, precio:4000, coords:[[-34.8008054,-58.1596622],[-34.8041884,-58.1554565],[-34.8010521,-58.1512078],[-34.8061969,-58.1442985],[-34.8024264,-58.1387624],[-34.7943211,-58.1509074]]},
  {nombre:"san juan chico", grupo:1, precio:4000, coords:[[-34.8061501,-58.1530532],[-34.8099204,-58.1485471],[-34.8065729,-58.1443414],[-34.8029434,-58.1488046]]},
  {nombre:"acacias", grupo:1, precio:4000, coords:[[-34.7910417,-58.1564877],[-34.79587,-58.1599209],[-34.7963634,-58.1593201],[-34.7924162,-58.1541703]]},
  {nombre:"ombues", grupo:1, precio:4000, coords:[[-34.8003106,-58.1682409],[-34.8016145,-58.1665672],[-34.7954474,-58.1605161],[-34.7946016,-58.1615032]]},
  {nombre:"altos de hudson 1", grupo:1, precio:4000, coords:[[-34.8024691,-58.1709874],[-34.8042663,-58.1688417],[-34.8023987,-58.1665242],[-34.8006719,-58.16867]]},
  {nombre:"altos de hudson 2", grupo:1, precio:4000, coords:[[-34.8043281,-58.173917],[-34.8069709,-58.1772644],[-34.8090498,-58.174904],[-34.8062661,-58.1714279]]},
  {nombre:"hudson chico", grupo:1, precio:4000, coords:[[-34.794787,-58.1483042],[-34.797254,-58.1442701],[-34.7958795,-58.1426822],[-34.7930954,-58.1466305]]},
  {nombre:"la portenia", grupo:1, precio:4000, coords:[[-34.7987832,-58.1615906],[-34.8005452,-58.1599598],[-34.794378,-58.1513767],[-34.7925101,-58.1538658]]},
  {nombre:"pueblo nuevo", grupo:1, precio:4000, coords:[[-34.7897788,-58.1558819],[-34.7947165,-58.1486045],[-34.7930249,-58.1469308],[-34.7956996,-58.1424923],[-34.7971835,-58.1445704],[-34.7984837,-58.1427069],[-34.7935146,-58.1375143],[-34.784492,-58.1512041]]},
  {nombre:"hudson", grupo:1, precio:4000, coords:[[-34.8065668,-58.1774498],[-34.7904618,-58.1574083],[-34.7830955,-58.169725],[-34.7932108,-58.1800247],[-34.7985675,-58.1729008],[-34.8044877,-58.1801964]]},
  {nombre:"platanos", grupo:1, precio:4000, coords:[[-34.783089,-58.1702389],[-34.7817496,-58.1683077],[-34.7780838,-58.1746163],[-34.7720912,-58.182899],[-34.7779076,-58.1873192],[-34.7853448,-58.1863322],[-34.7913717,-58.1787362]]},
  {nombre:"carmencito", grupo:2, precio:5000, coords:[[-34.8149144,-58.1801476],[-34.8195651,-58.1740536],[-34.8153372,-58.168818],[-34.810334,-58.1746544]]},
  {nombre:"barrancas de iraola", grupo:2, precio:5000, coords:[[-34.8224949,-58.1877339],[-34.8159066,-58.1792796],[-34.8149144,-58.1801476],[-34.8209448,-58.1878627]]},
  {nombre:"fincas de iraola 2", grupo:2, precio:5000, coords:[[-34.8248364,-58.1845153],[-34.8183892,-58.1763184],[-34.8159066,-58.1792796],[-34.8227226,-58.187691]]},
  {nombre:"fincas de iraola 1", grupo:2, precio:5000, coords:[[-34.8252944,-58.1838715],[-34.827232,-58.1810391],[-34.8212782,-58.1730998],[-34.8189529,-58.1756318]]},
  {nombre:"fincas de hudson", grupo:2, precio:5000, coords:[[-34.8200803,-58.1634438],[-34.82385,-58.1686366],[-34.8268445,-58.1650746],[-34.8232863,-58.1591523]]},
  {nombre:"maritimo", grupo:2, precio:5000, coords:[[-34.8092835,-58.1751626],[-34.7988883,-58.1879943],[-34.8125956,-58.2044309],[-34.8210162,-58.1905263]]},
  {nombre:"la reserva", grupo:2, precio:5000, coords:[[-34.8009838,-58.1398886],[-34.80486,-58.1343526],[-34.8023933,-58.1327647],[-34.7989398,-58.1378716]]},
  {nombre:"el carmen", grupo:3, precio:6000, coords:[[-34.8275072,-58.1803771],[-34.8294095,-58.1772872],[-34.8197919,-58.163683],[-34.8157754,-58.1683608],[-34.8199328,-58.1739398],[-34.8213068,-58.1723519]]},
  {nombre:"village del parque", grupo:3, precio:6000, coords:[[-34.833909,-58.16998],[-34.8360225,-58.1666326],[-34.8311614,-58.1608819],[-34.8286603,-58.1640148]]},
  {nombre:"barrio san juan", grupo:3, precio:6000, coords:[[-34.8371338,-58.1662905],[-34.8385075,-58.1680929],[-34.8429456,-58.15436],[-34.8387189,-58.1481373],[-34.8347738,-58.1532442],[-34.8394938,-58.161956]]},
  {nombre:"gutierrez", grupo:3, precio:6000, coords:[[-34.8227888,-58.1891603],[-34.8315959,-58.1915206],[-34.8385,-58.1711787],[-34.836457,-58.1670589]]},
  {nombre:"golondrinas", grupo:3, precio:6000, coords:[[-34.7765249,-58.1613324],[-34.7811073,-58.1663106],[-34.7853722,-58.1601737],[-34.7803671,-58.1555818]]},
  {nombre:"puerto nizuk", grupo:3, precio:6000, coords:[[-34.7795211,-58.152406],[-34.7509648,-58.1216357],[-34.7496248,-58.1391452],[-34.7720481,-58.1631349]]},
  {nombre:"magallanes", grupo:3, precio:6000, coords:[[-34.7761815,-58.1467772],[-34.7819975,-58.1391383],[-34.7784374,-58.1349326],[-34.7729031,-58.1430007]]},
  {nombre:"villalobos", grupo:3, precio:6000, coords:[[-34.774954,-58.138949],[-34.7679388,-58.1307093],[-34.7650832,-58.1344429],[-34.7721692,-58.1427256]]},
  {nombre:"gaboto", grupo:3, precio:6000, coords:[[-34.7751303,-58.1385199],[-34.7778093,-58.1345288],[-34.7709706,-58.1266752],[-34.7682209,-58.1304947]]},
  {nombre:"ranelagh", grupo:3, precio:6000, coords:[[-34.8100679,-58.2043894],[-34.7923073,-58.1820734],[-34.7875141,-58.1860216],[-34.7769398,-58.1923731],[-34.7968183,-58.2303102]]},
];

// Point-in-polygon (ray casting)
const puntoDentroDeZona = (lat, lng, coords) => {
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [yi, xi] = coords[i];
    const [yj, xj] = coords[j];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
};

const detectarZona = (lat, lng) => {
  for (const zona of ZONAS_ENVIO) {
    if (puntoDentroDeZona(lat, lng, zona.coords)) return zona;
  }
  return null;
};

/* ══ MAP PICKER ════════════════════════════════════════════════ */
function MapPicker({ onSelect, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [addr, setAddr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Leaflet dynamically
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
    return () => { mapInstanceRef.current?.remove(); };
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = window.L.map(mapRef.current, { zoomControl: true }).setView([-34.7963, -58.1760], 14);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);
    mapInstanceRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 16);
      }, () => {});
    }

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();
      const zona = detectarZona(lat, lng);
      const icon = window.L.divIcon({
        html: `<div style="background:${zona?"#CC1F1F":"#6B7280"};width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
        iconSize: [20, 20], iconAnchor: [10, 20]
      });
      markerRef.current = window.L.marker([lat, lng], { icon }).addTo(map);
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`, {signal: controller.signal});
        clearTimeout(timeout);
        const data = await res.json();
        const a = data.address || {};
        const calle = a.road || a.pedestrian || a.footway || "";
        const numero = a.house_number || "";
        const barrio = a.neighbourhood || a.suburb || a.city_district || a.town || a.city || "";
        setAddr({ calle, numero, barrio, lat, lng, zona, nominatimOk: true });
      } catch(e) {
        // Nominatim failed or timed out — let user fill manually
        setAddr({ calle:"", numero:"", barrio:"", lat, lng, zona, nominatimOk: false });
      }
      setLoading(false);
    });
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",background:"#000"}}>
      {/* Header */}
      <div style={{background:"var(--red)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div className="sh" style={{fontSize:17,color:"#fff"}}>📍 ELEGÍ TU DIRECCIÓN</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.8)"}}>Tocá el mapa donde querés recibir tu pedido</div>
        </div>
        <button className="btn" onClick={onClose} style={{background:"rgba(255,255,255,.2)",borderRadius:10,padding:"7px 14px",color:"#fff",fontSize:13,fontWeight:600}}>✕ Cerrar</button>
      </div>
      {/* Map */}
      <div ref={mapRef} style={{flex:1}}/>
      {/* Bottom panel */}
      <div style={{background:"var(--surface)",padding:"14px 16px",flexShrink:0,boxShadow:"0 -4px 20px rgba(0,0,0,.15)"}}>
        {loading&&<div style={{textAlign:"center",color:"var(--text3)",fontSize:13,padding:"8px 0"}}>🔍 Buscando dirección...</div>}
        {!loading&&!addr&&<div style={{textAlign:"center",color:"var(--text4)",fontSize:13,padding:"8px 0"}}>Tocá un punto en el mapa para seleccionar tu dirección</div>}
        {!loading&&addr&&!addr.nominatimOk&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:12,color:"#92400E"}}>⚠ No pudimos detectar la dirección automáticamente. Completá los campos manualmente después de confirmar.</div>}
        {!loading&&addr&&(
          <>
            <div style={{background:"var(--bg2)",borderRadius:12,padding:"10px 14px",marginBottom:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:2}}>
                {addr.calle}{addr.numero?` ${addr.numero}`:""}
              </div>
              <div style={{fontSize:12,color:"var(--text3)"}}>{addr.barrio}</div>
            </div>
            {addr.zona
              ? <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#16A34A",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>✓ ZONA CON DELIVERY</div>
                    <div style={{fontSize:12,color:"#166534",marginTop:2,textTransform:"capitalize"}}>{addr.zona.nombre} — Grupo {addr.zona.grupo}</div>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,color:"#16A34A",fontFamily:"'Barlow Condensed',sans-serif"}}>+${Number(addr.zona.precio).toLocaleString("es-AR")}</div>
                </div>
              : <div style={{background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#CC1F1F",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>⚠ FUERA DE ZONA DE COBERTURA</div>
                  <div style={{fontSize:12,color:"#991B1B",marginTop:2,marginBottom:10}}>Tu dirección no está dentro de nuestras zonas de delivery.</div>
                  <a href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola! Quiero hacer un pedido pero mi zona no está dentro de la cobertura de envío. Mi dirección es: "+addr.calle+(addr.numero?" "+addr.numero:"")+", "+addr.barrio+". ¿Pueden ayudarme?")}`}
                    target="_blank" rel="noreferrer"
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"10px 0",borderRadius:10,background:"#16A34A",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",textDecoration:"none"}}>
                    💬 Consultar por WhatsApp
                  </a>
                </div>
            }
            <button className="btn" onClick={()=>addr.zona&&onSelect(addr)}
              style={{width:"100%",padding:"14px 0",borderRadius:13,background:addr.zona?"var(--red)":"var(--border)",color:addr.zona?"#fff":"var(--text4)",fontSize:16,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,boxShadow:addr.zona?"0 6px 20px var(--red-glow)":"none",cursor:addr.zona?"pointer":"not-allowed"}}>
              {addr.zona?"✓ USAR ESTA DIRECCIÓN":"Zona sin cobertura"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CustomerView({ menu, cajaStatus, appConfig=CONFIG }) {
  const menuVis = menu.map(c=>({...c,items:c.items.filter(i=>i.disponible!==false&&!i.soloAdmin)})).filter(c=>c.items.length>0);
  // Detect mesa from URL: ?mesa=m5
  const mesaQR = new URLSearchParams(window.location.search).get("mesa") || "";

  const pagoReturn = new URLSearchParams(window.location.search).get("pago") || "";
  const orderReturn = new URLSearchParams(window.location.search).get("order") || "";
  // If returning from MP payment
  const [returnHandled, setReturnHandled] = useState(false);
  useEffect(()=>{
    if (pagoReturn && orderReturn && !returnHandled) {
      setReturnHandled(true);
      setOrderId(orderReturn);
      if (pagoReturn === "ok") {
        setStep("confirm");
      } else if (pagoReturn === "pendiente") {
        setStep("confirm");
      } else {
        setStep("menu");
        alert("El pago no se pudo completar. Podés intentar de nuevo.");
      }
    }
  }, [pagoReturn, orderReturn, returnHandled]);
  const [activeCat,  setActiveCat]  = useState(menuVis[0]?.id);
  const [search,     setSearch]     = useState("");
  const [cart,       setCart]       = useState([]);
  const [step,       setStep]       = useState("menu");
  const [form,       setForm]       = useState({nombre:"",telefono:"",notas:"",tipo:"retiro",calle:"",numero:"",entreCalle:"",piso:"",barrio:"",pago:"efectivo",envio:0,zona_envio:"",horaEntrega:""});
  const [dniFound,   setDniFound]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [orderId,    setOrderId]    = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const tabsRef = useRef(null);
  const sRefs   = useRef({});
  const [modalItem, setModalItem] = useState(null);
  const [showMap,   setShowMap]   = useState(false);
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
  const add = (item, selecciones=null, precioUnitario=null) => {
    const key = getCartKey(item, selecciones);
    const precio = precioUnitario ?? item.precio;
    setCart(p => { const ex=p.find(c=>c.cartKey===key); return ex?p.map(c=>c.cartKey===key?{...c,qty:c.qty+1}:c):[...p,{item,qty:1,selecciones,precioUnitario:precio,cartKey:key,catId:item.catId||""}]; });
  };
  const setQty = (key,q) => setCart(p => q<=0?p.filter(c=>c.cartKey!==key):p.map(c=>c.cartKey===key?{...c,qty:q}:c));
  const getQty = (item) => { if(!item.opciones?.length) return cart.find(c=>c.item.id===item.id&&!c.selecciones?.length)?.qty||0; return 0; };
  const handleAddItem = (item) => { if(item.opciones?.length) { setModalItem(item); } else { add(item); } };
  const total      = cart.reduce((s,c) => s+(c.precioUnitario??c.item.precio)*c.qty, 0);
  const totalConRecargo = form.pago==="tarjeta" ? Math.round(total*(1+appConfig.recargoMP)) : total;
  const count      = cart.reduce((s,c) => s+c.qty, 0);
  const canConfirm = mesaQR ? true : (form.nombre.trim() && form.telefono.trim() && (form.tipo==="retiro"||(form.calle.trim()&&(form.numero.trim()||form.entreCalle.trim())&&form.envio>0&&form.zona_envio)));

  const lookupDni = async (val) => {
    setForm(p=>({...p,telefono:val}));
    if (val.length < 6) { setDniFound(false); return; }
    const {data} = await supabase.from("customers")
      .select("*").or(`dni.eq.${val},telefono.eq.${val}`).limit(1);
    if (data && data.length > 0) {
      const c = data[0];
      setDniFound(true);
      const {calle:pc, nro:pn, entreCalle:pec, barrio:pb} = parseDireccion(c.direccion);
      // Try to detect zone from barrio name
      const barrioLower = (pb||"").toLowerCase();
      const zonaDetectada = pc ? ZONAS_ENVIO.find(z => barrioLower.includes(z.nombre.toLowerCase()) || z.nombre.toLowerCase().includes(barrioLower.split(" ")[0])) : null;
      setForm(p=>({...p,
        nombre:      p.nombre      || c.nombre   || "",
        telefono:    p.telefono    || c.telefono || "",
        calle:       p.calle       || pc  || "",
        numero:      p.numero      || pn  || "",
        entreCalle:  p.entreCalle  || pec || "",
        barrio:      p.barrio      || pb  || "",
        tipo:        pc ? "delivery" : p.tipo,
        envio:       p.envio || (zonaDetectada?.precio||0),
        zona_envio:   p.zona_envio || (zonaDetectada?`Grupo ${zonaDetectada.grupo}`:""),
      }));
    } else {
      setDniFound(false);
    }
  };

  const saveCustomer = async (order) => {
    if (!order.dni && !order.telefono) return;
    const key = `dni.eq.${order.dni||"NADA"},telefono.eq.${order.telefono||"NADA"}`;
    const {data} = await supabase.from("customers").select("id,direccion").or(key).limit(1);
    // Save structured: calle|numero|barrio so it can be parsed reliably
    const direccion = `${order.calle||""}|${order.numero||""}|${order.barrio||""}|${order.entrecalle||""}|${order.piso||""}`;
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
    if (!canConfirm || cart.length === 0) return;
    // Re-check if web is still open/enabled at confirm time
    if (!appConfig.webHabilitada || !isOpen(appConfig)) {
      alert("Lo sentimos, el local ya no está tomando pedidos en este momento.");
      return;
    }
    setLoading(true);
    const {entreCalle, horaEntrega, ...formRest} = form;
    const notasCliente = [horaEntrega?`⏰ ${horaEntrega}`:"", formRest.notas].filter(Boolean).join(" | ");
    formRest.notas = notasCliente;
    // Get current mesa session number if ordering from a mesa
    let mesaSession = 1;
    if (mesaQR) {
      const {data:mesaData} = await supabase.from("mesas").select("session_num").eq("id",mesaQR).maybeSingle();
      mesaSession = mesaData?.session_num || 1;
    }
    const envioFinal = form.tipo==="delivery" ? (form.envio||0) : 0;
    const order = { id:genId(), ...formRest, entrecalle:entreCalle||"", items:cart, subtotal:total, total:totalConRecargo+(envioFinal), envio:envioFinal, source:"customer", status: (form.pago==="tarjeta"||form.pago==="transferencia") ? "pendiente_pago" : "nuevo", created_at:Date.now(), mesa_id: mesaQR, mesa_session: mesaSession };
    // Esperar confirmación de Supabase antes de mostrar éxito
    let error, retries = 0;
    while (retries < 3) {
      const result = await supabase.from("orders").insert(order);
      error = result.error;
      if (!error) break;
      retries++;
      if (retries < 3) await new Promise(r => setTimeout(r, 1000 * retries));
    }
    if (error) {
      console.error("Error guardando pedido:", error);
      setLoading(false);
      alert("No pudimos enviar tu pedido. Verificá tu conexión a internet e intentá de nuevo. Si el problema persiste, contactanos por WhatsApp.");
      return;
    }
    setOrderId(order.id);
    setOrderTotal(order.total);
    setCart([]);
    // Redirect to MP Checkout Pro for transferencia
    if (form.pago === "tarjeta") {
      setStep("mp_loading");
      try {
        const res = await fetch("https://dinylgezchbrojrszalt.supabase.co/functions/v1/mp-preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbnlsZ2V6Y2hicm9qcnN6YWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDYzODMsImV4cCI6MjA4OTUyMjM4M30.Su_sQBfU88BZpCQcrLX2SVpE22d9BMm4wWdJsAUzJpo",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbnlsZ2V6Y2hicm9qcnN6YWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDYzODMsImV4cCI6MjA4OTUyMjM4M30.Su_sQBfU88BZpCQcrLX2SVpE22d9BMm4wWdJsAUzJpo"
          },
          body: JSON.stringify({ orderId: order.id, items: cart, total: totalConRecargo, payer: {nombre: form.nombre, telefono: form.telefono} })
        });
        const data = await res.json();
        if (data.init_point) {
          window.location.href = data.init_point;
          return;
        }
      } catch(e) {
        console.error("MP error:", e);
      }
      // Fallback to manual transfer screen if MP fails
      setStep("transferencia");
      return;
    }
    setStep(form.pago === "transferencia" ? "transferencia" : "confirm");
    setLoading(false);
    saveCustomer(order);
  };

  const PAGOS_BASE = [
    {v:"efectivo",      l:"💵 Efectivo",      desc:"Pagás al recibir / retirar"},
    {v:"transferencia", l:"📲 Transferencia",  desc:"Alias bancario o MP"},
  ];
  if (appConfig.tarjetaHabilitada) PAGOS_BASE.push({v:"tarjeta", l:"💳 Tarjeta / MP", desc:`+${(appConfig.recargoMP*100).toFixed(2)}% recargo`});
  const PAGOS = PAGOS_BASE;

  // Caja cerrada — mostrar pantalla de local cerrado
  if (!appConfig.webHabilitada || !isOpen(appConfig)) return (
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
        <span style={{fontSize:13,color:"var(--text3)"}}>{appConfig.horario}</span>
      </div>
    </div>
  );

  if (step === "mp_loading") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",background:"var(--bg2)"}}>
      <div style={{fontSize:48,marginBottom:16}}>⏳</div>
      <div className="sh" style={{fontSize:22,color:"var(--text)",marginBottom:8}}>Preparando pago...</div>
      <div style={{color:"var(--text3)",fontSize:14}}>Te redirigimos a Mercado Pago</div>
    </div>
  );

  if (step === "transferencia") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",background:"var(--bg2)"}}>
      <div className="slide-up" style={{width:"100%",maxWidth:400}}>
        <div style={{fontSize:48,marginBottom:12}}>📲</div>
        <div className="sh" style={{fontSize:28,color:"var(--text)",marginBottom:4}}>TRANSFERENCIA</div>
        <div style={{color:"var(--text3)",fontSize:14,marginBottom:28}}>Realizá la transferencia por el monto exacto</div>

        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:24,marginBottom:16,textAlign:"left"}}>
          <div style={{marginBottom:16,padding:"14px 16px",background:"#F0FDF4",borderRadius:12,border:"1px solid #BBF7D0",textAlign:"center"}}>
            <div style={{fontSize:11,color:"#16A34A",fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:4}}>TOTAL A PAGAR</div>
            <div className="sh" style={{fontSize:36,color:"#16A34A"}}>{fmt(orderTotal)}</div>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:"var(--text4)",fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:6}}>BANCO — ALIAS</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:12,padding:"12px 16px",border:"1px solid var(--border)"}}>
              <span className="sh" style={{fontSize:18,color:"var(--text)",letterSpacing:1}}>{appConfig.aliasBanco}</span>
              <button className="btn" onClick={()=>{navigator.clipboard?.writeText(appConfig.aliasBanco);}} style={{background:"var(--red-light)",border:"1px solid var(--red-border)",borderRadius:8,padding:"4px 10px",color:"var(--red)",fontSize:11,fontWeight:600}}>Copiar</button>
            </div>
            <div style={{fontSize:11,color:"var(--text4)",marginTop:4,paddingLeft:4}}>Titular: {appConfig.titular}</div>
          </div>

          <div style={{marginBottom:4}}>
            <div style={{fontSize:10,color:"var(--text4)",fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:6}}>MERCADO PAGO — ALIAS</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:12,padding:"12px 16px",border:"1px solid var(--border)"}}>
              <span className="sh" style={{fontSize:18,color:"var(--text)",letterSpacing:1}}>{appConfig.aliasMP}</span>
              <button className="btn" onClick={()=>{navigator.clipboard?.writeText(appConfig.aliasMP);}} style={{background:"var(--red-light)",border:"1px solid var(--red-border)",borderRadius:8,padding:"4px 10px",color:"var(--red)",fontSize:11,fontWeight:600}}>Copiar</button>
            </div>
            <div style={{fontSize:11,color:"var(--text4)",marginTop:4,paddingLeft:4}}>Titular: {appConfig.titular}</div>
          </div>
        </div>

        <div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:12,padding:"12px 16px",marginBottom:24,fontSize:13,color:"#92400E"}}>
          ⚠️ Una vez realizada la transferencia tu pedido será confirmado por el local
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button className="btn" onClick={()=>setStep("confirm")}
            style={{padding:"14px 0",borderRadius:40,background:"var(--red)",color:"#fff",fontSize:16,fontWeight:700,boxShadow:"0 8px 24px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
            YA TRANSFERÍ ✓
          </button>
          <button className="btn" onClick={()=>setStep("checkout")}
            style={{padding:"10px 0",borderRadius:40,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:14,fontWeight:600}}>
            ← Volver
          </button>
        </div>
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
    <div className="cv-checkout-root" style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"var(--bg2)"}}>
      <div style={{position:"sticky",top:0,background:"rgba(255,255,255,.97)",backdropFilter:"blur(14px)",borderBottom:"1px solid var(--border)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,zIndex:10}}>
        <button className="btn" onClick={()=>setStep("menu")} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"7px 16px",color:"var(--text2)",fontSize:14,fontWeight:600}}>← Volver</button>
        <span className="sh" style={{fontSize:20,color:"var(--text)"}}>Confirmá tu pedido</span>
      </div>
      <div style={{padding:16,paddingBottom:32}}>
        <Card>
          <Label>TU PEDIDO</Label>
          {cart.map(c=>(
            <div key={c.cartKey} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{flex:1,paddingRight:12}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{c.item.nombre}</div>
                {c.selecciones&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{seleccionesLabel(c.item,c.selecciones)}</div>}
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{fmt(c.precioUnitario??c.item.precio)} c/u</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button className="btn" onClick={()=>setQty(c.cartKey,c.qty-1)} style={{width:30,height:30,borderRadius:8,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontSize:15,fontWeight:800,minWidth:22,textAlign:"center",color:"var(--red)"}}>{c.qty}</span>
                <button className="btn" onClick={()=>add(c.item,c.selecciones,c.precioUnitario)} style={{width:30,height:30,borderRadius:8,background:"var(--red)",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                <span style={{fontSize:14,fontWeight:700,color:"var(--red)",minWidth:72,textAlign:"right"}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
              </div>
            </div>
          ))}
          {form.tipo==="delivery"&&form.envio>0&&(
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:14,color:"var(--text3)"}}>
              <span>🛵 Envío {form.zona_envio?`(${form.zona_envio})`:""}</span><span style={{fontWeight:600}}>{fmt(form.envio)}</span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:20,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:"var(--text)",borderTop:"1px solid var(--border)",marginTop:4}}>
            <span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(totalConRecargo+(form.tipo==="delivery"?form.envio:0))}</span>
          </div>
        </Card>
        {/* Si viene de mesa QR, mostrar banner de mesa en lugar de formulario de datos */}
        {mesaQR ? (
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"4px 0"}}>
              <span style={{fontSize:28}}>🪑</span>
              <div>
                <div className="sh" style={{fontSize:18,color:"var(--text)"}}>
                  Mesa {mesaQR.replace("mv","Vereda ").replace("m","")}
                </div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Tu pedido se asignará a esta mesa</div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <Label>TUS DATOS</Label>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>TELÉFONO *</div>
                <div style={{position:"relative"}}>
                  <input value={form.telefono} onChange={e=>lookupDni(e.target.value)} placeholder="Tu teléfono"
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:`1px solid ${dniFound?"#16A34A":"var(--border)"}`,borderRadius:10,fontSize:14,transition:"border .2s"}}/>
                  {dniFound&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#16A34A"}}>✓</span>}
                </div>
              </div>
              {dniFound&&<div style={{fontSize:11,color:"#16A34A",marginBottom:10,fontWeight:600}}>✓ Cliente encontrado — datos completados automáticamente</div>}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NOMBRE *</div>
                <input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="¿Cómo te llamás?"
                  style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14}}/>
              </div>
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
              {showMap&&<MapPicker onClose={()=>setShowMap(false)} onSelect={a=>{setForm(p=>({...p,calle:a.calle||p.calle,numero:a.numero||p.numero,barrio:a.barrio||p.barrio,envio:a.zona?.precio||0,zona_envio:a.zona?`Grupo ${a.zona.grupo}`:""}));setShowMap(false);}}/>}
              {/* Si no eligió dirección aún, mostrar solo el botón del mapa */}
              {!form.zona_envio?(
                <div style={{textAlign:"center",padding:"8px 0 16px"}}>
                  <div style={{fontSize:13,color:"var(--text3)",marginBottom:14}}>Para hacer un pedido con delivery tenés que indicar tu dirección en el mapa</div>
                  <button className="btn" onClick={()=>setShowMap(true)}
                    style={{width:"100%",padding:"16px 0",borderRadius:13,background:"var(--red)",color:"#fff",fontSize:16,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,boxShadow:"0 6px 20px var(--red-glow)",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                    📍 ELEGIR MI DIRECCIÓN EN EL MAPA
                  </button>
                </div>
              ):(
                <>
                  {/* Zona detectada */}
                  {form.envio>0
                    ?<div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"9px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:"#16A34A",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>✓ ZONA CON COBERTURA</div>
                        <div style={{fontSize:12,color:"#166534",marginTop:1}}>{form.zona_envio} · Envío: {fmt(form.envio)}</div>
                      </div>
                      <button className="btn" onClick={()=>setShowMap(true)} style={{fontSize:11,color:"#16A34A",background:"transparent",textDecoration:"underline",fontWeight:600}}>Cambiar</button>
                    </div>
                    :<div style={{background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:"#CC1F1F",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>⚠ FUERA DE ZONA</div>
                          <div style={{fontSize:12,color:"#991B1B",marginTop:1}}>Tu dirección no tiene cobertura</div>
                        </div>
                        <button className="btn" onClick={()=>setShowMap(true)} style={{fontSize:11,color:"#CC1F1F",background:"transparent",textDecoration:"underline",fontWeight:600}}>Cambiar</button>
                      </div>
                      <a href={`https://wa.me/${appConfig.whatsapp}?text=${encodeURIComponent("Hola! Quiero hacer un pedido pero mi zona no está dentro de la cobertura de envío. Mi dirección es: "+form.calle+(form.numero?" "+form.numero:"")+", "+form.barrio+". ¿Pueden ayudarme?")}`}
                        target="_blank" rel="noreferrer"
                        style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"9px 0",borderRadius:9,background:"#16A34A",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",textDecoration:"none"}}>
                        💬 Consultar por WhatsApp
                      </a>
                    </div>
                  }
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:2}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Calle *</div>
                  <input value={form.calle} onChange={e=>setForm(p=>({...p,calle:e.target.value}))} placeholder="Ej: Av. San Martín"
                    style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:`1px solid ${form.calle.trim()?"var(--red-border)":"var(--border)"}`,borderRadius:10,fontSize:14}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Número / Lote *</div>
                  <input value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))} placeholder="Nro / Lote"
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
              </>
              )}
            </div>
          )}
          {form.tipo==="retiro"&&<div style={{marginTop:8,background:"var(--bg2)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border)",fontSize:12,color:"var(--text3)"}}>📍 Retirás en <strong style={{color:"var(--text2)"}}>Hudson Plaza Comercial, Berazategui</strong></div>}
            </Card>
          </>
        )}
        {/* Método de pago — solo para delivery/retiro */}
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
          <div style={{marginTop:12,fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>HORA DE ENTREGA / RETIRO</div>
          <select value={form.horaEntrega} onChange={e=>setForm(p=>({...p,horaEntrega:e.target.value}))}
            style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,marginBottom:12,color:"var(--text)"}}>
            <option value="">Lo antes posible</option>
            {(()=>{const s=[];let h=appConfig.abreH,m=appConfig.abreM;while(h<appConfig.cierraH||(h===appConfig.cierraH&&m<=appConfig.cierraM)){s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);m+=30;if(m>=60){h++;m-=60;}}return s;})().map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NOTAS ADICIONALES (opcional)</div>
          <textarea value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} placeholder="Alergias, aclaraciones, referencias para llegar..." rows={3}
            style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,resize:"none",lineHeight:1.6}}/>
        </Card>
        <button className="btn" onClick={placeOrder} disabled={!canConfirm||loading}
          style={{width:"100%",padding:"16px 0",borderRadius:14,fontSize:18,fontWeight:800,background:canConfirm?"var(--red)":"var(--border)",color:canConfirm?"#fff":"var(--text4)",boxShadow:canConfirm?"0 8px 24px var(--red-glow)":"none",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
          {loading?"ENVIANDO...":`CONFIRMAR PEDIDO · ${fmt(totalConRecargo+(form.tipo==="delivery"?(form.envio||0):0))}`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="cv-root" style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"var(--bg2)"}}>
      <div className="cv-menu-panel">
      <div style={{background:"var(--red)",padding:"18px 18px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src={LOGO_SRC} alt="Shako Sushi" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.4)",flexShrink:0}}/>
            <div>
              <div className="sh" style={{fontSize:26,color:"#fff",lineHeight:1,letterSpacing:1}}>SHAKO SUSHI</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:3}}>{mesaQR ? `🪑 Mesa ${mesaQR.replace("m","").replace("v","Vereda ")}` : appConfig.ubicacion}</div>
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
          const open=isOpen(appConfig);
          return(
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:open?"#4ADE80":"#FF4757",boxShadow:open?"0 0 6px #4ADE80":"0 0 6px #FF4757"}}/>
              <span style={{fontSize:12,color:"rgba(255,255,255,.9)",fontWeight:600}}>{open?"Abierto ahora":"Cerrado"}</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>·</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{appConfig.horario}</span>
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

      {(()=>{
          const promoList = (appConfig.promociones||[]);
          if(!promoList.length) return null;
          const promoItems = promoList.map(p=>{
            const item = menu.flatMap(c=>c.items).find(i=>i.id===p.itemId&&i.disponible!==false&&!i.soloAdmin);
            if (!item) return null;
            // Build selecciones if a variant was chosen
            let selecciones = null;
            let precioVariante = null;
            if (p.varianteId) {
              const grupoOblig = item.opciones?.find(g=>g.tipo==="radio"&&g.obligatorio);
              if (grupoOblig) {
                const choice = grupoOblig.choices.find(ch=>ch.id===p.varianteId);
                if (choice) {
                  selecciones = item.opciones.map(g=>({grupoId:g.id,choiceIds:g.id===grupoOblig.id?[choice.id]:[]}));
                  precioVariante = choice.precio;
                }
              }
            }
            return {item, p, selecciones, precioVariante};
          }).filter(Boolean);
          if(!promoItems.length) return null;
          return(
            <div style={{padding:"12px 14px 0"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:16}}>🔥</span>
                <span className="sh" style={{fontSize:16,color:"var(--text)",letterSpacing:.5}}>PROMOCIONES</span>
              </div>
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                {promoItems.map(({item,p,selecciones,precioVariante})=>{
                  const precioBase = precioVariante || item.precio;
                  const precioMostrar = p.precioPromo || precioBase;
                  const promoCartKey = getCartKey(item, selecciones);
                  const promoEntry = cart.find(c=>c.cartKey===promoCartKey);
                  const qty = promoEntry?.qty || 0;
                  const handlePromoAdd = () => {
                    if(selecciones) {
                      add(item, selecciones, precioMostrar);
                    } else if(item.opciones?.length) {
                      setModalItem(item);
                    } else {
                      add(item, null, precioMostrar);
                    }
                  };
                  return(
                    <div key={item.id} style={{flexShrink:0,width:150,background:"var(--surface)",border:"2px solid #FDE68A",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(245,158,11,.15)"}}>
                      {item.imagen&&<div style={{height:90,overflow:"hidden"}}><img src={item.imagen} alt={item.nombre} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
                      <div style={{padding:"10px 10px 8px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text)",lineHeight:1.3,marginBottom:2}}>
                          {item.nombre}
                          {selecciones&&p.varianteId&&(()=>{const g=item.opciones?.find(gr=>gr.tipo==="radio"&&gr.obligatorio);const ch=g?.choices?.find(c=>c.id===p.varianteId);return ch?<div style={{fontSize:10,color:"var(--text3)",fontWeight:400}}>{ch.nombre}</div>:null;})()}
                        </div>
                        {p.etiqueta&&<div style={{fontSize:10,fontWeight:700,color:"#D97706",marginBottom:4}}>{p.etiqueta}</div>}
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                          {p.precioPromo&&p.precioPromo<precioBase&&<span style={{fontSize:11,color:"var(--text4)",textDecoration:"line-through"}}>{fmt(precioBase)}</span>}
                          <span className="sh" style={{fontSize:14,color:"#D97706"}}>{fmt(precioMostrar)}</span>
                        </div>
                        {qty===0
                          ?<button className="btn" onClick={handlePromoAdd} style={{width:"100%",padding:"7px 0",borderRadius:8,background:"#FEF3C7",border:"1px solid #FDE68A",color:"#D97706",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{(!selecciones&&item.opciones?.some(g=>g.obligatorio))?"Ver opciones":"+"}</button>
                          :<div style={{display:"flex",alignItems:"center",gap:6}}>
                            <button className="btn" onClick={()=>setQty(promoCartKey,qty-1)} style={{width:26,height:26,borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                            <span style={{fontSize:14,fontWeight:800,minWidth:16,textAlign:"center",color:"#D97706"}}>{qty}</span>
                            <button className="btn" onClick={handlePromoAdd} style={{width:26,height:26,borderRadius:7,background:"#D97706",color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                          </div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      {menuFiltered.map(cat=>(
        <div key={cat.id} ref={el=>{if(el)sRefs.current[cat.id]=el;}} data-cat={cat.id}>
          <div style={{padding:"20px 18px 8px"}}>
            <div className="sh" style={{fontSize:22,color:"var(--text)"}}>{cat.nombre}</div>
            {cat.desc&&<div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{cat.desc}</div>}
          </div>
          {cat.items.map(item=>{
            const itemConCat = {...item, catId:cat.id};
            const qty=getQty(itemConCat);
            return(
              <div key={item.id} style={{margin:"0 14px 8px",background:"var(--surface)",border:`2px solid ${qty>0?"var(--red)":"var(--border)"}`,borderRadius:14,overflow:"hidden",display:"flex",transition:"border .2s",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                {item.imagen&&<div style={{width:90,minWidth:90,overflow:"hidden"}}><img src={item.imagen} alt={item.nombre} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.parentNode.style.display="none";}}/></div>}
                <div style={{flex:1,padding:"13px 14px",display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,lineHeight:1.35,color:"var(--text)"}}>{item.nombre}</div>
                    {item.desc&&<div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5,marginTop:3}}>{item.desc}</div>}
                    <div className="sh" style={{fontSize:18,color:"var(--red)",marginTop:6}}>{item.opciones?.length?"desde ":""}{fmt(item.precio)}</div>
                  </div>
                  {qty===0
                    ?<button className="btn" onClick={()=>handleAddItem(itemConCat)} style={{width:40,height:40,borderRadius:10,background:"var(--red-light)",border:"2px solid var(--red-border)",color:"var(--red)",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{item.opciones?.length?"›":"+"}</button>
                    :<div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <button className="btn" onClick={()=>setQty(item.id,qty-1)} style={{width:32,height:32,borderRadius:9,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                      <span style={{fontSize:17,fontWeight:900,minWidth:22,textAlign:"center",color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}>{qty}</span>
                      <button className="btn" onClick={()=>handleAddItem(itemConCat)} style={{width:32,height:32,borderRadius:9,background:"var(--red)",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    </div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>{/* end cv-menu-panel */}
      <div className="cv-cart-panel">
        <div className="sh" style={{fontSize:20,color:"var(--text)",paddingBottom:16,marginBottom:16,borderBottom:"2px solid var(--border)"}}>🛒 TU PEDIDO</div>
        {count===0?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:12,opacity:.5}}>
            <span style={{fontSize:44}}>🍱</span>
            <span style={{fontSize:14,color:"var(--text3)",textAlign:"center"}}>Agregá productos<br/>para comenzar</span>
          </div>
        ):(
          <>
            <div style={{flex:1,overflowY:"auto",marginBottom:16}}>
              {cart.map(c=>(
                <div key={c.cartKey} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{flex:1,paddingRight:10}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)",lineHeight:1.35}}>{c.item.nombre}</div>
                    {c.selecciones&&<div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{seleccionesLabel(c.item,c.selecciones)}</div>}
                    <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{fmt(c.precioUnitario??c.item.precio)} c/u</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <button className="btn" onClick={()=>setQty(c.cartKey,c.qty-1)} style={{width:26,height:26,borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    <span style={{fontSize:14,fontWeight:800,minWidth:18,textAlign:"center",color:"var(--red)"}}>{c.qty}</span>
                    <button className="btn" onClick={()=>add(c.item,c.selecciones,c.precioUnitario)} style={{width:26,height:26,borderRadius:7,background:"var(--red)",color:"#fff",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    <span style={{fontSize:13,fontWeight:700,color:"var(--red)",minWidth:64,textAlign:"right"}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{borderTop:"2px solid var(--border)",paddingTop:16,marginTop:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span className="sh" style={{fontSize:20,color:"var(--text)"}}>TOTAL</span>
                <span className="sh" style={{fontSize:22,color:"var(--red)"}}>{fmt(total)}</span>
              </div>
              <button className="btn" onClick={()=>setStep("checkout")}
                style={{width:"100%",padding:"15px 20px",borderRadius:14,background:"var(--red)",color:"#fff",fontSize:17,fontWeight:800,boxShadow:"0 8px 24px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{background:"rgba(255,255,255,.25)",borderRadius:20,padding:"2px 10px",fontSize:13}}>{count}</span>
                <span>CONFIRMAR PEDIDO</span>
                <span>{fmt(total)}</span>
              </button>
            </div>
          </>
        )}
      </div>
      {count>0&&(
        <div className="cv-bottom-cart" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"10px 14px",background:"rgba(255,255,255,.97)",backdropFilter:"blur(18px)",borderTop:"1px solid var(--border)",zIndex:20}}>
          <button className="btn" onClick={()=>setStep("checkout")}
            style={{width:"100%",padding:"14px 20px",borderRadius:14,background:"var(--red)",color:"#fff",fontSize:17,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 6px 20px var(--red-glow)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
            <span style={{background:"rgba(255,255,255,.25)",borderRadius:20,padding:"3px 11px",fontSize:14}}>{count}</span>
            <span>VER PEDIDO</span><span>{fmt(total)}</span>
          </button>
        </div>
      )}
      {modalItem&&<ItemModal item={modalItem} onClose={()=>setModalItem(null)} onConfirm={(sel,precio,qty=1)=>{for(let i=0;i<qty;i++)add(modalItem,sel,precio);setModalItem(null);}}/>}
    </div>
  );
}


/* ══ ITEM MODAL ════════════════════════════════════════════════ */
function ItemModal({ item, onClose, onConfirm }) {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;
  const [selecciones, setSelecciones] = useState(
    (item.opciones||[]).map(g => ({grupoId:g.id, choiceIds:[]}))
  );
  const [qty, setQty] = useState(1);

  const toggle = (grupoId, choiceId, tipo) => {
    setSelecciones(prev => prev.map(s => {
      if (s.grupoId !== grupoId) return s;
      if (tipo === "radio") return {...s, choiceIds:[choiceId]};
      const has = s.choiceIds.includes(choiceId);
      return {...s, choiceIds: has ? s.choiceIds.filter(c=>c!==choiceId) : [...s.choiceIds, choiceId]};
    }));
  };

  const precioActual = calcOpcionesPrice(item, selecciones);
  const canAdd = (item.opciones||[]).every(g => {
    if (!g.obligatorio) return true;
    const sel = selecciones.find(s=>s.grupoId===g.id);
    return sel && sel.choiceIds.length > 0;
  });

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,.55)"}} onClick={onClose}>
      <div className="slide-up" style={{background:"var(--surface)",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px 12px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:2}}>{item.nombre}</div>
            {item.desc&&<div style={{fontSize:12,color:"var(--text3)",lineHeight:1.4}}>{item.desc}</div>}
          </div>
          <button className="btn" onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12}}>×</button>
        </div>
        {/* Imagen si tiene */}
        {item.imagen&&<div style={{width:"100%",height:180,overflow:"hidden",flexShrink:0}}><img src={item.imagen} alt={item.nombre} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
        {/* Opciones */}
        <div style={{overflowY:"auto",flex:1,padding:"0 0 8px"}}>
          {(item.opciones||[]).map(grupo => (
            <div key={grupo.id} style={{borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 10px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{grupo.nombre}</div>
                {grupo.obligatorio&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:"var(--red)",padding:"2px 8px",borderRadius:20}}>Obligatorio</span>}
              </div>
              {grupo.choices.map(choice => {
                const sel = selecciones.find(s=>s.grupoId===grupo.id);
                const isSelected = sel?.choiceIds.includes(choice.id);
                const noDisp = choice.disponible === false;
                return (
                  <div key={choice.id} onClick={()=>!noDisp&&toggle(grupo.id,choice.id,grupo.tipo)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 18px",borderTop:"1px solid var(--border)",cursor:noDisp?"not-allowed":"pointer",opacity:noDisp?.4:1,background:isSelected?"var(--red-light)":"transparent",transition:"background .15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:20,height:20,borderRadius:grupo.tipo==="radio"?"50%":"5px",border:`2px solid ${isSelected?"var(--red)":"var(--border2)"}`,background:isSelected?"var(--red)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                        {isSelected&&<div style={{width:8,height:8,borderRadius:grupo.tipo==="radio"?"50%":"2px",background:"#fff"}}/>}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:isSelected?600:400,color:noDisp?"var(--text4)":"var(--text)"}}>{choice.nombre}</div>
                        {noDisp&&<div style={{fontSize:11,color:"var(--text4)"}}>No disponible</div>}
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:isSelected?"var(--red)":"var(--text3)",flexShrink:0,marginLeft:8}}>
                      {choice.precio>0?(grupo.tipo==="checkbox"?`+ ${fmt(choice.precio)}`:fmt(choice.precio)):"Incluido"}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"12px 18px",borderTop:"1px solid var(--border)",flexShrink:0}}>
          {!(item.opciones||[]).some(g=>g.obligatorio)&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:12}}>
              <button className="btn" onClick={()=>setQty(q=>Math.max(1,q-1))}
                style={{width:36,height:36,borderRadius:10,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:20,fontWeight:800,minWidth:28,textAlign:"center",color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}>{qty}</span>
              <button className="btn" onClick={()=>setQty(q=>q+1)}
                style={{width:36,height:36,borderRadius:10,background:"var(--red)",color:"#fff",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          )}
          <button className="btn" onClick={()=>canAdd&&onConfirm(selecciones,precioActual,qty)}
            style={{width:"100%",padding:"14px 0",borderRadius:14,background:canAdd?"var(--red)":"var(--border)",color:canAdd?"#fff":"var(--text4)",fontSize:16,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,transition:"all .2s",cursor:canAdd?"pointer":"not-allowed"}}>
            {canAdd?`AGREGAR ${qty>1?`${qty}x `:""} · ${fmt(precioActual*qty)}`:"Completá las opciones obligatorias"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ══ TICKET BTN (con descuento) ══════════════════════════════ */
function TicketBtn({ order }) {
  const [open,      setOpen]      = useState(false);
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;
  // Auto-calculate discount: compare each item's precioUnitario vs its base price
  const autoDescuento = (order.items||[]).reduce((s,c) => {
    if (!c.item) return s;
    const precioUnitario = c.precioUnitario ?? (c.selecciones?.length ? calcOpcionesPrice(c.item, c.selecciones) : c.item.precio);
    const precioBase = c.selecciones?.length ? calcOpcionesPrice(c.item, c.selecciones) : c.item.precio;
    const diff = precioBase - precioUnitario;
    return diff > 0 ? s + diff * c.qty : s;
  }, 0);
  const [descuento, setDescuento] = useState("");
  const desc = Number(descuento)||0;
  const totalDesc = autoDescuento + desc;
  const total = Math.max(0, Number(order.total) - desc - autoDescuento);

  if (!open) return (
    <button className="btn" onClick={()=>setOpen(true)}
      style={{padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:13,fontWeight:600}}>
      🖨️ Ticket
    </button>
  );

  return (
    <div className="slide-up" style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"var(--surface)",borderRadius:20,padding:24,width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div className="sh" style={{fontSize:18,color:"var(--text)",marginBottom:4}}>🖨️ IMPRIMIR TICKET</div>
        <div style={{fontSize:12,color:"var(--text3)",marginBottom:20}}>Aplicá un descuento o adelanto antes de imprimir</div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>DESCUENTO / ADELANTO ($)</div>
          <input type="number" min="0" value={descuento} onChange={e=>setDescuento(e.target.value)} placeholder="0"
            style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:18,fontWeight:700,color:"#16A34A",fontFamily:"'Barlow Condensed',sans-serif"}}/>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--text3)",marginBottom:4}}>
            <span>Subtotal</span><span>{fmt(order.total)}</span>
          </div>
          {autoDescuento>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#D97706",marginBottom:4}}>
            <span>Descuento promo</span><span>- {fmt(autoDescuento)}</span>
          </div>}
          {desc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#16A34A",marginBottom:4}}>
            <span>Desc/Adelanto</span><span>- {fmt(desc)}</span>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--text3)",marginBottom:6}}>
            <span>Envío</span><span>{fmt(order.envio||0)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:18,fontFamily:"'Barlow Condensed',sans-serif",borderTop:"1px solid var(--border)",paddingTop:8}}>
            <span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(Math.max(0,Number(order.total)-totalDesc+(Number(order.envio)||0)))}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={()=>setOpen(false)}
            style={{flex:1,padding:"12px 0",borderRadius:12,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:14,fontWeight:600}}>
            Cancelar
          </button>
          <button className="btn" onClick={()=>{printTicket(order,desc,autoDescuento);setOpen(false);setDescuento("");}}
            style={{flex:2,padding:"12px 0",borderRadius:12,background:"var(--red)",color:"#fff",fontSize:14,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",boxShadow:"0 4px 14px var(--red-glow)"}}>
            🖨️ IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  );
}

const calcAutoDescuento = (order) => (order.items||[]).reduce((s,c) => {
  if (!c.item) return s;
  const precioUnitario = c.precioUnitario ?? (c.selecciones?.length ? calcOpcionesPrice(c.item, c.selecciones) : c.item.precio);
  const precioBase = c.selecciones?.length ? calcOpcionesPrice(c.item, c.selecciones) : c.item.precio;
  const diff = precioBase - precioUnitario;
  return diff > 0 ? s + diff * c.qty : s;
}, 0);


// ── Categorías por área ──────────────────────────────────────────────────
const CAT_FRIA     = ["rolls","nigiri","combinados","temaki","ceviche","vegetarianos"];
const CAT_CALIENTE = ["teppan","wok","aperitivos"];

// ── ESC/POS ────────────────────────────────────────────────────────────────
const PRINTER_NAME = "CAJA";
const _E = '\x1B', _G = '\x1D';
const EP = {
  INIT:   _E+'@',
  CUT:    _G+'V\x42\x00',
  FEED:   n => _E+'d'+String.fromCharCode(n),
  LEFT:   _E+'a\x00',
  CENTER: _E+'a\x01',
  BOLD1:  _E+'E\x01',
  BOLD0:  _E+'E\x00',
  NORM:   _E+'!\x00',
  TALL:   _E+'!\x10',
  BIG:    _E+'!\x30',
  LF:     '\x0A',
};
const PW = 32;
const noAcc = s => String(s)
  .replace(/[áàäâ]/gi,'a').replace(/[éèëê]/gi,'e')
  .replace(/[íìïî]/gi,'i').replace(/[óòöô]/gi,'o')
  .replace(/[úùüû]/gi,'u').replace(/[ñ]/gi,'n');
const epLine = (ch='-') => ch.repeat(PW)+EP.LF;
const epCols = (l,r,w=PW) => { const rs=String(r); const ls=noAcc(l).substring(0,w-rs.length); return ls.padEnd(w-rs.length)+rs+EP.LF; };
const epCtr  = t => { const s=noAcc(t).substring(0,PW); return ' '.repeat(Math.max(0,Math.floor((PW-s.length)/2)))+s+EP.LF; };

const buildTicketEscPos = (order, descuento=0, autoDescuento=0) => {
  const fmt = n => '$'+Number(n).toLocaleString('es-AR');
  const fecha = new Date(Number(order.created_at)).toLocaleDateString('es-AR',{day:'numeric',month:'numeric',year:'numeric'});
  const hora  = new Date(Number(order.created_at)).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false});
  const dir = [order.calle,order.numero,order.entrecalle?'e/'+order.entrecalle:'',order.piso,order.barrio].filter(Boolean).join(' ');
  let t = EP.INIT+EP.CENTER+EP.BOLD1+EP.TALL;
  t += 'SHAKO SUSHI'+EP.LF;
  t += EP.NORM+EP.BOLD0;
  t += epCtr('Hudson Plaza Comercial, Berazategui');
  t += epCtr('<< Aceptacion de Consumo >>');
  t += epCtr('<<< No valido como comp. fiscal >>>');
  t += EP.LEFT+epLine();
  t += noAcc('Fecha: '+fecha+' - '+hora)+EP.LF;
  t += 'Pedido: '+order.id.slice(-5).toUpperCase()+EP.LF;
  t += epLine();
  t += noAcc('Cliente: '+(order.nombre||'').toUpperCase())+EP.LF;
  if (dir) t += noAcc('Dir: '+dir.toUpperCase()).substring(0,PW)+EP.LF;
  if (order.telefono) t += 'TE: '+order.telefono+EP.LF;
  if (order.pago)     t += 'Pago: '+order.pago.toUpperCase()+EP.LF;
  if (order.repartidor) t += noAcc('Rep.: '+order.repartidor)+EP.LF;
  if (order.notas)    t += noAcc('Nota: '+order.notas).substring(0,PW)+EP.LF;
  t += epLine();
  t += epCols('DESCRIPCION','IMPORTE');
  t += epLine();
  (order.items||[]).forEach(c => {
    const precio = c.precioUnitario ?? c.item.precio;
    const nombre = noAcc(c.item.nombre||c.item.nome||'').toUpperCase().substring(0,18);
    t += epCols(c.qty+'x '+nombre, fmt(precio*c.qty));
    if (c.selecciones?.length) {
      seleccionesLines(c.item,c.selecciones).forEach(l => {
        if (l) t += '  '+noAcc(l).substring(0,PW-2)+EP.LF;
      });
    }
  });
  t += epLine();
  const subOrd = Number(order.subtotal||order.total)||0;
  const envOrd = Number(order.envio||0)||0;
  const descOrden = Math.max(0, subOrd + envOrd - Number(order.total||0));
  t += epCols('Subtotal:', fmt(subOrd));
  if (autoDescuento>0) t += epCols('Desc. promo:', '- '+fmt(autoDescuento));
  if (descOrden>0)     t += epCols('Descuento:', '- '+fmt(descOrden));
  if (descuento>0)     t += epCols('Desc/Adelanto:', '- '+fmt(descuento));
  t += epCols('Envio:', fmt(envOrd));
  t += epLine();
  t += EP.BOLD1+EP.TALL;
  t += epCols('TOTAL:', fmt(Math.max(0,Number(order.total)-descuento-autoDescuento)));
  t += EP.NORM+EP.BOLD0+EP.FEED(4)+EP.CUT;
  return t;
};

const buildKitchenEscPos = (titulo, items, order) => {
  const hora = new Date(Number(order.created_at)).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false});
  const nro  = order.id.slice(-5).toUpperCase();
  let t = EP.INIT+EP.CENTER+EP.BOLD1+EP.BIG;
  t += noAcc(titulo)+EP.LF;
  t += EP.NORM+EP.BOLD0+'SHAKO SUSHI'+EP.LF;
  t += EP.LEFT+epLine('=');
  t += EP.BOLD1+'Pedido: #'+nro+' - '+hora+EP.LF+EP.BOLD0;
  if (order.nombre)  t += noAcc('Cliente: '+order.nombre.toUpperCase())+EP.LF;
  if (order.mesa_id) t += 'Mesa: '+order.mesa_id.replace('mv','V').replace('m','')+EP.LF;
  if (order.notas)   t += noAcc('NOTA: '+order.notas).substring(0,PW)+EP.LF;
  t += epLine('=');
  items.forEach(c => {
    t += EP.BOLD1+EP.TALL+c.qty+'x '+noAcc(c.item.nombre||c.item.nome||'').toUpperCase().substring(0,22)+EP.LF+EP.NORM+EP.BOLD0;
    if (c.selecciones?.length) {
      seleccionesLines(c.item,c.selecciones).forEach(l => {
        if (l) t += '   '+noAcc(l).substring(0,PW-3)+EP.LF;
      });
    }
    t += epLine();
  });
  t += EP.FEED(4)+EP.CUT;
  return t;
};

const qzPrint = async (escpos) => {
  try {
    if (!window.qz || !window.qz.websocket.isActive()) {
      await window.qz.websocket.connect();
    }
    const config = window.qz.configs.create(PRINTER_NAME);
    await window.qz.print(config, [{type:"raw", format:"command", flavor:"plain", data:escpos}]);
    return true;
  } catch(e) {
    console.warn("QZ Tray no disponible, usando window.print:", e);
    return false;
  }
};

const printWithFallback = async (html, escpos) => {
  const qzOk = await qzPrint(escpos);
  if (!qzOk) {
    const win = window.open("","_blank","width=400,height=600");
    if (!win) { alert("Habilitá los popups para imprimir"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); win.close(); }, 400);
  }
};

const printKitchenTickets = (order) => {
  const hora = new Date(Number(order.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false});
  const pedidoNro = order.id.slice(-5).toUpperCase();

  const buildKitchenHtml = (titulo, emoji, items) => {
    if (!items.length) return null;
    const itemsHtml = items.map(c => {
      const lines = c.selecciones?.length ? seleccionesLines(c.item,c.selecciones) : [];
      const linesHtml = lines.map(l=>`<div style="font-size:11px;color:#555;padding-left:8px">${l}</div>`).join("");
      return `<div style="margin:6px 0;padding:4px 0;border-bottom:1px dashed #ccc">
        <div style="font-size:14px;font-weight:bold">${c.qty}x ${(c.item.nombre||c.item.nome||'').toUpperCase()}</div>
        ${linesHtml}
      </div>`;
    }).join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>* { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Courier New',monospace; font-size:12px; width:72mm; color:#000; padding:4mm 2mm; }
    .center{text-align:center} .bold{font-weight:bold} .line{border-top:2px solid #000;margin:6px 0}
    @page{margin:2mm;size:80mm auto}</style></head><body>
    <div class="center bold" style="font-size:16px">${emoji} ${titulo}</div>
    <div class="center">SHAKO SUSHI</div>
    <div class="line"></div>
    <div class="bold">Pedido: #${pedidoNro} — ${hora}</div>
    ${order.nombre?`<div>Cliente: ${order.nombre.toUpperCase()}</div>`:""}
    ${order.mesa_id?`<div>Mesa: ${order.mesa_id.replace("mv","V").replace("m","")}</div>`:""}
    ${order.notas?`<div style="border:1px solid #000;padding:4px;margin-top:4px">Nota: ${order.notas}</div>`:""}
    <div class="line"></div>${itemsHtml}<div class="line"></div>
    <br/><br/></body></html>`;
  };

  const allItems = order.items || [];
  const getCatId = c => c.item?.catId || c.catId || "";
  const itemsFria     = allItems.filter(c => CAT_FRIA.includes(getCatId(c)));
  const itemsCaliente = allItems.filter(c => CAT_CALIENTE.includes(getCatId(c)));
  const hasCatId = allItems.some(c => getCatId(c));

  if (!hasCatId) {
    const html = buildKitchenHtml("COCINA", "👨‍🍳", allItems);
    if (html) printWithFallback(html, buildKitchenEscPos("COCINA", allItems, order));
    return;
  }

  [{titulo:"COCINA FRIA", emoji:"🍣", items:itemsFria},{titulo:"COCINA CALIENTE", emoji:"🔥", items:itemsCaliente}]
    .filter(t => t.items.length > 0)
    .forEach(({titulo, emoji, items}, idx) => {
      setTimeout(() => {
        printWithFallback(buildKitchenHtml(titulo, emoji, items), buildKitchenEscPos(titulo, items, order));
      }, idx * 800);
    });
};

const printTicket = (order, descuento=0, autoDescuento=0) => {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;
  const fecha = new Date(Number(order.created_at)).toLocaleDateString("es-AR",{day:"numeric",month:"numeric",year:"numeric"});
  const hora  = new Date(Number(order.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false});
  const dir = [order.calle, order.numero, order.entrecalle?"e/"+order.entrecalle:"", order.piso, order.barrio].filter(Boolean).join(" ");
  const itemsHtml = (order.items||[]).map(c => {
    const precio = c.precioUnitario ?? c.item.precio;
    const lines = c.selecciones?.length ? seleccionesLines(c.item,c.selecciones) : [];
    const linesHtml = lines.map(l=>`<div style="font-size:9px;color:#555;padding-left:8px">${l}</div>`).join("");
    return `<div style="display:flex;justify-content:space-between;margin:2px 0">
      <span>${c.qty}x ${(c.item.nombre||c.item.nome||'').toUpperCase().substring(0,20)}</span>
      <span>${fmt(precio*c.qty)}</span>
    </div>${linesHtml}`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>* { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',monospace; font-size:11px; width:72mm; color:#000; padding:4mm 2mm; }
  .center{text-align:center} .bold{font-weight:bold} .line{border-top:1px dashed #000;margin:4px 0}
  .row{display:flex;justify-content:space-between} .total{font-size:14px;font-weight:bold}
  @page{margin:2mm;size:80mm auto}</style></head><body>
  <div class="center bold" style="font-size:13px">SHAKO SUSHI</div>
  <div class="center" style="font-size:9px">Hudson Plaza Comercial, Berazategui</div>
  <div class="center" style="font-size:9px">&lt;&lt; Aceptacion de Consumo &gt;&gt;</div>
  <div class="center" style="font-size:9px">&lt;&lt;&lt; No valido como comp. fiscal &gt;&gt;&gt;</div>
  <div class="line"></div>
  <div>Fecha: ${fecha} - ${hora}</div>
  <div>Pedido: ${order.id.slice(-5).toUpperCase()}</div>
  <div class="line"></div>
  <div>Cliente: ${(order.nombre||"").toUpperCase()}</div>
  ${dir?`<div>Direccion: ${dir.toUpperCase()}</div>`:""}
  ${order.telefono?`<div>TE: ${order.telefono}</div>`:""}
  ${order.pago?`<div>Pago: ${order.pago.toUpperCase()}</div>`:""}
  ${order.repartidor?`<div>Rep.: ${order.repartidor}</div>`:""}
  ${order.notas?`<div>Nota: ${order.notas}</div>`:""}
  <div class="line"></div>
  <div class="row"><span>Cant. Descripcion</span><span>Importe</span></div>
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="row"><span>Subtotal:</span><span>${fmt(order.subtotal||order.total)}</span></div>
  ${autoDescuento>0?`<div class="row"><span>Desc. promo:</span><span>- ${fmt(autoDescuento)}</span></div>`:""}
  ${(()=>{const so=Number(order.subtotal||order.total)||0,eo=Number(order.envio||0)||0,d=Math.max(0,so+eo-Number(order.total||0));return d>0?`<div class="row"><span>Descuento:</span><span>- ${fmt(d)}</span></div>`:"";})()}
  ${descuento>0?`<div class="row"><span>Desc/Adelanto:</span><span>- ${fmt(descuento)}</span></div>`:""}
  <div class="row"><span>Envio:</span><span>${fmt(order.envio||0)}</span></div>
  <div class="line"></div>
  <div class="row total"><span>TOTAL:</span><span>${fmt(Math.max(0,Number(order.total)-descuento-autoDescuento))}</span></div>
  <div class="line"></div><br/></body></html>`;
  printWithFallback(html, buildTicketEscPos(order, descuento, autoDescuento));
};

function AdminView({ onExit, menu, saveMenu, appConfig=CONFIG, saveAppConfig }) {
  const [orders,     setOrders]     = useState([]);
  const [filter,     setFilter]     = useState("activos");
  const [expandedId, setExpandedId] = useState(null);
  const [splitPayId, setSplitPayId] = useState(null);
  const [splitAmounts, setSplitAmounts] = useState({efectivo:"", transferencia:"", tarjeta:""});
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [nuevoPedidoMesaId, setNuevoPedidoMesaId] = useState(null);
  const [mesasData, setMesasData] = useState([]);
  const repartidorOverrides = useRef({}); // persists through polling cycles

  const [caja,         setCaja]         = useState(null);
  const [cajaLoading,  setCajaLoading]  = useState(false);
  const [historialCaja,setHistorialCaja] = useState([]);
  const [cajaVista,    setCajaVista]     = useState("hoy"); // 'hoy' | 'semana' | 'mes'

  const loadCaja = useCallback(async () => {
    const hoy = fechaLocal();
    // Fix cajas with future dates caused by UTC timezone bug (created after 21:00 local = next day in UTC)
    const {data: cajasFuturas} = await supabase.from("caja").select("id,fecha").gt("fecha", hoy);
    if (cajasFuturas && cajasFuturas.length > 0) {
      await Promise.all(cajasFuturas.map(c =>
        supabase.from("caja").update({fecha: hoy}).eq("id", c.id)
      ));
    }
    // Auto-close any open cajas from previous days (but skip manually reopened ones)
    const {data: cajasViejas} = await supabase.from("caja").select("id,fecha,notas_cierre").eq("estado","abierta").neq("fecha",hoy);
    const paraCerrar = (cajasViejas||[]).filter(c => !(c.notas_cierre||"").includes("Reabierta"));
    if (paraCerrar.length > 0) {
      await Promise.all(paraCerrar.map(c =>
        supabase.from("caja").update({estado:"cerrada", notas_cierre: (c.notas_cierre?c.notas_cierre+"\n":"")+"Cerrada automáticamente por cambio de día"}).eq("id", c.id)
      ));
    }
    // Prefer open caja of today
    const {data: abierta} = await supabase.from("caja").select("*").eq("fecha", hoy).eq("estado","abierta").limit(1);
    if (abierta && abierta.length > 0) { setCaja(abierta[0]); return; }
    // Fallback: any manually reopened caja (from previous days) — takes priority over closed today
    const {data: reabierta} = await supabase.from("caja").select("*").eq("estado","abierta").ilike("notas_cierre","%Reabierta%").order("created_at",{ascending:false}).limit(1);
    if (reabierta && reabierta.length > 0) { setCaja(reabierta[0]); return; }
    // Fallback: most recent of today (closed)
    const {data: reciente} = await supabase.from("caja").select("*").eq("fecha", hoy).order("created_at",{ascending:false}).limit(1);
    setCaja(reciente && reciente.length > 0 ? reciente[0] : null);
  }, []);

  const loadHistorialCaja = useCallback(async () => {
    // Último mes de caja
    const hace30 = new Date();
    hace30.setDate(hace30.getDate()-30);
    const desde = fechaLocal(hace30);
    const {data} = await supabase.from("caja").select("*").gte("fecha", desde).order("fecha", {ascending:false});
    setHistorialCaja(data || []);
  }, []);

  const abrirCaja = async (monto, notas) => {
    setCajaLoading(true);
    const hoy = fechaLocal();
    const now = new Date(); const hora = now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
    const {data} = await supabase.from("caja").insert({fecha:hoy, estado:"abierta", hora_apertura:hora, monto_apertura:Number(monto), notas_apertura:notas}).select().single();
    setCaja(data);
    setCajaLoading(false);
  };

  const agregarMovimiento = async (tipo, monto, descripcion) => {
    if (!caja) return { ok:false, error:"No hay caja abierta" };
    const now = new Date();
    const hora = now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
    const mov = { tipo, monto: Number(monto), descripcion: descripcion.trim() || (tipo==="salida"?"Retiro de efectivo":"Entrada de efectivo"), hora };
    // Re-fetch latest movimientos from DB to avoid clobbering concurrent writes / stale local state
    const { data: fresh, error: fetchErr } = await supabase.from("caja").select("movimientos,estado").eq("id", caja.id).single();
    if (fetchErr) return { ok:false, error:"No se pudo leer la caja: "+fetchErr.message };
    if (fresh?.estado !== "abierta") return { ok:false, error:"La caja ya no está abierta" };
    const nuevos = [...(fresh?.movimientos || []), mov];
    const { data, error } = await supabase.from("caja").update({ movimientos: nuevos }).eq("id", caja.id).select().single();
    if (error) return { ok:false, error:error.message };
    if (data) setCaja(data);
    await loadHistorialCaja();
    return { ok:true };
  };

  const cerrarCaja = async (monto, notas) => {
    if (!caja) return;
    setCajaLoading(true);
    const now2 = new Date(); const hora = now2.getHours().toString().padStart(2,"0")+":"+now2.getMinutes().toString().padStart(2,"0");
    // Compute day window based on caja's own fecha (correct for reopened old cajas too)
    const [y,mo,d] = (caja.fecha||fechaLocal()).split("-").map(Number);
    const inicioDia = new Date(y, mo-1, d, 0, 0, 0).getTime();
    const finDia   = new Date(y, mo-1, d, 23, 59, 59).getTime();
    const ordersDelDia = orders.filter(o=>{
      const ts = Number(o.created_at);
      return ts >= inicioDia && ts <= finDia && o.status !== "eliminado";
    });
    // Get current mesas session data
    const {data:mesasNow} = await supabase.from("mesas").select("id,session_num");
    const mesasMap = {};
    (mesasNow||[]).forEach(m=>mesasMap[m.id]=m.session_num||1);
    // Only count mesa orders whose session is closed
    const totalVentas = ordersDelDia.filter(o=>o.status==="entregado"&&(!o.mesa_id||(mesasMap[o.mesa_id]||1)>(o.mesa_session||1))).reduce((s,o)=>s+Number(o.total),0);
    // Preserve audit trail: if caja was reopened, append new notas instead of overwriting
    const notasFinales = (caja.notas_cierre||"").includes("Reabierta")
      ? `${caja.notas_cierre}\n${notas||"(re-cerrada)"}`.trim()
      : notas;
    const {data} = await supabase.from("caja").update({estado:"cerrada", hora_cierre:hora, monto_cierre:Number(monto), notas_cierre:notasFinales, total_ventas:totalVentas}).eq("id",caja.id).select().single();
    setCaja(data);
    await loadHistorialCaja();
    setCajaLoading(false);
  };

  const reabrirCaja = async (id) => {
    const pin = window.prompt("PIN para reabrir la caja:");
    if (pin === null) return;
    if (pin !== "2706") { alert("PIN incorrecto"); return; }
    if (!window.confirm("¿Reabrir esta caja?\nVas a poder agregar movimientos y volver a cerrarla.")) return;
    const {data: target} = await supabase.from("caja").select("*").eq("id", id).single();
    if (!target) { alert("Caja no encontrada"); return; }
    // Guard: no other open caja (only one abierta allowed at a time to avoid ambiguity)
    const {data: yaAbierta} = await supabase.from("caja").select("id,fecha").eq("estado","abierta").neq("id", id);
    if (yaAbierta && yaAbierta.length > 0) {
      alert(`Ya hay otra caja abierta (fecha ${yaAbierta[0].fecha}). Cerrala primero antes de reabrir esta.`);
      return;
    }
    const ahora = new Date().toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    const marca = `⚠️ Reabierta ${ahora}`;
    const notasNuevas = target.notas_cierre ? `${target.notas_cierre}\n${marca}` : marca;
    await supabase.from("caja").update({
      estado: "abierta",
      monto_cierre: null,
      hora_cierre: null,
      total_ventas: null,
      notas_cierre: notasNuevas,
    }).eq("id", id);
    await loadCaja();
    await loadHistorialCaja();
    setCajaVista("hoy");
    alert("Caja reabierta. Ya podés agregar movimientos y volver a cerrarla desde la vista Hoy.");
  };

  const loadOrders = useCallback(async () => {
    // Load active orders + last 90 days of history
    const since90 = new Date(); since90.setDate(since90.getDate()-90);
    const { data, error } = await supabase.from("orders").select("*")
      .or(`status.in.(nuevo,preparando,listo),created_at.gte.${since90.getTime()}`)
      .order("created_at", {ascending:false})
      .limit(500);
    if (!error && data) {
      // Apply any pending repartidor overrides (survive polling)
      const overrides = repartidorOverrides.current;
      const merged = Object.keys(overrides).length
        ? data.map(o => overrides[o.id] !== undefined ? {...o, repartidor: overrides[o.id]} : o)
        : data;
      setOrders(merged);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadCaja().then(() => loadHistorialCaja());
    supabase.from("mesas").select("id,session_num,estado").then(({data})=>setMesasData(data||[]));

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
  };
  const updatePago = async (order, pago) => {
    // Only recalculate total for customer-placed orders (admin orders never have recargo)
    let nuevoTotal = order.total;
    if (order.source === "customer") {
      const base = order.subtotal || order.total; // fallback for old orders without subtotal
      nuevoTotal = pago === "tarjeta" ? Math.round(base * (1 + appConfig.recargoMP)) : base;
    }
    setOrders(p => p.map(o => o.id===order.id ? {...o, pago, total:nuevoTotal, pago_detalle:null} : o));
    await supabase.from("orders").update({pago, total:nuevoTotal, pago_detalle:null}).eq("id", order.id);
    setSplitPayId(null);
  };
  const updatePagoDetalle = async (order, amounts) => {
    // amounts = {efectivo: 3000, transferencia: 2000, tarjeta: 0}
    const detalle = Object.entries(amounts)
      .filter(([,m]) => Number(m) > 0)
      .map(([metodo,monto]) => ({metodo, monto:Number(monto)}));
    if (detalle.length === 0) return;
    if (detalle.length === 1) {
      // Solo un método → usar pago normal
      const pago = detalle[0].metodo;
      setOrders(p => p.map(o => o.id===order.id ? {...o, pago, pago_detalle:null} : o));
      await supabase.from("orders").update({pago, pago_detalle:null}).eq("id", order.id);
    } else {
      setOrders(p => p.map(o => o.id===order.id ? {...o, pago:"mixto", pago_detalle:detalle} : o));
      await supabase.from("orders").update({pago:"mixto", pago_detalle:detalle}).eq("id", order.id);
    }
    setSplitPayId(null);
    setSplitAmounts({efectivo:"", transferencia:"", tarjeta:""});
  };
  const updateRepartidor = async (order, repartidor) => {
    const nuevo = order.repartidor === repartidor ? null : repartidor; // toggle
    repartidorOverrides.current[order.id] = nuevo; // persist through polling
    setOrders(p => p.map(o => o.id===order.id ? {...o,repartidor:nuevo} : o));
    await supabase.from("orders").update({repartidor:nuevo}).eq("id", order.id);
    // Once saved, remove from overrides (DB is the source of truth now)
    delete repartidorOverrides.current[order.id];
  };
  const deleteOrder = async (id) => {
    if (!window.confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return;
    setOrders(p => p.filter(o => o.id !== id));
    await supabase.from("orders").delete().eq("id", id);
  };

  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const hoyTs = hoy.getTime();
  const ordersHoy = orders.filter(o => Number(o.created_at) >= hoyTs && o.status !== "eliminado");
  const entH   = ordersHoy.filter(o => o.status === "entregado" && !o.mesa_id);
  // For mesa orders: count once per session (deduplicated by mesa+session key)
  // Only count mesa orders whose session is closed (mesa.session_num > order.mesa_session)
  const mesaSessions = {};
  ordersHoy.filter(o=>o.status==="entregado"&&o.mesa_id).forEach(o=>{
    const mesa = mesasData.find(m=>m.id===o.mesa_id);
    const sessionClosed = mesa ? (mesa.session_num||1) > (o.mesa_session||1) : true;
    if (!sessionClosed) return; // skip open sessions
    const key = o.mesa_id+"-"+(o.mesa_session||1);
    if (!mesaSessions[key]) mesaSessions[key]={total:0,pago:o.pago,tipo:"mesa",pago_detalle:null};
    mesaSessions[key].total += Number(o.total);
    if (o.pago) mesaSessions[key].pago = o.pago;
    if (o.pago_detalle) mesaSessions[key].pago_detalle = o.pago_detalle;
  });
  const mesaSessionList = Object.values(mesaSessions);
  const entHAll = [...entH, ...mesaSessionList.map(s=>({...s,status:"entregado"}))];
  const totDia = entH.reduce((s,o)=>s+Number(o.total),0) + mesaSessionList.reduce((s,m)=>s+m.total,0);
  // Helper: monto por método de pago, soporta pago_detalle (mixto)
  const montoByPago = (o, metodo) => {
    if (o.pago_detalle && Array.isArray(o.pago_detalle)) {
      const d = o.pago_detalle.find(d => d.metodo === metodo);
      return d ? Number(d.monto) : 0;
    }
    return o.pago === metodo ? Number(o.total) : 0;
  };
  const totEf  = entH.reduce((s,o)=>s+montoByPago(o,"efectivo"),0) + mesaSessionList.reduce((s,m)=>s+montoByPago(m,"efectivo"),0);
  const totTr  = entH.reduce((s,o)=>s+montoByPago(o,"transferencia"),0) + mesaSessionList.reduce((s,m)=>s+montoByPago(m,"transferencia"),0);
  const totTj  = entH.reduce((s,o)=>s+montoByPago(o,"tarjeta"),0) + mesaSessionList.reduce((s,m)=>s+montoByPago(m,"tarjeta"),0);
  const totDel = entH.filter(o=>o.tipo==="delivery").reduce((s,o)=>s+Number(o.total),0);
  const totRet = entH.filter(o=>o.tipo==="retiro").reduce((s,o)=>s+Number(o.total),0);
  const totMesa = mesaSessionList.reduce((s,m)=>s+m.total,0);
  const proyect = ordersHoy.filter(o=>!o.mesa_id).reduce((s,o)=>s+Number(o.total),0) + mesaSessionList.reduce((s,m)=>s+m.total,0);
  // Open mesa sessions (still active) - not counted in stats
  const openMesaTotals = (() => {
    const open = {};
    ordersHoy.filter(o=>o.mesa_id).forEach(o=>{
      const mesa = mesasData.find(m=>m.id===o.mesa_id);
      const sessionClosed = mesa ? (mesa.session_num||1) > (o.mesa_session||1) : true;
      if (sessionClosed) return;
      const key = o.mesa_id+"-"+(o.mesa_session||1);
      if (!open[key]) open[key]={total:0};
      open[key].total += Number(o.total);
    });
    return Object.values(open);
  })();
  const prodMap = {};
  // Use orders from current week for the ranking (more meaningful than just today)
  const inicioSemana = new Date(); inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1); inicioSemana.setHours(0,0,0,0);
  const ordersSemanaProd = orders.filter(o=>o.status==="entregado"&&Number(o.created_at)>=inicioSemana.getTime());
  ordersSemanaProd.forEach(o => o.items?.forEach(c => {
    if (!prodMap[c.item.nombre]) prodMap[c.item.nombre]={nombre:c.item.nombre,qty:0,total:0};
    prodMap[c.item.nombre].qty   += c.qty;
    prodMap[c.item.nombre].total += c.item.precio*c.qty;
  }));
  const topProds = Object.values(prodMap).sort((a,b)=>b.qty-a.qty).slice(0,8);
  const todayStr = new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
  const isMesaClosed = (o) => { if (!o.mesa_id) return true; const m=mesasData.find(x=>x.id===o.mesa_id); return m?(m.session_num||1)>(o.mesa_session||1):true; };
  const filtered = (() => {
    if (filter==="activos") return orders.filter(o=>["nuevo","preparando","listo"].includes(o.status));
    if (filter==="entregados") {
      // Individual orders (no mesa)
      const indiv = orders.filter(o=>o.status==="entregado"&&!o.mesa_id);
      // Closed mesa sessions - one synthetic row per session
      const sesMap = {};
      orders.filter(o=>o.status==="entregado"&&o.mesa_id).forEach(o=>{
        const m=mesasData.find(x=>x.id===o.mesa_id);
        if (!m||(m.session_num||1)<=(o.mesa_session||1)) return;
        const key=o.mesa_id+"-"+(o.mesa_session||1);
        if (!sesMap[key]) sesMap[key]={_mesaSession:true,id:key,mesa_id:o.mesa_id,mesa_session:o.mesa_session||1,orders:[],total:0,pago:o.pago,created_at:o.created_at,status:"entregado"};
        sesMap[key].orders.push(o);
        sesMap[key].total+=Number(o.total);
        if(o.pago) sesMap[key].pago=o.pago;
      });
      return [...indiv,...Object.values(sesMap)].sort((a,b)=>Number(b.created_at)-Number(a.created_at));
    }
    return orders.filter(o=>o.status===filter);
  })();
  const counts   = {
    pendiente_pago: orders.filter(o=>o.status==="pendiente_pago").length,
    nuevo:     orders.filter(o=>o.status==="nuevo").length,
    preparando:orders.filter(o=>o.status==="preparando").length,
    listo:     orders.filter(o=>o.status==="listo").length,
    entregado: orders.filter(o=>o.status==="entregado").length,
  };
  const TABS = [
    {key:"activos",     label:"Activos",   val:counts.nuevo+counts.preparando+counts.listo, color:"var(--text)"},
    {key:"pendiente_pago", label:"💳 Pendientes", val:counts.pendiente_pago||0, color:"#D97706"},
    {key:"nuevo",       label:"🔴 Nuevos", val:counts.nuevo,       color:"#CC1F1F"},
    {key:"preparando",  label:"🟡 Prep.",  val:counts.preparando,  color:"#D97706"},
    {key:"listo",       label:"🟢 Listos", val:counts.listo,       color:"#16A34A"},
    {key:"entregados",  label:"Historial", val:(()=>{ const indiv=orders.filter(o=>o.status==="entregado"&&!o.mesa_id).length; const sesMap={}; orders.filter(o=>o.status==="entregado"&&o.mesa_id).forEach(o=>{const m=mesasData.find(x=>x.id===o.mesa_id);if(m&&(m.session_num||1)>(o.mesa_session||1)){sesMap[o.mesa_id+"-"+(o.mesa_session||1)]=1;}}); return indiv+Object.keys(sesMap).length; })(), color:"var(--text3)"},
    {key:"facturacion", label:"Caja",      val:null,               color:"#D97706"},
    {key:"editor",      label:"Menú",      val:null,               color:"#7C3AED"},
    {key:"nuevo_pedido", label:"Pedido",    val:null,               color:"#16A34A"},
    {key:"mesas",        label:"Mesas",     val:null,               color:"#0EA5E9"},
    {key:"config",        label:"Config",     val:null,               color:"#6B7280"},
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
                {f.key==="facturacion"?"💰":f.key==="editor"?"✏️":f.key==="mesas"?"🍽️":f.key==="config"?"⚙️":"🛒"}
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
          <CajaWidget caja={caja} cajaLoading={cajaLoading} onAbrir={abrirCaja} onCerrar={cerrarCaja} onAgregarMovimiento={agregarMovimiento} totEf={totEf} lastCierre={historialCaja.find(c=>c.estado==="cerrada"&&c.fecha!==fechaLocal())?.monto_cierre}/>
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
              <div className="sh" style={{fontSize:26,color:"#D97706"}}>{ordersHoy.filter(o=>!o.mesa_id).length + mesaSessionList.length}</div>
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
              {label:"🍽️ Mesas",   total:totMesa,count:mesaSessionList.length,                         color:"#EA580C",bg:"#FFF7ED",border:"#FED7AA"},
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
              <Label>🏆 PRODUCTOS MÁS VENDIDOS (esta semana)</Label>
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
            {(()=>{
              // Session-closed check
              const isClosed = (o) => { if (!o.mesa_id) return true; const m=mesasData.find(x=>x.id===o.mesa_id); return m?(m.session_num||1)>(o.mesa_session||1):true; };
              // Individual orders (no mesa)
              const indiv = ordersHoy.filter(o=>!o.mesa_id);
              // Mesa sessions that are closed - group by mesa+session
              const sesMap = {};
              ordersHoy.filter(o=>o.mesa_id&&isClosed(o)).forEach(o=>{
                const key=o.mesa_id+"-"+(o.mesa_session||1);
                if (!sesMap[key]) sesMap[key]={key,mesaId:o.mesa_id,session:o.mesa_session||1,orders:[],total:0,pago:o.pago,created_at:o.created_at};
                sesMap[key].orders.push(o);
                sesMap[key].total+=Number(o.total);
                if(o.pago) sesMap[key].pago=o.pago;
              });
              const sessions = Object.values(sesMap);
              const all = [...indiv, ...sessions.map(s=>({...s,_isMesaSession:true}))].sort((a,b)=>Number(b.created_at)-Number(a.created_at));
              if (all.length===0) return <div style={{textAlign:"center",padding:"24px 0",color:"var(--text4)",fontSize:14}}>Todavía no hay pedidos hoy</div>;
              return(<>
                {all.map((o,i)=>{
                  if (o._isMesaSession) {
                    const hora = new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false});
                    const nItems = o.orders.reduce((s,p)=>s+(p.items?.reduce((a,c)=>a+c.qty,0)||0),0);
                    return(
                      <div key={o.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:"#16A34A",flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>Mesa {o.mesaId.replace("mv","V").replace("m","")}</span>
                            <span style={{fontSize:10,fontWeight:700,color:"#16A34A",background:"#F0FDF4",padding:"1px 6px",borderRadius:20}}>Entregado</span>
                          </div>
                          <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                            {hora} · {o.orders.length} pedido{o.orders.length!==1?"s":""} · {nItems} items
                            {o.pago&&<span style={{marginLeft:4,color:o.pago==="efectivo"?"#16A34A":o.pago==="transferencia"?"#D97706":o.pago==="mixto"?"#9333EA":"#2563EB"}}>· {o.pago==="efectivo"?"💵":o.pago==="transferencia"?"📲":o.pago==="mixto"?"🔀":"💳"}</span>}
                          </div>
                        </div>
                        <span className="sh" style={{fontSize:15,color:"#16A34A",flexShrink:0}}>{fmt(o.total)}</span>
                      </div>
                    );
                  }
                  const est=ESTADOS[o.status]||ESTADOS.nuevo;
                  return(
                    <div key={o.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<all.length-1?"1px solid var(--border)":"none"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:est.ring,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{o.nombre}</span>
                          <span style={{fontSize:10,color:"var(--text4)",fontFamily:"monospace"}}>#{o.id.slice(-5).toUpperCase()}</span>
                          <span style={{fontSize:10,fontWeight:700,color:est.color,background:est.bg,padding:"1px 6px",borderRadius:20}}>{est.label}</span>
                          {o.tipo==="delivery"&&<span style={{marginLeft:4,color:"#D97706"}}>🛵</span>}
                        </div>
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                          {new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false})} · {o.items?.reduce((s,c)=>s+c.qty,0)||0} items
                          {o.pago&&<span style={{marginLeft:4,color:o.pago==="efectivo"?"#16A34A":o.pago==="transferencia"?"#D97706":o.pago==="mixto"?"#9333EA":"#2563EB"}}>· {o.pago==="efectivo"?"💵":o.pago==="transferencia"?"📲":o.pago==="mixto"?"🔀":"💳"}</span>}
                        </div>
                      </div>
                      <span className="sh" style={{fontSize:15,color:o.status==="entregado"?"#16A34A":"var(--text3)",flexShrink:0}}>{fmt(o.total)}</span>
                    </div>
                  );
                })}
                {totDia>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",fontWeight:800,fontSize:16,borderTop:"1px solid var(--border)",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif"}}>
                    <span style={{color:"var(--text3)"}}>Total cobrado</span>
                    <span style={{color:"#16A34A"}}>{fmt(totDia)}</span>
                  </div>
                )}
              </>);
            })()}
          </Card>
          </>}

          {(cajaVista==="semana"||cajaVista==="mes")&&<HistorialCajaResumen historial={historialCaja} vista={cajaVista} orders={orders}/>}
          {cajaVista==="historial"&&<HistorialCajaTabla historial={historialCaja} onReload={loadHistorialCaja} orders={orders} onReabrir={reabrirCaja}/>}
        </div>
      )}

      {filter==="mesas"&&<MesasView onNewOrder={(mesaId)=>{setFilter("nuevo_pedido");setNuevoPedidoMesaId(mesaId);}} />}
      {filter==="config"&&<ConfigEditor appConfig={appConfig} saveAppConfig={saveAppConfig} menu={menu}/>}
      {filter==="nuevo_pedido"&&<NuevoPedidoAdmin menu={menu} mesaId={nuevoPedidoMesaId} appConfig={appConfig} onClose={()=>{setFilter(nuevoPedidoMesaId?"mesas":"activos");setNuevoPedidoMesaId(null);}} onOrderPlaced={()=>{loadOrders();}} />}

      {!["editor","facturacion","config"].includes(filter)&&(
        <div style={{padding:"12px 12px 40px"}}>
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"48px 20px",color:"var(--text3)"}}>
              <img src={LOGO_SRC} alt="" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",opacity:.3,marginBottom:12}}/>
              <div className="sh" style={{fontSize:18,marginBottom:4,color:"var(--text2)"}}>Sin pedidos</div>
              <div style={{fontSize:13}}>No hay pedidos en esta categoría</div>
            </div>
          )}
          {filtered.map(order=>{
            // Mesa session row
            if (order._mesaSession) {
              const isExp = expandedId===order.id;
              const nItems = order.orders.reduce((s,o)=>s+(o.items?.reduce((a,c)=>a+c.qty,0)||0),0);
              const fmt2 = (n)=>`$${Number(n||0).toLocaleString("es-AR")}`;
              return(
                <div key={order.id} style={{background:"var(--surface)",border:`2px solid ${isExp?"var(--red-border)":"var(--border)"}`,borderRadius:16,marginBottom:10,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"}} onClick={()=>setExpandedId(isExp?null:order.id)}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#16A34A",boxShadow:"0 0 6px #16A34A",flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="sh" style={{fontSize:15,color:"var(--text)"}}>Mesa {order.mesa_id.replace("mv","V").replace("m","")}</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#16A34A",background:"#F0FDF4",padding:"2px 8px",borderRadius:20}}>Entregado</span>
                        <span style={{fontSize:11,color:"var(--text4)",background:"var(--bg2)",padding:"2px 6px",borderRadius:20}}>🍽️ Mesa</span>
                      </div>
                      <div style={{fontSize:13,color:"var(--text3)",marginTop:3}}>
                        {order.orders.length} pedido{order.orders.length!==1?"s":""} · {nItems} items · {timeAgo(order.created_at)}
                        {order.pago&&<span style={{marginLeft:6,color:order.pago==="efectivo"?"#16A34A":order.pago==="transferencia"?"#D97706":order.pago==="mixto"?"#9333EA":"#2563EB"}}>{order.pago==="efectivo"?"💵":order.pago==="transferencia"?"📲":order.pago==="mixto"?"🔀":"💳"} {order.pago}</span>}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div className="sh" style={{fontSize:17,color:"#16A34A"}}>{fmt2(order.total)}</div>
                      <div style={{fontSize:10,color:"var(--text4)",marginTop:2}}>{isExp?"▲":"▼"}</div>
                    </div>
                  </div>
                  {isExp&&(
                    <div className="fade-in" style={{padding:"0 14px 14px",borderTop:"1px solid var(--border)"}}>
                      {order.orders.map(o=>(
                        <div key={o.id} style={{marginBottom:8,padding:"8px 12px",background:"var(--bg2)",borderRadius:10,border:"1px solid var(--border)"}}>
                          <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>#{o.id.slice(-5).toUpperCase()} · {new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false})}</div>
                          {o.items?.filter(c=>c.item).map(c=>(
                            <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0"}}>
                              <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                              <span style={{color:"var(--text3)"}}>{fmt2((c.precioUnitario??c.item.precio)*c.qty)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",borderTop:"1px solid var(--border)",fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif"}}>
                        <span style={{color:"var(--text3)"}}>TOTAL MESA</span>
                        <span style={{color:"#16A34A"}}>{fmt2(order.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
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
                      {order.repartidor&&<span style={{fontSize:11,color:"#7C3AED",background:"#FAF5FF",padding:"2px 6px",borderRadius:20,fontWeight:600,border:"1px solid #E9D5FF"}}>🏍️ {order.repartidor}</span>}
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
                        <div key={c.cartKey||c.item.id} style={{borderBottom:"1px solid var(--border)",padding:"4px 0"}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                            <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                            <span style={{color:"var(--text3)"}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
                          </div>
                          {c.selecciones&&<div style={{fontSize:11,color:"var(--text4)",paddingLeft:14}}>{seleccionesLabel(c.item,c.selecciones)}</div>}
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
                    {/* Asignar repartidor - solo cuando está listo para despachar */}
                    {order.tipo==="delivery"&&order.status==="listo"&&(
                      <div style={{marginBottom:12,background:"#FAF5FF",borderRadius:12,padding:"10px 12px",border:"1px solid #E9D5FF"}}>
                        <div style={{fontSize:10,color:"#7C3AED",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,marginBottom:8}}>🏍️ REPARTIDOR</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {appConfig.repartidores.map(r=>(
                            <button key={r} className="btn" onClick={()=>updateRepartidor(order,r)}
                              style={{padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:700,
                                background:order.repartidor===r?"#7C3AED":"var(--surface)",
                                border:`2px solid ${order.repartidor===r?"#7C3AED":"#E9D5FF"}`,
                                color:order.repartidor===r?"#fff":"#7C3AED",
                                transition:"all .15s",fontFamily:"'Barlow Condensed',sans-serif"}}>
                              {r}
                            </button>
                          ))}
                        </div>
                        {order.repartidor&&(
                          <div style={{marginTop:8,fontSize:12,color:"#7C3AED",fontWeight:600}}>
                            ✓ Asignado a <strong>{order.repartidor}</strong>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Cambio de método de pago - solo para pedidos sin mesa */}
                    {!order.mesa_id&&(
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
                    </div>)}
                    {/* Detallar valores - pago mixto */}
                    {!order.mesa_id&&(
                    <div style={{marginBottom:8}}>
                      {splitPayId!==order.id?(
                        <button className="btn" onClick={()=>{
                          setSplitPayId(order.id);
                          if (order.pago==="mixto"&&order.pago_detalle) {
                            const sa={efectivo:"",transferencia:"",tarjeta:""};
                            order.pago_detalle.forEach(d=>{sa[d.metodo]=String(d.monto);});
                            setSplitAmounts(sa);
                          } else {
                            setSplitAmounts({efectivo:order.pago==="efectivo"?String(order.total):"",transferencia:order.pago==="transferencia"?String(order.total):"",tarjeta:order.pago==="tarjeta"?String(order.total):""});
                          }
                        }}
                          style={{width:"100%",padding:"8px 0",borderRadius:10,fontSize:11,fontWeight:700,
                            background:order.pago==="mixto"?"#F3E8FF":"var(--bg2)",
                            border:`2px solid ${order.pago==="mixto"?"#C084FC":"var(--border)"}`,
                            color:order.pago==="mixto"?"#9333EA":"var(--text3)",
                            fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
                          {order.pago==="mixto"?"🔀 PAGO MIXTO — Editar desglose":"🔀 Detallar valores (pago mixto)"}
                        </button>
                      ):(
                        <div style={{background:"#FAF5FF",border:"2px solid #C084FC",borderRadius:12,padding:12}}>
                          <div style={{fontSize:10,color:"#9333EA",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,marginBottom:8}}>DETALLAR VALORES</div>
                          {[{k:"efectivo",l:"💵 Efectivo",c:"#16A34A"},{k:"transferencia",l:"📲 Transferencia",c:"#D97706"},{k:"tarjeta",l:"💳 Tarjeta",c:"#2563EB"}].map(p=>(
                            <div key={p.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                              <span style={{fontSize:12,fontWeight:700,color:p.c,width:120,fontFamily:"'Barlow Condensed',sans-serif"}}>{p.l}</span>
                              <span style={{color:"var(--text3)",fontSize:14}}>$</span>
                              <input type="number" min="0" value={splitAmounts[p.k]} placeholder="0"
                                onChange={e=>setSplitAmounts(prev=>({...prev,[p.k]:e.target.value}))}
                                style={{flex:1,padding:"6px 10px",borderRadius:8,border:"1px solid var(--border)",fontSize:14,fontWeight:700,
                                  background:"var(--surface)",color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
                            </div>
                          ))}
                          {(()=>{
                            const sumSplit = (Number(splitAmounts.efectivo)||0)+(Number(splitAmounts.transferencia)||0)+(Number(splitAmounts.tarjeta)||0);
                            const diff = sumSplit - Number(order.total);
                            return(<>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid #E9D5FF",marginTop:4}}>
                                <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>Total pedido: <strong>${Number(order.total).toLocaleString("es-AR")}</strong></span>
                                <span style={{fontSize:11,fontWeight:700,color:diff===0?"#16A34A":diff>0?"#D97706":"#DC2626"}}>
                                  Suma: ${sumSplit.toLocaleString("es-AR")} {diff!==0&&`(${diff>0?"+":""}${diff.toLocaleString("es-AR")})`}
                                </span>
                              </div>
                              <div style={{display:"flex",gap:6,marginTop:8}}>
                                <button className="btn" onClick={()=>{setSplitPayId(null);setSplitAmounts({efectivo:"",transferencia:"",tarjeta:""});}}
                                  style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:12,fontWeight:700,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif"}}>
                                  Cancelar
                                </button>
                                <button className="btn" onClick={()=>updatePagoDetalle(order,splitAmounts)}
                                  disabled={sumSplit===0}
                                  style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:12,fontWeight:700,
                                    background:sumSplit>0?"#9333EA":"var(--border)",border:"none",color:"#fff",
                                    fontFamily:"'Barlow Condensed',sans-serif",opacity:sumSplit===0?.5:1}}>
                                  Guardar desglose
                                </button>
                              </div>
                            </>);
                          })()}
                        </div>
                      )}
                      {order.pago==="mixto"&&order.pago_detalle&&splitPayId!==order.id&&(
                        <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                          {order.pago_detalle.map(d=>(
                            <span key={d.metodo} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,
                              background:d.metodo==="efectivo"?"#F0FDF4":d.metodo==="transferencia"?"#FFFBEB":"#EFF6FF",
                              border:`1px solid ${d.metodo==="efectivo"?"#BBF7D0":d.metodo==="transferencia"?"#FDE68A":"#BFDBFE"}`,
                              color:d.metodo==="efectivo"?"#16A34A":d.metodo==="transferencia"?"#D97706":"#2563EB",
                              fontFamily:"'Barlow Condensed',sans-serif"}}>
                              {d.metodo==="efectivo"?"💵":d.metodo==="transferencia"?"📲":"💳"} ${Number(d.monto).toLocaleString("es-AR")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>)}
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      {est.next&&(()=>{
                        const needsRep = est.next==="entregado" && order.tipo==="delivery" && !order.repartidor;
                        return(
                          <button className="btn"
                            onClick={()=>{ if(needsRep) return; updateStatus(order,est.next); if(est.next==="entregado") printTicket(order); if(est.next==="preparando") printKitchenTickets(order); }}
                            title={needsRep?"Asigná un repartidor antes de despachar":""}
                            style={{flex:1,padding:"12px 0",borderRadius:12,
                              background:needsRep?"var(--border)":est.bg,
                              border:`1px solid ${needsRep?"var(--border2)":est.ring}`,
                              color:needsRep?"var(--text4)":est.color,
                              fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,
                              cursor:needsRep?"not-allowed":"pointer",opacity:needsRep?.6:1,transition:"all .2s"}}>
                            {needsRep?"⚠ Elegí un repartidor primero":`${est.nextLabel} →`}
                          </button>
                        );
                      })()}
                      <TicketBtn order={order}/>
                      <button className="btn" onClick={()=>deleteOrder(order.id)} title="Eliminar pedido" style={{padding:"12px 16px",borderRadius:12,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:13,fontWeight:600}}>Eliminar</button>
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
  const editPanelRef = useRef(null);
  const [saved,       setSaved]       = useState(false);
  const editCatId  = editId?.split(":")[0];
  const editItemId = editId?.split(":")[1];
  const editCat    = editCatId  ? menu.find(c=>c.id===editCatId)  : null;
  const editItem   = editCat    ? editCat.items.find(i=>i.id===editItemId) : null;
  const updCat  = (catId,ch)        => saveMenu(menu.map(c=>c.id===catId?{...c,...ch}:c));
  const updItem = (catId,itemId,ch) => saveMenu(menu.map(c=>c.id===catId?{...c,items:c.items.map(i=>i.id===itemId?{...i,...ch}:i)}:c));
  useEffect(() => {
    if (editId && editPanelRef.current) {
      setTimeout(() => editPanelRef.current.scrollIntoView({behavior:"smooth", block:"start"}), 50);
    }
  }, [editId]);

  const delItem = (catId,itemId)    => { if(!window.confirm("¿Eliminar este producto?"))return; saveMenu(menu.map(c=>c.id===catId?{...c,items:c.items.filter(i=>i.id!==itemId)}:c)); if(editItemId===itemId)setEditId(null); };
  const addItem = (catId)           => { const ni={id:genId(),nombre:"Nuevo producto",desc:"",precio:0}; saveMenu(menu.map(c=>c.id===catId?{...c,items:[...c.items,ni]}:c)); setEditId(`${catId}:${ni.id}`); setExpandedCat(catId); };
  const addCat  = ()                => { const nc={id:genId(),nombre:"Nueva categoría",emoji:"🍴",desc:"",items:[]}; saveMenu([...menu,nc]); setExpandedCat(nc.id); };
  const delCat  = (catId)           => { if(!window.confirm("¿Eliminar esta categoría?"))return; saveMenu(menu.filter(c=>c.id!==catId)); if(expandedCat===catId)setExpandedCat(null); };
  const handleFile = async (catId,itemId,file) => {
    if(!file) return;
    const ext = file.name.split(".").pop();
    const path = `items/${catId}-${itemId}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("menu-images").upload(path, file, { upsert:true });
    if (error) { alert("Error al subir imagen: " + error.message); return; }
    const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(path);
    updItem(catId, itemId, { imagen: urlData.publicUrl });
  };
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
                <div key={item.id} style={{marginBottom:6}}>
                  <div onClick={()=>setEditId(editId===`${cat.id}:${item.id}`?null:`${cat.id}:${item.id}`)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,cursor:"pointer",
                      background:editId===`${cat.id}:${item.id}`?"#FAF5FF":"var(--surface)",
                      border:`1px solid ${editId===`${cat.id}:${item.id}`?"#E9D5FF":"var(--border)"}`,transition:"all .2s"}}>
                    <div style={{width:38,height:38,borderRadius:8,overflow:"hidden",flexShrink:0,background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border)"}}>
                      {item.imagen?<img src={item.imagen} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:<span style={{color:"var(--text4)",fontSize:16}}>📷</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:item.disponible===false?"var(--text4)":"var(--text)"}}>
                        {item.disponible===false?"🚫 ":""}{item.soloAdmin?"👤 ":""}{item.nombre}
                      </div>
                      <div className="sh" style={{fontSize:13,color:"var(--red)",marginTop:1}}>{fmt(item.precio)}{item.opciones?.length?<span style={{fontSize:10,color:"var(--text4)",marginLeft:6,fontFamily:"'Barlow',sans-serif",fontWeight:400}}>{item.opciones.length} grupo{item.opciones.length!==1?"s":""} de opciones</span>:null}</div>
                    </div>
                    <span style={{fontSize:12,color:"#7C3AED",flexShrink:0}}>✏️</span>
                  </div>
                  {editId===`${cat.id}:${item.id}`&&(
                    <div className="slide-up" style={{background:"var(--surface)",border:"2px solid #E9D5FF",borderRadius:12,padding:14,marginTop:4}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                        <span className="sh" style={{fontSize:14,color:"#7C3AED"}}>✏️ {item.nombre}</span>
                        <button className="btn" onClick={e=>{e.stopPropagation();setEditId(null);}} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 10px",color:"var(--text3)",fontSize:12,fontWeight:600}}>✕ Cerrar</button>
                      </div>
                      {/* Imagen */}
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>IMAGEN</div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <div style={{width:60,height:60,borderRadius:8,overflow:"hidden",flexShrink:0,background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                            {item.imagen?<><img src={item.imagen} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                              <button className="btn" onClick={e=>{e.stopPropagation();updItem(cat.id,item.id,{imagen:""});}} style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:"rgba(0,0,0,.6)",color:"#fff",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                            </>:<span style={{color:"var(--text4)",fontSize:20}}>📷</span>}
                          </div>
                          <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
                            <label className="upload-btn" style={{padding:"7px"}} onClick={e=>e.stopPropagation()}><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(cat.id,item.id,e.target.files[0])}/>📤 Subir foto</label>
                            <input value={item.imagen||""} onChange={e=>{e.stopPropagation();updItem(cat.id,item.id,{imagen:e.target.value});}} onClick={e=>e.stopPropagation()} placeholder="o pegá una URL..."
                              style={{width:"100%",padding:"6px 9px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,fontSize:11,color:"var(--text)"}}/>
                          </div>
                        </div>
                      </div>
                      {/* Nombre */}
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NOMBRE *</div>
                        <input value={item.nombre} onChange={e=>{e.stopPropagation();updItem(cat.id,item.id,{nombre:e.target.value});}} onClick={e=>e.stopPropagation()}
                          style={{width:"100%",padding:"9px 11px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,fontWeight:600,color:"var(--text)"}}/>
                      </div>
                      {/* Descripcion */}
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>DESCRIPCIÓN</div>
                        <textarea value={item.desc||""} onChange={e=>{e.stopPropagation();updItem(cat.id,item.id,{desc:e.target.value});}} onClick={e=>e.stopPropagation()} rows={2}
                          style={{width:"100%",padding:"9px 11px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,resize:"none",lineHeight:1.5,color:"var(--text)"}}/>
                      </div>
                      {/* Precio */}
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>
                          {item.porKilo?"PRECIO POR KG ($)":"PRECIO BASE ($)"} {item.opciones?.length&&!item.porKilo?"(precio mínimo mostrado)":""}
                        </div>
                        <input type="number" min="0" step="100" value={item.precio} onChange={e=>{e.stopPropagation();updItem(cat.id,item.id,{precio:Number(e.target.value)});}} onClick={e=>e.stopPropagation()}
                          style={{width:"100%",padding:"9px 11px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,fontSize:16,fontWeight:800,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
                      </div>
                      {/* Por kilo toggle */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)",marginBottom:6}} onClick={e=>e.stopPropagation()}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>⚖️ Venta por kilo</div>
                          <div style={{fontSize:10,color:"var(--text3)"}}>El admin ingresa el peso en kg al agregar al pedido</div>
                        </div>
                        <div onClick={()=>updItem(cat.id,item.id,{porKilo:!item.porKilo})}
                          style={{width:38,height:21,borderRadius:11,background:item.porKilo?"#D97706":"var(--border)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,marginLeft:10}}>
                          <div style={{width:15,height:15,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:item.porKilo?"20px":"3px",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                        </div>
                      </div>
                      {/* Disponible toggle */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)",marginBottom:6}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>Disponible en el menú</div>
                        <div onClick={()=>updItem(cat.id,item.id,{disponible:item.disponible===false})}
                          style={{width:38,height:21,borderRadius:11,background:item.disponible!==false?"var(--red)":"var(--border)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                          <div style={{width:15,height:15,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:item.disponible!==false?"20px":"3px",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                        </div>
                      </div>
                      {/* Solo Admin toggle */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)",marginBottom:10}} onClick={e=>e.stopPropagation()}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>👤 Solo admin</div>
                          <div style={{fontSize:10,color:"var(--text3)"}}>Oculto en el menú de clientes, visible al hacer pedidos desde admin</div>
                        </div>
                        <div onClick={()=>updItem(cat.id,item.id,{soloAdmin:!item.soloAdmin})}
                          style={{width:38,height:21,borderRadius:11,background:item.soloAdmin?"#7C3AED":"var(--border)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,marginLeft:10}}>
                          <div style={{width:15,height:15,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:item.soloAdmin?"20px":"3px",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                        </div>
                      </div>
                      {/* Opciones */}
                      <div style={{marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                          <div style={{fontSize:10,color:"#7C3AED",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>GRUPOS DE OPCIONES</div>
                          <button className="btn" onClick={e=>{e.stopPropagation();const ng={id:genId(),nombre:"Nuevo grupo",tipo:"radio",obligatorio:false,choices:[]};updItem(cat.id,item.id,{opciones:[...(item.opciones||[]),ng]});}}
                            style={{padding:"4px 10px",borderRadius:7,background:"#FAF5FF",border:"1px solid #E9D5FF",color:"#7C3AED",fontSize:11,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                            + Agregar grupo
                          </button>
                        </div>
                        {(item.opciones||[]).length===0&&<div style={{fontSize:12,color:"var(--text4)",fontStyle:"italic",padding:"6px 0"}}>Sin opciones — el cliente agrega directo al carrito</div>}
                        {(item.opciones||[]).map((grupo,gi)=>(
                          <div key={grupo.id} style={{background:"var(--bg2)",borderRadius:9,padding:"10px 12px",marginBottom:8,border:"1px solid var(--border)"}} onClick={e=>e.stopPropagation()}>
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
                              <input value={grupo.nombre} onChange={e=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,nombre:e.target.value}:g)})}
                                style={{flex:1,padding:"6px 9px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,fontSize:12,fontWeight:600,color:"var(--text)"}}
                                placeholder="Nombre del grupo"/>
                              <select value={grupo.tipo} onChange={e=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,tipo:e.target.value}:g)})}
                                style={{padding:"6px 8px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,fontSize:11,color:"var(--text)"}}>
                                <option value="radio">Una opción</option>
                                <option value="checkbox">Varias opciones</option>
                              </select>
                              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--text3)"}}>
                                <span>Oblig.</span>
                                <div onClick={()=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,obligatorio:!g.obligatorio}:g)})}
                                  style={{width:30,height:17,borderRadius:9,background:grupo.obligatorio?"var(--red)":"var(--border)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                                  <div style={{width:11,height:11,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:grupo.obligatorio?"16px":"3px",transition:"left .2s"}}/>
                                </div>
                              </div>
                              <button className="btn" onClick={()=>updItem(cat.id,item.id,{opciones:item.opciones.filter((_,i)=>i!==gi)})}
                                style={{width:22,height:22,borderRadius:6,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                            </div>
                            {grupo.choices.map((ch,ci)=>(
                              <div key={ch.id} style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
                                <input value={ch.nombre} onChange={e=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,choices:g.choices.map((c,j)=>j===ci?{...c,nombre:e.target.value}:c)}:g)})}
                                  style={{flex:2,padding:"5px 8px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,fontSize:11,color:"var(--text)"}} placeholder="Nombre"/>
                                <input type="number" value={ch.precio} onChange={e=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,choices:g.choices.map((c,j)=>j===ci?{...c,precio:Number(e.target.value)}:c)}:g)})}
                                  style={{width:72,padding:"5px 7px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,fontSize:11,color:"var(--red)",fontWeight:700}} placeholder="Precio"/>
                                <div onClick={()=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,choices:g.choices.map((c,j)=>j===ci?{...c,disponible:c.disponible===false?true:false}:c)}:g)})}
                                  style={{width:28,height:16,borderRadius:8,background:ch.disponible!==false?"#16A34A":"var(--border)",cursor:"pointer",position:"relative",flexShrink:0,transition:"background .2s"}}>
                                  <div style={{width:10,height:10,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:ch.disponible!==false?"15px":"3px",transition:"left .2s"}}/>
                                </div>
                                <button className="btn" onClick={()=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,choices:g.choices.filter((_,j)=>j!==ci)}:g)})}
                                  style={{width:18,height:18,borderRadius:5,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                              </div>
                            ))}
                            <button className="btn" onClick={()=>updItem(cat.id,item.id,{opciones:item.opciones.map((g,i)=>i===gi?{...g,choices:[...g.choices,{id:genId(),nombre:"",precio:0}]}:g)})}
                              style={{width:"100%",padding:"5px 0",borderRadius:6,background:"transparent",border:"1px dashed var(--border2)",color:"var(--text4)",fontSize:11,marginTop:2}}>
                              + opción
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Eliminar */}
                      <button className="btn" onClick={e=>{e.stopPropagation();delItem(cat.id,item.id);}}
                        style={{width:"100%",padding:"8px 0",borderRadius:8,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                        🗑 ELIMINAR ESTE PRODUCTO
                      </button>
                    </div>
                  )}
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
function CajaWidget({ caja, cajaLoading, onAbrir, onCerrar, onAgregarMovimiento, totEf=0, lastCierre }) {
  const [showForm,    setShowForm]    = useState(false);
  const [monto,       setMonto]       = useState("");
  const [notas,       setNotas]       = useState("");
  const [showMov,     setShowMov]     = useState(false);
  const [movTipo,     setMovTipo]     = useState("salida");
  const [movMonto,    setMovMonto]    = useState("");
  const [movDesc,     setMovDesc]     = useState("");
  const [movLoading,  setMovLoading]  = useState(false);
  // Arqueo de billetes (cierre)
  const BILLETES = [100,200,500,1000,2000,5000,10000,20000];
  const [arqueo, setArqueo] = useState(()=>Object.fromEntries(BILLETES.map(b=>[b,0])));
  const arqueoTotal = BILLETES.reduce((s,b)=>s+b*arqueo[b],0);

  const fmt     = (n) => `$${Number(n||0).toLocaleString("es-AR")}`;
  const abierta = caja?.estado === "abierta";
  const movimientos    = caja?.movimientos || [];
  const totalSalidas   = movimientos.filter(m=>m.tipo==="salida").reduce((s,m)=>s+Number(m.monto),0);
  const totalEntradas  = movimientos.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+Number(m.monto),0);
  const saldoInicial   = Number(caja?.monto_apertura || 0);
  const esperado       = saldoInicial + totEf - totalSalidas + totalEntradas;
  const montoReal      = monto !== "" ? Number(monto) : null;
  const diferencia     = montoReal !== null ? montoReal - esperado : null;

  const toggleForm = () => {
    if (!showForm) {
      // Pre-fill: apertura con cierre anterior, cierre con 0
      if (!abierta && lastCierre != null) setMonto(String(lastCierre));
      else setMonto("");
      setNotas("");
      setArqueo(Object.fromEntries(BILLETES.map(b=>[b,0])));
    }
    setShowForm(!showForm);
  };

  const handleSubmit = async () => {
    if (abierta) await onCerrar(monto, notas);
    else         await onAbrir(monto, notas);
    setShowForm(false); setMonto(""); setNotas("");
    setArqueo(Object.fromEntries(BILLETES.map(b=>[b,0])));
  };

  const handleAgregarMov = async () => {
    if (!movMonto || Number(movMonto) <= 0) return;
    setMovLoading(true);
    const result = await onAgregarMovimiento(movTipo, movMonto, movDesc);
    setMovLoading(false);
    if (result && result.ok === false) {
      alert("❌ No se pudo guardar el movimiento:\n" + (result.error||"error desconocido") + "\n\nIntentá de nuevo.");
      return;
    }
    setShowMov(false); setMovMonto(""); setMovDesc(""); setMovTipo("salida");
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
              {caja.monto_apertura>0&&` · Inicial: ${fmt(caja.monto_apertura)}`}
            </div>}
          </div>
        </div>
        <button className="btn" onClick={toggleForm}
          style={{padding:"9px 18px",borderRadius:12,background:abierta?"rgba(220,38,38,.1)":"rgba(22,163,74,.1)",border:`1px solid ${abierta?"#DC2626":"#16A34A"}`,color:abierta?"#DC2626":"#16A34A",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
          {abierta?"CERRAR CAJA":"ABRIR CAJA"}
        </button>
      </div>

      {/* ── Movimientos de efectivo (solo cuando está abierta) ── */}
      {abierta&&(
        <div style={{marginTop:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:11,color:"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>MOVIMIENTOS DE EFECTIVO</div>
            <button className="btn" onClick={()=>setShowMov(!showMov)}
              style={{fontSize:11,padding:"5px 12px",borderRadius:9,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
              + AGREGAR
            </button>
          </div>

          {showMov&&(
            <div className="slide-up" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:14,marginBottom:8}}>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[{k:"salida",l:"↑ RETIRO / SALIDA"},{k:"entrada",l:"↓ ENTRADA"}].map(t=>(
                  <button key={t.k} className="btn" onClick={()=>setMovTipo(t.k)}
                    style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",
                      background:movTipo===t.k?(t.k==="salida"?"#DC2626":"#16A34A"):"var(--bg2)",
                      color:movTipo===t.k?"#fff":"var(--text3)",
                      border:`1px solid ${movTipo===t.k?(t.k==="salida"?"#DC2626":"#16A34A"):"var(--border)"}`}}>
                    {t.l}
                  </button>
                ))}
              </div>
              <input type="number" min="1" value={movMonto} onChange={e=>setMovMonto(e.target.value)} placeholder="Monto $"
                style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:16,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:8}}/>
              <input value={movDesc} onChange={e=>setMovDesc(e.target.value)}
                placeholder={movTipo==="salida"?"Descripción (ej: compra mercadería)":"Descripción (ej: fondo de caja extra)"}
                style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,color:"var(--text)",marginBottom:10}}/>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" onClick={()=>{setShowMov(false);setMovMonto("");setMovDesc("");}}
                  style={{flex:1,padding:"10px 0",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,color:"var(--text3)",fontSize:13,fontWeight:600}}>Cancelar</button>
                <button className="btn" onClick={handleAgregarMov} disabled={movLoading||!movMonto}
                  style={{flex:2,padding:"10px 0",background:movTipo==="salida"?"#DC2626":"#16A34A",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {movLoading?"...":(movTipo==="salida"?"CONFIRMAR RETIRO":"CONFIRMAR ENTRADA")}
                </button>
              </div>
            </div>
          )}

          {movimientos.length>0?(
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
              {movimientos.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<movimientos.length-1?"1px solid var(--border)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16,lineHeight:1}}>{m.tipo==="salida"?"↑":"↓"}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:m.tipo==="salida"?"#DC2626":"#16A34A",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
                        {m.tipo==="salida"?"RETIRO":"ENTRADA"}
                      </div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{m.hora} · {m.descripcion}</div>
                    </div>
                  </div>
                  <span className="sh" style={{fontSize:15,color:m.tipo==="salida"?"#DC2626":"#16A34A"}}>
                    {m.tipo==="salida"?"-":"+"}{fmt(m.monto)}
                  </span>
                </div>
              ))}
              {(totalSalidas>0||totalEntradas>0)&&(
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 14px",background:"var(--bg2)",borderTop:"1px solid var(--border)"}}>
                  {totalEntradas>0&&<span style={{fontSize:12,color:"#16A34A",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>Entradas: +{fmt(totalEntradas)}</span>}
                  {totalSalidas>0&&<span style={{fontSize:12,color:"#DC2626",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>Retiros: -{fmt(totalSalidas)}</span>}
                </div>
              )}
            </div>
          ):(
            <div style={{textAlign:"center",padding:"10px 0",color:"var(--text4)",fontSize:12}}>Sin movimientos registrados hoy</div>
          )}
        </div>
      )}

      {/* Formulario apertura/cierre */}
      {showForm&&(
        <div className="slide-up" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:16,marginTop:8}}>
          <div className="sh" style={{fontSize:16,color:"var(--text)",marginBottom:14}}>{abierta?"CERRAR CAJA":"ABRIR CAJA"}</div>

          {/* Arqueo de billetes (solo al cerrar) */}
          {abierta&&(
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:10}}>ARQUEO DE BILLETES</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                {BILLETES.map(b=>(
                  <div key={b} style={{display:"flex",alignItems:"center",gap:6,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,padding:"6px 10px"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--text2)",fontFamily:"'Barlow Condensed',sans-serif",minWidth:52}}>${b.toLocaleString("es-AR")}</span>
                    <span style={{color:"var(--text4)",fontSize:12}}>×</span>
                    <input type="number" min="0" value={arqueo[b]||""} onChange={e=>{const v=Math.max(0,parseInt(e.target.value)||0);setArqueo(p=>({...p,[b]:v}));}}
                      placeholder="0" style={{width:46,padding:"5px 6px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,fontSize:14,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif",textAlign:"center"}}/>
                    <span style={{fontSize:11,color:"var(--text4)",flex:1,textAlign:"right",fontFamily:"'Barlow Condensed',sans-serif"}}>{arqueo[b]>0?fmt(b*arqueo[b]):""}</span>
                  </div>
                ))}
              </div>
              {arqueoTotal>0&&(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>TOTAL ARQUEO</span>
                  <span className="sh" style={{fontSize:20,color:"#2563EB"}}>{fmt(arqueoTotal)}</span>
                </div>
              )}
              {arqueoTotal>0&&arqueoTotal!==Number(monto||0)&&(
                <button className="btn" onClick={()=>setMonto(String(arqueoTotal))}
                  style={{width:"100%",padding:"8px 0",borderRadius:9,background:"#2563EB",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:10,border:"none"}}>
                  USAR TOTAL ARQUEO COMO MONTO DE CIERRE
                </button>
              )}
              <div style={{borderTop:"1px solid var(--border)",paddingTop:10}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:"var(--text3)",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:8}}>RESUMEN ESPERADO</div>
                {[
                  {l:"Saldo inicial",     v:fmt(saldoInicial),   c:"#2563EB"},
                  {l:"+ Ventas efectivo", v:fmt(totEf),          c:"#16A34A"},
                  ...(totalEntradas>0?[{l:"+ Entradas extra",    v:fmt(totalEntradas), c:"#16A34A"}]:[]),
                  ...(totalSalidas>0? [{l:"- Retiros",           v:fmt(totalSalidas),  c:"#DC2626"}]:[]),
                ].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:12,color:"var(--text3)"}}>{r.l}</span>
                    <span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:"'Barlow Condensed',sans-serif"}}>{r.v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,marginTop:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>ESPERADO EN CAJA</span>
                  <span className="sh" style={{fontSize:18,color:"var(--text)"}}>{fmt(esperado)}</span>
                </div>
                {diferencia!==null&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:6,marginTop:6,borderTop:"1px solid var(--border)"}}>
                    <span style={{fontSize:12,color:"var(--text3)"}}>Diferencia</span>
                    <span className="sh" style={{fontSize:15,color:diferencia===0?"#16A34A":diferencia>0?"#D97706":"#DC2626"}}>
                      {diferencia>0?"+":""}{fmt(diferencia)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
              {abierta?"EFECTIVO REAL EN CAJA ($)":"EFECTIVO INICIAL EN CAJA ($)"}
            </div>
            {!abierta&&lastCierre!=null&&lastCierre>0&&monto===String(lastCierre)&&(
              <div style={{fontSize:10,color:"#2563EB",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif"}}>Pre-cargado del cierre anterior ({fmt(lastCierre)})</div>
            )}
            <input type="number" min="0" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0"
              style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:18,fontWeight:700,color:"var(--text)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>NOTAS (opcional)</div>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} placeholder="Observaciones del día..."
              style={{width:"100%",padding:"11px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,resize:"none",lineHeight:1.5}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn" onClick={()=>{setShowForm(false);setMonto("");setNotas("");setArqueo(Object.fromEntries(BILLETES.map(b=>[b,0])));}}
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


/* ══ CONFIG EDITOR ════════════════════════════════════════════ */
function ConfigEditor({ appConfig, saveAppConfig, menu=[] }) {
  const [cfg,     setCfg]     = useState({...appConfig});
  const [saved,   setSaved]   = useState(false);
  const [newRep,  setNewRep]  = useState("");

  const save = () => {
    saveAppConfig(cfg);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };
  const addRep = () => {
    const name = newRep.trim();
    if (!name || cfg.repartidores.includes(name)) return;
    setCfg(p=>({...p, repartidores:[...p.repartidores, name]}));
    setNewRep("");
  };
  const removeRep = (name) => setCfg(p=>({...p, repartidores:p.repartidores.filter(r=>r!==name)}));

  const Field = ({label, children}) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>{label}</div>
      {children}
    </div>
  );
  const Input = ({val, onChange, placeholder=""}) => (
    <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,color:"var(--text)"}}/>
  );

  return (
    <div className="fade-in" style={{padding:14,paddingBottom:40}}>
      <div style={{marginBottom:20}}>
        <div className="sh" style={{fontSize:24,color:"var(--text)"}}>CONFIGURACIÓN</div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Los cambios se aplican al guardar</div>
      </div>

      {/* Repartidores */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"#7C3AED",letterSpacing:1,marginBottom:14}}>🏍️ REPARTIDORES</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
          {cfg.repartidores.map(r=>(
            <div key={r} style={{display:"flex",alignItems:"center",gap:6,background:"#FAF5FF",border:"1px solid #E9D5FF",borderRadius:20,padding:"6px 12px"}}>
              <span style={{fontSize:13,fontWeight:600,color:"#7C3AED"}}>{r}</span>
              <button className="btn" onClick={()=>removeRep(r)}
                style={{background:"none",color:"#A78BFA",fontSize:14,lineHeight:1,padding:"0 2px",fontWeight:700}}>×</button>
            </div>
          ))}
          {cfg.repartidores.length===0&&<div style={{fontSize:13,color:"var(--text4)"}}>Sin repartidores cargados</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={newRep} onChange={e=>setNewRep(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRep()}
            placeholder="Nombre del repartidor..."
            style={{flex:1,padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,color:"var(--text)"}}/>
          <button className="btn" onClick={addRep}
            style={{padding:"10px 18px",borderRadius:10,background:"#7C3AED",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
            + AGREGAR
          </button>
        </div>
      </div>

      {/* Horario */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",letterSpacing:1,marginBottom:14}}>⏰ HORARIO</div>
        <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>APERTURA</div>
            <div style={{display:"flex",gap:6}}>
              <input type="number" min="0" max="23" value={cfg.abreH} onChange={e=>setCfg(p=>({...p,abreH:Number(e.target.value),horario:`${String(e.target.value).padStart(2,"0")}:${String(p.abreM).padStart(2,"0")} a ${String(p.cierraH).padStart(2,"0")}:${String(p.cierraM).padStart(2,"0")}`}))}
                style={{width:60,padding:"10px 8px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,textAlign:"center",color:"var(--text)"}}/>
              <span style={{fontSize:18,color:"var(--text3)",alignSelf:"center"}}>:</span>
              <input type="number" min="0" max="59" value={cfg.abreM} onChange={e=>setCfg(p=>({...p,abreM:Number(e.target.value),horario:`${String(p.abreH).padStart(2,"0")}:${String(e.target.value).padStart(2,"0")} a ${String(p.cierraH).padStart(2,"0")}:${String(p.cierraM).padStart(2,"0")}`}))}
                style={{width:60,padding:"10px 8px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,textAlign:"center",color:"var(--text)"}}/>
            </div>
          </div>
          <div style={{fontSize:18,color:"var(--text3)",paddingBottom:10}}>→</div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>CIERRE</div>
            <div style={{display:"flex",gap:6}}>
              <input type="number" min="0" max="23" value={cfg.cierraH} onChange={e=>setCfg(p=>({...p,cierraH:Number(e.target.value),horario:`${String(p.abreH).padStart(2,"0")}:${String(p.abreM).padStart(2,"0")} a ${String(e.target.value).padStart(2,"0")}:${String(p.cierraM).padStart(2,"0")}`}))}
                style={{width:60,padding:"10px 8px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,textAlign:"center",color:"var(--text)"}}/>
              <span style={{fontSize:18,color:"var(--text3)",alignSelf:"center"}}>:</span>
              <input type="number" min="0" max="59" value={cfg.cierraM} onChange={e=>setCfg(p=>({...p,cierraM:Number(e.target.value),horario:`${String(p.abreH).padStart(2,"0")}:${String(p.abreM).padStart(2,"0")} a ${String(p.cierraH).padStart(2,"0")}:${String(e.target.value).padStart(2,"0")}`}))}
                style={{width:60,padding:"10px 8px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,textAlign:"center",color:"var(--text)"}}/>
            </div>
          </div>
          <div style={{flex:2,paddingBottom:2}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>TEXTO HORARIO</div>
            <input value={cfg.horario} onChange={e=>setCfg(p=>({...p,horario:e.target.value}))} placeholder="Ej: 16:30 a 23:30"
              style={{width:"100%",padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,color:"var(--text)"}}/>
          </div>
        </div>
      </div>

      {/* Web habilitada */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",letterSpacing:1,marginBottom:14}}>🌐 ESTADO DE LA WEB</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:cfg.webHabilitada?"#F0FDF4":"#FFF1F2",border:`1px solid ${cfg.webHabilitada?"#BBF7D0":"#FECDD3"}`,borderRadius:12,cursor:"pointer"}}
          onClick={()=>setCfg(p=>({...p,webHabilitada:!p.webHabilitada}))}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:cfg.webHabilitada?"#16A34A":"#CC1F1F"}}>{cfg.webHabilitada?"🟢 Web habilitada":"🔴 Web deshabilitada"}</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{cfg.webHabilitada?"Los clientes pueden ver el menú y hacer pedidos":"La web muestra pantalla de cerrado aunque sea horario de apertura"}</div>
          </div>
          <div style={{width:44,height:24,borderRadius:12,background:cfg.webHabilitada?"#16A34A":"#DC2626",position:"relative",transition:"background .2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:cfg.webHabilitada?22:3,width:18,height:18,borderRadius:9,background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",letterSpacing:1,marginBottom:14}}>💳 PAGOS Y COMISIONES</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:cfg.tarjetaHabilitada?"#F0FDF4":"var(--bg2)",border:`1px solid ${cfg.tarjetaHabilitada?"#BBF7D0":"var(--border)"}`,borderRadius:12,marginBottom:12,cursor:"pointer"}}
          onClick={()=>setCfg(p=>({...p,tarjetaHabilitada:!p.tarjetaHabilitada}))}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>💳 Tarjeta / Mercado Pago</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Habilitar como método de pago en el checkout</div>
          </div>
          <div style={{width:44,height:24,borderRadius:12,background:cfg.tarjetaHabilitada?"#16A34A":"var(--border)",position:"relative",transition:"background .2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:cfg.tarjetaHabilitada?22:3,width:18,height:18,borderRadius:9,background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>% RECARGO MP (sin el %)</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="number" min="0" max="30" step="0.01" value={(cfg.recargoMP*100).toFixed(2)}
                onChange={e=>setCfg(p=>({...p,recargoMP:Number(e.target.value)/100}))}
                style={{flex:1,padding:"10px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:14,color:"var(--text)"}}/>
              <span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alias y contacto */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",letterSpacing:1,marginBottom:14}}>📲 CONTACTO Y ALIASES</div>
        <Field label="WHATSAPP (con código de país, sin +)">
          <Input val={cfg.whatsapp} onChange={v=>setCfg(p=>({...p,whatsapp:v}))} placeholder="5491124832305"/>
        </Field>
        <Field label="ALIAS BANCO">
          <Input val={cfg.aliasBanco} onChange={v=>setCfg(p=>({...p,aliasBanco:v}))} placeholder="ALIAS.BANCO"/>
        </Field>
        <Field label="ALIAS MERCADO PAGO">
          <Input val={cfg.aliasMP} onChange={v=>setCfg(p=>({...p,aliasMP:v}))} placeholder="alias.mp"/>
        </Field>
        <Field label="TITULAR DE LA CUENTA">
          <Input val={cfg.titular} onChange={v=>setCfg(p=>({...p,titular:v}))} placeholder="Nombre Apellido"/>
        </Field>
      </div>

      {/* Promociones */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:16,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",letterSpacing:1,marginBottom:4}}>🔥 PROMOCIONES</div>
        <div style={{fontSize:12,color:"var(--text3)",marginBottom:12}}>Aparecen destacados arriba del menú del cliente.</div>
        {(cfg.promociones||[]).map((p,i)=>{
          const allItems = menu.flatMap(c=>c.items);
          const itemEncontrado = allItems.find(it=>it.id===p.itemId);
          // Get obligatorio radio group for variant selection
          const grupoOblig = itemEncontrado?.opciones?.find(g=>g.tipo==="radio"&&g.obligatorio);
          const varianteSelec = grupoOblig?.choices?.find(ch=>ch.id===p.varianteId);
          return(
            <div key={i} style={{background:"var(--bg2)",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid var(--border)"}}>
              {/* Buscador por nombre */}
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>PRODUCTO</div>
                <div style={{position:"relative"}}>
                  <input
                    value={p._busqueda!==undefined?p._busqueda:(itemEncontrado?itemEncontrado.nombre:"")}
                    onChange={e=>setCfg(c=>({...c,promociones:c.promociones.map((x,j)=>j===i?{...x,_busqueda:e.target.value,itemId:"",varianteId:""}:x)}))}
                    placeholder="Escribí el nombre del producto..."
                    style={{width:"100%",padding:"9px 11px",background:"var(--surface)",border:`1px solid ${itemEncontrado?"#16A34A":"var(--border)"}`,borderRadius:8,fontSize:13,color:"var(--text)"}}/>
                  {itemEncontrado&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#16A34A",fontSize:14}}>✓</span>}
                  {p._busqueda&&!itemEncontrado&&(()=>{
                    const resultados = allItems.filter(it=>it.nombre.toLowerCase().includes(p._busqueda.toLowerCase())).slice(0,5);
                    if(!resultados.length) return <div style={{fontSize:12,color:"var(--text4)",padding:"6px 0"}}>Sin resultados</div>;
                    return(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.1)",marginTop:2}}>
                        {resultados.map(it=>(
                          <div key={it.id} onClick={()=>setCfg(c=>({...c,promociones:c.promociones.map((x,j)=>j===i?{...x,itemId:it.id,varianteId:"",_busqueda:undefined}:x)}))}
                            style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid var(--border)",fontSize:13,color:"var(--text)"}}>
                            {it.nombre} <span style={{fontSize:11,color:"var(--text4)"}}>· {fmt(it.precio)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* Selector de variante — solo si el producto tiene grupo obligatorio */}
              {grupoOblig&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>VARIANTE ({grupoOblig.nombre})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {grupoOblig.choices.filter(ch=>ch.disponible!==false).map(ch=>(
                      <button key={ch.id} className="btn" onClick={()=>setCfg(c=>({...c,promociones:c.promociones.map((x,j)=>j===i?{...x,varianteId:ch.id}:x)}))}
                        style={{padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:600,
                          background:p.varianteId===ch.id?"var(--red-light)":"var(--surface)",
                          border:`1px solid ${p.varianteId===ch.id?"var(--red)":"var(--border)"}`,
                          color:p.varianteId===ch.id?"var(--red)":"var(--text3)"}}>
                        {ch.nombre} · {fmt(ch.precio)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>PRECIO PROMO ($)</div>
                  <input type="number" value={p.precioPromo||""} onChange={e=>setCfg(c=>({...c,promociones:c.promociones.map((x,j)=>j===i?{...x,precioPromo:Number(e.target.value)||null}:x)}))}
                    placeholder={varianteSelec?fmt(varianteSelec.precio):"Vacío = precio normal"}
                    style={{width:"100%",padding:"7px 9px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,fontSize:13,fontWeight:700,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif"}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>ETIQUETA</div>
                  <input value={p.etiqueta||""} onChange={e=>setCfg(c=>({...c,promociones:c.promociones.map((x,j)=>j===i?{...x,etiqueta:e.target.value}:x)}))}
                    placeholder="Ej: 2x1, -20%, Nuevo"
                    style={{width:"100%",padding:"7px 9px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,fontSize:12,color:"var(--text)"}}/>
                </div>
                <button className="btn" onClick={()=>setCfg(c=>({...c,promociones:c.promociones.filter((_,j)=>j!==i)}))}
                  style={{width:32,height:32,borderRadius:7,background:"#FFF1F2",border:"1px solid #FECDD3",color:"#CC1F1F",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginBottom:1}}>✕</button>
              </div>
            </div>
          );
        })}
        <button className="btn" onClick={()=>setCfg(c=>({...c,promociones:[...(c.promociones||[]),{itemId:"",varianteId:"",precioPromo:null,etiqueta:""}]}))}
          style={{width:"100%",padding:"9px 0",borderRadius:10,background:"var(--red-light)",border:"1px dashed var(--red-border)",color:"var(--red)",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
          + AGREGAR PROMOCIÓN
        </button>
      </div>

      <button className="btn" onClick={save}
        style={{width:"100%",padding:"15px 0",borderRadius:14,background:saved?"#16A34A":"var(--red)",color:"#fff",fontSize:17,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,boxShadow:saved?"0 6px 20px rgba(22,163,74,.3)":"0 6px 20px var(--red-glow)"}}>
        {saved?"✓ GUARDADO":"GUARDAR CONFIGURACIÓN"}
      </button>
    </div>
  );
}

/* ══ NUEVO PEDIDO DESDE ADMIN ═════════════════════════════════ */
function NuevoPedidoAdmin({ menu, mesaId, onClose, onOrderPlaced, appConfig=CONFIG }) {
  const menuVis = menu.map(c=>({...c,items:c.items.filter(i=>i.disponible!==false)})).filter(c=>c.items.length>0);
  const [cart,     setCart]     = useState([]);
  const [form,     setForm]     = useState({nombre:"",telefono:"",tipo:mesaId?"mesa":"retiro",calle:"",numero:"",entreCalle:"",piso:"",barrio:"",pago:"efectivo",notas:"",dni:"",envio:0,zona_envio:"",horaEntrega:""});
  const [loading,  setLoading]  = useState(false);
  const [dniFound, setDniFound] = useState(false);
  const [search,   setSearch]   = useState("");
  const [lastOrders, setLastOrders] = useState([]);

  const [modalAdminItem, setModalAdminItem] = useState(null);
  const [modalKiloItem, setModalKiloItem] = useState(null);
  const [kiloWeight, setKiloWeight] = useState("");
  const [descTipo, setDescTipo] = useState("monto"); // 'monto' | 'porcentaje'
  const [descValor, setDescValor] = useState("");
  const add = (item, selecciones=null, precioUnitario=null) => {
    const key = getCartKey(item, selecciones);
    const precio = precioUnitario ?? item.precio;
    setCart(p => { const ex=p.find(c=>c.cartKey===key); return ex?p.map(c=>c.cartKey===key?{...c,qty:c.qty+1}:c):[...p,{item,qty:1,selecciones,precioUnitario:precio,cartKey:key,catId:item.catId||""}]; });
  };
  const addKilo = (item, kg) => {
    const kgNum = parseFloat(kg);
    if (!kgNum || kgNum<=0) return;
    const precioUnitario = Math.round(kgNum * item.precio);
    const itemConPeso = {...item, nombre:`${item.nombre} (${kgNum} kg)`};
    const cartKey = item.id + "-kilo-" + Date.now();
    setCart(p => [...p, {item:itemConPeso, qty:1, selecciones:null, precioUnitario, cartKey, catId:item.catId||"", kiloQty:kgNum}]);
    setModalKiloItem(null); setKiloWeight("");
  };
  const setQty = (key,q) => setCart(p => q<=0?p.filter(c=>c.cartKey!==key):p.map(c=>c.cartKey===key?{...c,qty:q}:c));
  const getQty = (item) => { if(!item.opciones?.length&&!item.porKilo) return cart.find(c=>c.item.id===item.id&&!c.selecciones?.length)?.qty||0; return 0; };
  const handleAddAdminItem = (item) => { if(item.porKilo) { setModalKiloItem(item); setKiloWeight(""); } else if(item.opciones?.length) { setModalAdminItem(item); } else { add(item); } };
  const subtotalCart = cart.reduce((s,c)=>s+(c.precioUnitario??c.item.precio)*c.qty,0);
  const descValorNum = Number(descValor)||0;
  const descuentoMonto = Math.min(
    subtotalCart,
    Math.max(0, Math.round(descTipo==="porcentaje" ? subtotalCart*descValorNum/100 : descValorNum))
  );
  const total  = subtotalCart - descuentoMonto;
  const fmt    = (n) => `$${Number(n).toLocaleString("es-AR")}`;

  const menuFiltered = search.trim()
    ? menuVis.map(c=>({...c,items:c.items.filter(i=>i.nombre.toLowerCase().includes(search.toLowerCase()))})).filter(c=>c.items.length>0)
    : menuVis;

  const lookupDni = async (val, isPhone=false) => {
    setForm(p=>({...p,[isPhone?"telefono":"dni"]:val}));
    if (val.length < 6) { setDniFound(false); setLastOrders([]); return; }
    const {data} = await supabase.from("customers").select("*").or(`dni.eq.${val},telefono.eq.${val}`).limit(1);
    if (data && data.length > 0) {
      const c = data[0];
      setDniFound(true);
      const {calle:pc2, nro:pn2, entreCalle:pec2, barrio:pb2} = parseDireccion(c.direccion);
      const barrioLower2 = (pb2||"").toLowerCase();
      const zonaAdmin = pc2 ? ZONAS_ENVIO.find(z => barrioLower2.includes(z.nombre.toLowerCase()) || z.nombre.toLowerCase().includes(barrioLower2.split(" ")[0])) : null;
      setForm(p=>({...p,
        nombre:     p.nombre     || c.nombre   || "",
        telefono:   p.telefono   || c.telefono || "",
        calle:      p.calle      || pc2  || "",
        numero:     p.numero     || pn2  || "",
        entreCalle: p.entreCalle || pec2 || "",
        barrio:     p.barrio     || pb2  || "",
        tipo:       pc2 ? "delivery" : p.tipo,
        envio:      p.envio || (zonaAdmin?.precio||0),
        zona_envio: p.zona_envio || (zonaAdmin?`Grupo ${zonaAdmin.grupo}`:""),
      }));
      // Load last 5 orders for this customer
      const {data:ords} = await supabase.from("orders").select("*")
        .or(`nombre.ilike.${c.nombre},telefono.eq.${c.telefono||"__none__"}`)
        .eq("status","entregado")
        .order("created_at",{ascending:false})
        .limit(5);
      setLastOrders(ords||[]);
    } else { setDniFound(false); setLastOrders([]); }
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    if (!mesaId && !form.nombre.trim()) return;
    setLoading(true);
    const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    const {entreCalle:ec2, horaEntrega:he2, ...formRest2} = form;
    const orderNombre = form.nombre.trim() || (mesaId ? 'Mesa '+(mesaId.replace('mv','V').replace('m','')) : '');
    let mesaSession2 = 1;
    if (mesaId) {
      const {data:md2} = await supabase.from("mesas").select("session_num").eq("id",mesaId).maybeSingle();
      mesaSession2 = md2?.session_num || 1;
    }
    const envioAdmin = form.tipo==="delivery" ? (form.envio||0) : 0;
    const descLabel = descuentoMonto>0
      ? `Desc: -${fmt(descuentoMonto)}${descTipo==="porcentaje"?` (${descValorNum}%)`:""}`
      : "";
    const notasAdmin = [he2?`⏰ ${he2}`:"", descLabel, form.notas].filter(Boolean).join(" | ");
    const order = { id:genId(), ...formRest2, nombre:orderNombre, entrecalle:ec2||"", notas:notasAdmin, items:cart, subtotal:subtotalCart, total:total+envioAdmin, envio:envioAdmin, source:"admin", status:"nuevo", created_at:Date.now(), mesa_id: mesaId||"", mesa_session: mesaSession2 };
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
                const itemConCat = {...item, catId:cat.id};
                const qty=getQty(itemConCat);
                return(
                  <div key={item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 4px",borderBottom:"1px solid var(--border)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{item.nombre}</div>
                      <div style={{fontSize:12,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{fmt(item.precio)}{item.porKilo?<span style={{fontSize:10,color:"var(--text4)",marginLeft:3}}>/kg</span>:null}</div>
                    </div>
                    {item.porKilo
                      ?<button className="btn" onClick={()=>handleAddAdminItem(itemConCat)} style={{padding:"0 10px",height:32,borderRadius:8,background:"#FEF3C7",border:"1px solid #FCD34D",color:"#D97706",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,gap:4}}>⚖️ kg</button>
                      :qty===0
                        ?<button className="btn" onClick={()=>handleAddAdminItem(itemConCat)} style={{width:32,height:32,borderRadius:8,background:"var(--red-light)",border:"1px solid var(--red-border)",color:"var(--red)",fontSize:item.opciones?.length?14:20,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{item.opciones?.length?"Ver":"+"}
                        </button>
                        :<div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button className="btn" onClick={()=>setQty(item.id,qty-1)} style={{width:28,height:28,borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontSize:14,fontWeight:800,minWidth:18,textAlign:"center",color:"var(--red)"}}>{qty}</span>
                          <button className="btn" onClick={()=>handleAddAdminItem(itemConCat)} style={{width:28,height:28,borderRadius:7,background:"var(--red)",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
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
            <div key={c.cartKey} style={{borderBottom:"1px solid #BBF7D0",padding:"5px 0"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13,gap:8}}>
                <span style={{flex:1,color:"var(--text2)"}}>{c.item.nombre}</span>
                <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                  {c.kiloQty!=null
                    ?<button className="btn" onClick={()=>setQty(c.cartKey,0)} style={{width:22,height:22,borderRadius:6,background:"#FEE2E2",border:"1px solid #FCA5A5",color:"#DC2626",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
                    :<><button className="btn" onClick={()=>setQty(c.cartKey,c.qty-1)} style={{width:22,height:22,borderRadius:6,background:"#DCFCE7",border:"1px solid #86EFAC",color:"#16A34A",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                    <span style={{fontSize:13,fontWeight:800,minWidth:16,textAlign:"center",color:"var(--text)"}}>{c.qty}</span>
                    <button className="btn" onClick={()=>setQty(c.cartKey,c.qty+1)} style={{width:22,height:22,borderRadius:6,background:"#16A34A",color:"#fff",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button></>
                  }
                  <span style={{fontWeight:700,minWidth:52,textAlign:"right"}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
                </div>
              </div>
              {c.selecciones&&<div style={{fontSize:11,color:"#166534",paddingLeft:2}}>{seleccionesLabel(c.item,c.selecciones)}</div>}
            </div>
          ))}
          {/* Descuento */}
          <div style={{marginTop:10,padding:"10px 0 4px",borderTop:"1px dashed #BBF7D0"}}>
            <div style={{fontSize:10,color:"#15803D",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>DESCUENTO (opcional)</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button className="btn" onClick={()=>setDescTipo("monto")}
                style={{padding:"8px 0",width:36,borderRadius:8,fontSize:13,fontWeight:800,background:descTipo==="monto"?"#16A34A":"#fff",color:descTipo==="monto"?"#fff":"#16A34A",border:"1px solid #86EFAC",fontFamily:"'Barlow Condensed',sans-serif"}}>$</button>
              <button className="btn" onClick={()=>setDescTipo("porcentaje")}
                style={{padding:"8px 0",width:36,borderRadius:8,fontSize:13,fontWeight:800,background:descTipo==="porcentaje"?"#16A34A":"#fff",color:descTipo==="porcentaje"?"#fff":"#16A34A",border:"1px solid #86EFAC",fontFamily:"'Barlow Condensed',sans-serif"}}>%</button>
              <input type="number" min="0" max={descTipo==="porcentaje"?"100":undefined} value={descValor}
                onChange={e=>setDescValor(e.target.value)}
                placeholder={descTipo==="porcentaje"?"Ej: 10":"Ej: 2000"}
                style={{flex:1,padding:"8px 12px",background:"#fff",border:"1px solid #86EFAC",borderRadius:8,fontSize:14,fontWeight:700,color:"#15803D",fontFamily:"'Barlow Condensed',sans-serif"}}/>
              {descuentoMonto>0&&(
                <button className="btn" onClick={()=>setDescValor("")}
                  style={{padding:"8px 10px",borderRadius:8,background:"#FEE2E2",border:"1px solid #FCA5A5",color:"#DC2626",fontSize:12,fontWeight:700}}>×</button>
              )}
            </div>
          </div>
          {descuentoMonto>0&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0 0",fontSize:13,color:"#15803D"}}>
                <span>Subtotal</span><span>{fmt(subtotalCart)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 0",fontSize:13,color:"#16A34A",fontWeight:700}}>
                <span>Descuento{descTipo==="porcentaje"?` (${descValorNum}%)`:""}</span>
                <span>− {fmt(descuentoMonto)}</span>
              </div>
            </>
          )}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontWeight:800,fontSize:16,fontFamily:"'Barlow Condensed',sans-serif"}}>
            <span>TOTAL</span><span style={{color:"var(--red)"}}>{fmt(total)}</span>
          </div>
        </div>
      )}

      {/* Datos del cliente */}
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:14,marginBottom:14}}>
        <div className="sh" style={{fontSize:13,color:"var(--red)",marginBottom:12,letterSpacing:1}}>DATOS DEL CLIENTE</div>
        {!mesaId&&<div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>DNI</div>
            <div style={{position:"relative"}}>
              <input value={form.dni} onChange={e=>lookupDni(e.target.value)} placeholder="DNI"
                style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:`1px solid ${dniFound?"#16A34A":"var(--border)"}`,borderRadius:10,fontSize:13}}/>
              {dniFound&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#16A34A",fontSize:14}}>✓</span>}
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>TELÉFONO</div>
            <div style={{position:"relative"}}>
              <input value={form.telefono} onChange={e=>lookupDni(e.target.value,true)} placeholder="Teléfono"
                style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:`1px solid ${dniFound?"#16A34A":"var(--border)"}`,borderRadius:10,fontSize:13}}/>
              {dniFound&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#16A34A",fontSize:14}}>✓</span>}
            </div>
          </div>
        </div>}
        {/* Últimos pedidos del cliente */}
        {lastOrders.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>REPETIR PEDIDO ANTERIOR</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {lastOrders.map(o=>(
                <button key={o.id} className="btn" onClick={()=>{
                  setCart(o.items||[]);
                }} style={{padding:"8px 12px",borderRadius:10,background:"var(--bg2)",border:"1px solid var(--border)",textAlign:"left",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>
                        {o.items?.map(c=>`${c.qty}× ${c.item.nombre}`).join(", ").slice(0,50)}{o.items?.length>2?"...":""}
                      </div>
                      <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>
                        {new Date(Number(o.created_at)).toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit"})} · {o.items?.reduce((s,c)=>s+c.qty,0)} items
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--red)",flexShrink:0,marginLeft:8}}>${Number(o.total).toLocaleString("es-AR")}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{mesaId?"NOMBRE (opcional)":"NOMBRE *"}</div>
          <input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Nombre del cliente"
            style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
        </div>
        {!mesaId&&<>
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
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Entre calles (opcional)</div>
                <input value={form.entreCalle} onChange={e=>setForm(p=>({...p,entreCalle:e.target.value}))} placeholder="Ej: 150 y 151"
                  style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Piso / Depto</div>
                  <input value={form.piso} onChange={e=>setForm(p=>({...p,piso:e.target.value}))} placeholder="Ej: 3° B"
                    style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
                </div>
                <div style={{flex:2}}>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Barrio / Localidad</div>
                  <input value={form.barrio} onChange={e=>{
                    const b=e.target.value;
                    const bl=b.toLowerCase();
                    const z=ZONAS_ENVIO.find(z=>bl.includes(z.nombre.toLowerCase())||z.nombre.toLowerCase().includes(bl.split(" ")[0])||bl.length>0&&bl.split(" ")[0].length>3&&z.nombre.toLowerCase().startsWith(bl.split(" ")[0]));
                    setForm(p=>({...p,barrio:b,envio:z?z.precio:p.envio,zona_envio:z?`Grupo ${z.grupo}`:p.zona_envio}));
                  }} placeholder="Ej: Hudson, Berazategui..."
                    style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13}}/>
                </div>
              </div>
              {/* Zona de envío */}
              <div style={{marginTop:8}}>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>ZONA DE ENVÍO</div>
                <div style={{display:"flex",gap:6}}>
                  {[{g:1,p:4000},{g:2,p:5000},{g:3,p:6000}].map(({g,p})=>(
                    <button key={g} className="btn" onClick={()=>setForm(f=>({...f,zona_envio:`Grupo ${g}`,envio:p}))}
                      style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:12,fontWeight:700,
                        background:form.zona_envio===`Grupo ${g}`?"var(--red-light)":"var(--bg2)",
                        border:`2px solid ${form.zona_envio===`Grupo ${g}`?"var(--red)":"var(--border)"}`,
                        color:form.zona_envio===`Grupo ${g}`?"var(--red)":"var(--text3)",
                        fontFamily:"'Barlow Condensed',sans-serif"}}>
                      G{g} · ${p.toLocaleString("es-AR")}
                    </button>
                  ))}
                </div>
                {form.zona_envio&&<div style={{fontSize:11,color:"#16A34A",marginTop:5,fontWeight:600}}>✓ {form.zona_envio} · Envío: ${Number(form.envio).toLocaleString("es-AR")}</div>}
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
        </>}
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>HORA DE ENTREGA / RETIRO</div>
          <select value={form.horaEntrega} onChange={e=>setForm(p=>({...p,horaEntrega:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,color:"var(--text)"}}>
            <option value="">Lo antes posible</option>
            {(()=>{const s=[];let h=appConfig.abreH,m=appConfig.abreM;while(h<appConfig.cierraH||(h===appConfig.cierraH&&m<=appConfig.cierraM)){s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);m+=30;if(m>=60){h++;m-=60;}}return s;})().map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>NOTAS</div>
          <textarea value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} placeholder="Aclaraciones..." rows={2}
            style={{width:"100%",padding:"10px 12px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:13,resize:"none",lineHeight:1.5}}/>
        </div>
      </div>

      <button className="btn" onClick={placeOrder} disabled={!cart.length||((!mesaId)&&!form.nombre.trim())||loading}
        style={{width:"100%",padding:"15px 0",borderRadius:14,fontSize:17,fontWeight:800,background:(cart.length&&(mesaId||form.nombre.trim()))?"#16A34A":"var(--border)",color:(cart.length&&(mesaId||form.nombre.trim()))?"#fff":"var(--text4)",boxShadow:(cart.length&&(mesaId||form.nombre.trim()))?"0 6px 20px rgba(22,163,74,.3)":"none",transition:"all .2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
        {loading?"CREANDO PEDIDO...":`CONFIRMAR PEDIDO · ${fmt(total)}`}
      </button>
      {modalAdminItem&&<ItemModal item={modalAdminItem} onClose={()=>setModalAdminItem(null)} onConfirm={(sel,precio,qty=1)=>{for(let i=0;i<qty;i++)add(modalAdminItem,sel,precio);setModalAdminItem(null);}}/>}
      {modalKiloItem&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"var(--surface)",borderRadius:18,padding:24,width:"100%",maxWidth:320,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
            <div className="sh" style={{fontSize:18,marginBottom:4}}>⚖️ PESO DEL PRODUCTO</div>
            <div style={{fontSize:13,color:"var(--text3)",marginBottom:16}}>{modalKiloItem.nombre} — {fmt(modalKiloItem.precio)}/kg</div>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>PESO (kg)</div>
            <input
              type="number" min="0.001" step="0.001" placeholder="Ej: 1.250"
              value={kiloWeight} onChange={e=>setKiloWeight(e.target.value)}
              autoFocus
              style={{width:"100%",padding:"12px 14px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:20,fontWeight:800,color:"var(--red)",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:8,boxSizing:"border-box"}}
            />
            {kiloWeight&&parseFloat(kiloWeight)>0&&(
              <div style={{fontSize:13,color:"var(--text3)",marginBottom:16,textAlign:"center"}}>
                Total: <strong style={{color:"var(--red)"}}>{fmt(Math.round(parseFloat(kiloWeight)*modalKiloItem.precio))}</strong>
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button className="btn" onClick={()=>{setModalKiloItem(null);setKiloWeight("");}} style={{flex:1,padding:"11px 0",borderRadius:10,background:"var(--bg2)",border:"1px solid var(--border)",fontSize:14,fontWeight:600,color:"var(--text3)"}}>Cancelar</button>
              <button className="btn" onClick={()=>addKilo({...modalKiloItem},kiloWeight)}
                disabled={!kiloWeight||parseFloat(kiloWeight)<=0}
                style={{flex:2,padding:"11px 0",borderRadius:10,background:(!kiloWeight||parseFloat(kiloWeight)<=0)?"var(--border)":"var(--red)",color:(!kiloWeight||parseFloat(kiloWeight)<=0)?"var(--text4)":"#fff",fontSize:15,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
                AGREGAR AL PEDIDO
              </button>
            </div>
          </div>
        </div>
      )}
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
  // For open cajas, calculate real total from orders
  const getTotalCaja = (c) => {
    if (c.estado === "cerrada") return Number(c.total_ventas||0);
    const aperturaTs = c.hora_apertura ? new Date(c.fecha+"T"+c.hora_apertura+":00").getTime() : new Date(c.fecha+"T00:00:00").getTime();
    return orders.filter(o=>o.status==="entregado"&&Number(o.created_at)>=aperturaTs&&(!o.mesa_id)).reduce((s,o)=>s+Number(o.total),0);
  };
  // Group by day for accurate stats
  const byDay = {};
  filtrado.forEach(c=>{
    if (!byDay[c.fecha]) byDay[c.fecha]={fecha:c.fecha,total:0,hasClosed:false,hasOpen:false};
    byDay[c.fecha].total += getTotalCaja(c);
    if (c.estado==="cerrada") byDay[c.fecha].hasClosed=true;
    else byDay[c.fecha].hasOpen=true;
  });
  const dayList = Object.values(byDay).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const totalVentas   = dayList.reduce((s,d)=>s+d.total,0);
  const diasAbiertos  = dayList.filter(d=>d.hasClosed).length;
  const promDiario    = diasAbiertos>0 ? totalVentas/diasAbiertos : 0;
  const maxDiaObj     = dayList.reduce((max,d)=>d.total>max.total?d:max, dayList[0]||{total:0});
  const maxDia        = maxDiaObj; // used for display
  // Days elapsed in period
  const diasDelPeriodo = (() => {
    const n = new Date();
    if (vista === "semana") {
      const lunes = new Date(n); lunes.setDate(n.getDate() - (n.getDay()||7) + 1); lunes.setHours(0,0,0,0);
      return Math.min(7, Math.floor((n - lunes) / 86400000) + 1);
    }
    return n.getDate();
  })();

  // Bar chart data - already grouped in dayList
  const barDays = dayList;
  const maxVal = Math.max(...barDays.map(d=>d.total), 1);

  return (
    <div className="fade-in">
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {l:vista==="semana"?"TOTAL SEMANA":"TOTAL MES",    v:fmt(totalVentas),  bg:"#F0FDF4",bc:"#BBF7D0",c:"#16A34A"},
          {l:"PROMEDIO DIARIO",  v:fmt(promDiario),  bg:"#EFF6FF",bc:"#BFDBFE",c:"#2563EB"},
          {l:"DÍAS TRABAJADOS",  v:`${diasAbiertos}/${diasDelPeriodo}`, bg:"#FAF5FF",bc:"#E9D5FF",c:"#7C3AED"},
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
            {barDays.map(d=>{
              const pct = (d.total/maxVal)*100;
              const fecha = new Date(d.fecha+"T12:00:00");
              const label = fecha.toLocaleDateString("es-AR",{weekday:"short",day:"numeric"});
              const isHoy = d.fecha === fechaLocal();
              return(
                <div key={d.fecha} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:32}}>
                  <div style={{fontSize:9,color:"var(--text4)",marginBottom:3,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
                    {pct>5?`$${(d.total/1000).toFixed(0)}k`:""}
                  </div>
                  <div style={{width:"100%",background:isHoy?"var(--red)":"#CBD5E1",borderRadius:"4px 4px 0 0",height:`${Math.max(pct,2)}%`,minHeight:2,transition:"height .4s",position:"relative"}}>
                    {d.hasOpen&&<div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",width:6,height:6,borderRadius:"50%",background:"#D97706"}}/>}
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
function HistorialCajaTabla({ historial, onReload, orders=[], onReabrir }) {
  const fmt = (n) => `$${Number(n||0).toLocaleString("es-AR")}`;
  const [expandedId,      setExpandedId]      = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => { onReload(); }, []);

  const parseHora = (h) => { if (!h) return null; const m = h.match(/(\d{1,2}):(\d{2})/); if (!m) return null; let hh=parseInt(m[1]); const mm=m[2]; if (h.toLowerCase().includes("p") && hh<12) hh+=12; if (h.toLowerCase().includes("a") && hh===12) hh=0; return hh.toString().padStart(2,"0")+":"+mm; };

  const getPedidosCaja = (c) => {
    const aperturaHora = parseHora(c.hora_apertura);
    const cierreHora   = parseHora(c.hora_cierre);
    const [y,mo,d] = c.fecha.split("-").map(Number);
    const [ah=0,am=0] = (aperturaHora||"00:00").split(":").map(Number);
    const [ch=23,cm=59] = (cierreHora||"23:59").split(":").map(Number);
    const inicio = new Date(y, mo-1, d, ah, am, 0).getTime();
    const fin    = new Date(y, mo-1, d, ch, cm, 59).getTime();
    return orders
      .filter(o => { const ts = Number(o.created_at); return ts >= inicio && ts <= fin && o.status !== "eliminado"; })
      .sort((a,b) => Number(a.created_at) - Number(b.created_at));
  };

  const toggleDia = (c) => setExpandedId(p => p === c.id ? null : c.id);

  const ESTADOS = {
    pendiente_pago: {label:"Pend. pago", color:"#D97706", bg:"rgba(217,119,6,.1)", ring:"#D97706", next:"nuevo", nextLabel:"✓ Confirmar pago"},
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
        const pedidos = getPedidosCaja(c);
        const totalVentasLive = pedidos.filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0);
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
                  {fmt(totalVentasLive)}
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
                  {(()=>{
                    const movs = c.movimientos||[];
                    const hEntradas = movs.filter(m=>m.tipo==="entrada").reduce((s,m)=>s+Number(m.monto),0);
                    const hSalidas  = movs.filter(m=>m.tipo==="salida").reduce((s,m)=>s+Number(m.monto),0);
                    const ventasEf  = pedidos.filter(o=>o.status==="entregado"&&o.pago==="efectivo").reduce((s,o)=>s+Number(o.total),0);
                    const hEsperado = Number(c.monto_apertura||0) + ventasEf + hEntradas - hSalidas;
                    const hDif      = abierta?null:Number(c.monto_cierre||0) - hEsperado;
                    return [
                      {l:"Efectivo apertura", v:fmt(c.monto_apertura),                                          col:"#2563EB"},
                      {l:"Efectivo cierre",   v:abierta?"—":fmt(c.monto_cierre),                               col:abierta?"var(--text4)":"#16A34A"},
                      {l:"Total ventas",      v:fmt(totalVentasLive||c.total_ventas||0), col:"var(--red)"},
                      {l:"Diferencia caja",   v:abierta?"—":(hDif===0?"$0":(hDif>0?"+":"")+fmt(hDif)), col:abierta?"var(--text4)":hDif===0?"#16A34A":hDif>0?"#D97706":"#DC2626"},
                    ];
                  })().map(k=>(
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
                  PEDIDOS DE LA CAJA ({pedidos.length})
                </div>

                {pedidos.length===0&&(
                  <div style={{textAlign:"center",padding:"16px 0",color:"var(--text4)",fontSize:12}}>No hay pedidos registrados este día</div>
                )}

                {(()=>{
                  // Group by mesa_id + mesa_session
                  const sessionMap = {};
                  const individuales = [];
                  pedidos.forEach(o=>{
                    if (!o.mesa_id) { individuales.push(o); return; }
                    const key = o.mesa_id+"-"+(o.mesa_session||1);
                    if (!sessionMap[key]) sessionMap[key]={mesaId:o.mesa_id, sessionKey:key, session:o.mesa_session||1, orders:[]};
                    sessionMap[key].orders.push(o);
                  });
                  const mesaSessions = Object.values(sessionMap).sort((a,b)=>
                    Number(b.orders[0]?.created_at||0)-Number(a.orders[0]?.created_at||0)
                  );

                  const mesaNombre = (id) => "Mesa "+id.replace("mv","V").replace("m","");

                  const PedidoRow = ({o}) => {
                    const est = ESTADOS[o.status]||ESTADOS.entregado;
                    const isExpO = expandedOrderId === o.id;
                    return(
                      <div style={{borderBottom:"1px solid var(--border)"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}} onClick={()=>setExpandedOrderId(isExpO?null:o.id)}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:est.color,flexShrink:0}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{o.nombre||"—"}</span>
                              <span style={{fontSize:10,color:"var(--text4)",fontFamily:"monospace"}}>#{o.id.slice(-5).toUpperCase()}</span>
                              <span style={{fontSize:10,fontWeight:700,color:est.color,background:est.color+"15",padding:"1px 6px",borderRadius:20}}>{est.label}</span>
                              {o.tipo==="delivery"&&<span style={{fontSize:10,color:"#D97706",background:"#FFFBEB",padding:"1px 6px",borderRadius:20,fontWeight:600}}>🛵</span>}
                            </div>
                            <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>
                              {new Date(Number(o.created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false})}
                              {" · "}{o.items?.reduce((s,c)=>s+c.qty,0)||0} items
                              {o.pago&&<span style={{marginLeft:4}}>{o.pago==="efectivo"?"💵":o.pago==="transferencia"?"📲":o.pago==="mixto"?"🔀":"💳"} {o.pago}</span>}
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                            <button className="btn" onClick={e=>{e.stopPropagation();printTicket(o);}} style={{padding:"3px 7px",borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:10}}>🖨️</button>
                            <div className="sh" style={{fontSize:13,color:o.status==="entregado"?"#16A34A":"var(--text3)"}}>{fmt(o.total)}</div>
                            <span style={{fontSize:10,color:"var(--text4)"}}>{isExpO?"▲":"▼"}</span>
                          </div>
                        </div>
                        {isExpO&&(
                          <div className="fade-in" style={{background:"var(--bg2)",borderRadius:9,padding:"9px 11px",marginBottom:7,border:"1px solid var(--border)"}}>
                            {o.items?.filter(c=>c.item).map(c=>(
                              <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid var(--border)"}}>
                                <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                                <span style={{color:"var(--text3)",fontWeight:600}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
                              </div>
                            ))}
                            {o.notas&&<div style={{marginTop:5,fontSize:11,color:"var(--text3)",fontStyle:"italic"}}>💬 {o.notas}</div>}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return(<>
                    {/* Sesiones de mesa */}
                    {mesaSessions.map(session=>{
                      const {mesaId, sessionKey, orders:mOrders} = session;
                      const isExp = expandedOrderId === "s-"+sessionKey;
                      const total = mOrders.reduce((s,o)=>s+Number(o.total),0);
                      const allOk = mOrders.every(o=>o.status==="entregado");
                      const hora = new Date(Number(mOrders[0].created_at)).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false});
                      return(
                        <div key={sessionKey} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer"}} onClick={()=>setExpandedOrderId(isExp?null:"s-"+sessionKey)}>
                            <div style={{width:9,height:9,borderRadius:"50%",background:allOk?"#16A34A":"#EA580C",flexShrink:0}}/>
                            <div style={{flex:1}}>
                              <div className="sh" style={{fontSize:14,color:"var(--text)"}}>{mesaNombre(mesaId)}</div>
                              <div style={{fontSize:11,color:"var(--text3)"}}>{hora} · {mOrders.length} pedido{mOrders.length!==1?"s":""} · {mOrders.reduce((s,o)=>s+(o.items?.reduce((a,c)=>a+c.qty,0)||0),0)} items</div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <button className="btn" onClick={e=>{e.stopPropagation();printTicket({...mOrders[0],nombre:mesaNombre(mesaId),items:mOrders.flatMap(o=>o.items||[]),total,notas:mOrders.map(o=>o.notas).filter(Boolean).join(" | ")});}} style={{padding:"3px 7px",borderRadius:7,background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:10}}>🖨️</button>
                              <div className="sh" style={{fontSize:14,color:allOk?"#16A34A":"var(--text)"}}>{fmt(total)}</div>
                              <span style={{fontSize:10,color:"var(--text4)"}}>{isExp?"▲":"▼"}</span>
                            </div>
                          </div>
                          {isExp&&(
                            <div style={{padding:"0 12px 10px",borderTop:"1px solid var(--border)"}}>
                              {mOrders.map(o=><PedidoRow key={o.id} o={o}/>)}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Delivery / Retiro */}
                    {individuales.length>0&&mesaSessions.length>0&&(
                      <div style={{fontSize:10,fontWeight:700,color:"var(--text4)",letterSpacing:1,margin:"10px 0 6px",fontFamily:"'Barlow Condensed',sans-serif"}}>DELIVERY / RETIRO</div>
                    )}
                    {individuales.map(o=><PedidoRow key={o.id} o={o}/>)}

                    {/* Resumen */}
                    {pedidos.length>0&&(
                      <div style={{marginTop:10,padding:"10px 0 0",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:11,color:"var(--text3)"}}>
                          {pedidos.filter(o=>o.status==="entregado").length} entregados · {individuales.filter(o=>o.tipo==="delivery").length} delivery · {mesaSessions.length} turno{mesaSessions.length!==1?"s":""} de mesa
                        </div>
                        <div className="sh" style={{fontSize:15,color:"var(--red)"}}>
                          {fmt(pedidos.filter(o=>o.status==="entregado").reduce((s,o)=>s+Number(o.total),0))}
                        </div>
                      </div>
                    )}
                  </>);
                })()}

                {/* Movimientos de caja */}
                {(c.movimientos||[]).length>0&&(
                  <div style={{marginTop:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#D97706",letterSpacing:2,marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif"}}>MOVIMIENTOS DE EFECTIVO</div>
                    {(c.movimientos||[]).map((m,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:9,background:"var(--bg2)",border:"1px solid var(--border)",marginBottom:4}}>
                        <div>
                          <span style={{fontSize:12,fontWeight:700,color:m.tipo==="salida"?"#DC2626":"#16A34A",fontFamily:"'Barlow Condensed',sans-serif"}}>{m.tipo==="salida"?"↑ RETIRO":"↓ ENTRADA"}</span>
                          <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{m.hora} · {m.descripcion}</span>
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:m.tipo==="salida"?"#DC2626":"#16A34A",fontFamily:"'Barlow Condensed',sans-serif"}}>
                          {m.tipo==="salida"?"-":"+"}{fmt(m.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reabrir caja (solo cerradas) */}
                {!abierta&&onReabrir&&(
                  <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                    <button className="btn" onClick={()=>onReabrir(c.id)}
                      style={{width:"100%",padding:"11px 0",background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:11,color:"#DC2626",fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5}}>
                      🔓 REABRIR CAJA (REQUIERE PIN)
                    </button>
                    <div style={{fontSize:10,color:"var(--text4)",marginTop:6,textAlign:"center",lineHeight:1.4}}>
                      Usar solo si faltó cargar un retiro o hay un error en el cierre.
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
      supabase.from("orders").select("*").neq("mesa_id","").order("created_at",{ascending:false}).limit(200),
    ]);
    const mesas_ = mesasData || [];
    const orders_ = ordersData || [];
    setMesas(mesas_);
    setOrders(orders_);
    setLoading(false);
    // Auto-update: only mark as ocupada if there are active orders and mesa is libre
    const activeOrders_ = orders_.filter(o=>["nuevo","preparando","listo"].includes(o.status));
    const mesasConPedidos = [...new Set(activeOrders_.map(o=>o.mesa_id).filter(Boolean))];
    for (const mId of mesasConPedidos) {
      const mesa = mesas_.find(m=>m.id===mId);
      if (mesa?.estado==="libre") {
        await supabase.from("mesas").update({estado:"ocupada"}).eq("id",mId);
        setMesas(p=>p.map(m=>m.id===mId?{...m,estado:"ocupada"}:m));
      }
    }
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

  const getMesaOrders = (mesaId) => {
    const mesa = mesas.find(m=>m.id===mesaId);
    if (mesa?.estado==="libre") return [];
    const currentSession = mesa?.session_num || 1;
    return orders.filter(o => o.mesa_id === mesaId && (o.mesa_session||1) === currentSession);
  };
  const getMesaActiveOrders = (mesaId) => orders.filter(o => o.mesa_id === mesaId && ["nuevo","preparando","listo"].includes(o.status));
  const getMesaTotal  = (mesaId) => getMesaActiveOrders(mesaId).reduce((s,o)=>s+Number(o.total),0);

  const setEstado = async (mesaId, estado) => {
    await supabase.from("mesas").update({estado}).eq("id", mesaId);
    setMesas(p => p.map(m => m.id===mesaId ? {...m,estado} : m));
  };

  const liberarMesa = async (mesaId, pago="efectivo") => {
    if (!window.confirm("¿Cerrar la cuenta y liberar la mesa?")) return;
    const mesaOrds = orders.filter(o=>o.mesa_id===mesaId&&["nuevo","preparando","listo"].includes(o.status));
    const mesaNombre = mesas.find(m=>m.id===mesaId)?.nombre||mesaId;
    const totalMesa = mesaOrds.reduce((s,o)=>s+Number(o.total),0);
    // First close account in DB
    await supabase.from("orders").update({status:"entregado", pago})
      .eq("mesa_id", mesaId).in("status",["nuevo","preparando","listo"]);
    const {data:mesaActual} = await supabase.from("mesas").select("session_num").eq("id",mesaId).maybeSingle();
    const nextSession = (mesaActual?.session_num || 1) + 1;
    await supabase.from("mesas").update({estado:"libre", pedidos_ids:[], session_num: nextSession}).eq("id", mesaId);
    setSelectedMesa(null);
    load();
    // Print ticket after closing
    if (mesaOrds.length > 0) {
      printTicket({
        ...mesaOrds[0],
        nombre: mesaNombre,
        items: mesaOrds.flatMap(o=>o.items||[]),
        total: totalMesa,
        notas: mesaOrds.map(o=>o.notas).filter(Boolean).join(" | "),
      });
    }
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
  const pedidos = mesaOrders;
  const pedidosActivos = selectedMesa ? getMesaActiveOrders(selectedMesa) : [];

  const ESTADOS = {
    pendiente_pago: {label:"Pend. pago", color:"#D97706", bg:"rgba(217,119,6,.1)", ring:"#D97706", next:"nuevo", nextLabel:"✓ Confirmar pago"},
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
                const nOrders = getMesaActiveOrders(mesa.id).length;
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
          {pedidos.length === 0
            ? <div style={{textAlign:"center",padding:"20px 0",color:"var(--text4)",fontSize:13}}>Sin pedidos hoy en esta mesa</div>
            : <>
                {pedidosActivos.map(o => {
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
                      {o.items?.filter(c=>c.item).map(c=>(
                        <div key={c.item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0",borderBottom:"1px solid var(--border)"}}>
                          <span style={{color:"var(--text2)"}}>{c.qty}× {c.item.nombre}</span>
                          <span style={{color:"var(--text3)"}}>{fmt((c.precioUnitario??c.item.precio)*c.qty)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {pedidos.filter(o=>o.status==="entregado").length > 0 && (
                  <div style={{marginTop:4,marginBottom:8}}>
                    <div style={{fontSize:10,color:"var(--text4)",fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:6}}>YA ENTREGADOS</div>
                    {pedidos.filter(o=>o.status==="entregado").map(o=>(
                      <div key={o.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 8px",background:"var(--bg2)",borderRadius:8,marginBottom:4,border:"1px solid var(--border)",opacity:.7}}>
                        <span style={{color:"var(--text3)"}}>#{o.id.slice(-5).toUpperCase()} · {o.items?.reduce((s,c)=>s+c.qty,0)||0} items</span>
                        <span style={{color:"#16A34A",fontWeight:600}}>{fmt(o.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                    <button className="btn" onClick={()=>liberarMesa(mesaSeleccionada.id,"efectivo")}
                      style={{padding:"10px 12px",borderRadius:12,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#16A34A",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      💵 Efectivo
                    </button>
                    <button className="btn" onClick={()=>liberarMesa(mesaSeleccionada.id,"transferencia")}
                      style={{padding:"10px 12px",borderRadius:12,background:"#FFFBEB",border:"1px solid #FDE68A",color:"#D97706",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      📲 Transf.
                    </button>
                    <button className="btn" onClick={()=>liberarMesa(mesaSeleccionada.id,"tarjeta")}
                      style={{padding:"10px 12px",borderRadius:12,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#2563EB",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      💳 Tarjeta
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
