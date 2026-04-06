import sharp from "sharp";
import { mkdirSync, statSync } from "fs";
import { join } from "path";

const ALL_URLS = [
  ["rolls-r1",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r1-1774122858861.png"],
  ["rolls-r2",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r2-1774125340940.png"],
  ["rolls-r3",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r3-1774122878089.png"],
  ["rolls-r4",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r4-1774122887085.png"],
  ["rolls-r5",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r5-1774122945601.png"],
  ["rolls-r6",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r6-1774122964272.png"],
  ["rolls-r7",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r7-1774126559017.png"],
  ["rolls-r8",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r8-1774125615764.png"],
  ["rolls-r9",  "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r9-1774125704824.png"],
  ["rolls-r10", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r10-1774125993050.png"],
  ["rolls-r11", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r11-1774127081101.png"],
  ["rolls-r12", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r12-1774126838057.png"],
  ["rolls-r13", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r13-1774127920902.png"],
  ["rolls-r14", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r14-1774136159239.png"],
  ["rolls-r15", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r15-1774136316176.png"],
  ["rolls-r16", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r16-1774137697087.png"],
  ["rolls-r17", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r17-1774137840600.png"],
  ["rolls-r18", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r18-1774138419123.png"],
  ["rolls-r19", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r19-1774138522687.png"],
  ["rolls-r20", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r20-1774140937377.png"],
  ["rolls-r21", "https://dinylgezchbrojrszalt.supabase.co/storage/v1/object/public/menu-images/items/rolls-r21-1774141435801.png"],
];

const OUT_DIR = "./public/imgs";
mkdirSync(OUT_DIR, { recursive: true });

let ok = 0, fail = 0, savedKB = 0;
for (const [name, url] of ALL_URLS) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = join(OUT_DIR, `${name}.webp`);
    await sharp(buf)
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outPath);
    const origKB = Math.round(buf.length / 1024);
    const newKB  = Math.round(statSync(outPath).size / 1024);
    savedKB += origKB - newKB;
    console.log(`✓ ${name}: ${origKB}KB → ${newKB}KB`);
    ok++;
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed — ahorrado: ~${savedKB}KB`);
