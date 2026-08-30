const fs = require("fs");
const path = require("path");

const SCHEMA = "/Users/alongkonchanthiang/Documents/MiniProjectERP/prisma/schema.prisma";
const OUT = path.join(__dirname, "report.html");
const MERMAID = "/Users/alongkonchanthiang/Documents/MiniProjectERP/node_modules/mermaid/dist/mermaid.min.js";

const src = fs.readFileSync(SCHEMA, "utf8");

// ---------- parse ----------
const modelNames = [...src.matchAll(/model\s+(\w+)\s+\{/g)].map((m) => m[1]);
const enumNames = [...src.matchAll(/enum\s+(\w+)\s+\{/g)].map((m) => m[1]);
const isModel = (t) => modelNames.includes(t);
const isEnum = (t) => enumNames.includes(t);

const scalarBase = ["Int", "String", "Boolean", "DateTime", "Decimal", "Json", "BigInt"];

function dbType(base, rest) {
  const m = rest.match(/@db\.(\w+)(\([^)]*\))?/);
  if (m) {
    const t = m[1].toLowerCase();
    const arg = m[2] || "";
    if (t === "varchar") return "varchar" + arg;
    if (t === "char") return "char" + arg;
    if (t === "decimal") return "decimal" + arg;
    if (t === "timestamptz") return "timestamptz";
    if (t === "date") return "date";
    if (t === "inet") return "inet";
    return t + arg;
  }
  if (isEnum(base)) return base; // enum type
  return { Int: "integer", String: "text", Boolean: "boolean", DateTime: "timestamp", Decimal: "decimal", Json: "jsonb", BigInt: "bigint" }[base] || base.toLowerCase();
}
function simpleType(base, rest) {
  if (isEnum(base)) return "enum";
  const m = rest.match(/@db\.(\w+)/);
  if (m) return m[1].toLowerCase().replace("timestamptz", "timestamptz");
  return { Int: "int", String: "text", Boolean: "bool", DateTime: "timestamp", Decimal: "decimal", Json: "jsonb", BigInt: "bigint" }[base] || "field";
}
function defVal(rest) {
  const fn = rest.match(/@default\((\w+)\(\)\)/); // @default(func())
  if (fn) {
    if (fn[1] === "autoincrement") return "auto (serial)";
    if (fn[1] === "now") return "now()";
    return fn[1] + "()";
  }
  const lit = rest.match(/@default\(([^()]*)\)/); // @default(literal)
  return lit ? lit[1] : "";
}

const models = {}; // name -> {columns:[], pk:Set, uk:Set, fk:{col->parent}, fkNullable:{col->bool}}
const modelBlocks = [...src.matchAll(/model\s+(\w+)\s+\{([\s\S]*?)\n\}/g)];
for (const [, name, body] of modelBlocks) {
  const columns = [];
  const pk = new Set();
  const uk = new Set();
  const fk = {};
  const fkNullable = {};
  const lines = body.split("\n").map((l) => l.trim());
  for (const line of lines) {
    if (!line || line.startsWith("//") || line.startsWith("@@")) {
      // block-level
      const idm = line.match(/@@id\(\[([^\]]+)\]/);
      if (idm) idm[1].split(",").map((s) => s.trim()).forEach((c) => pk.add(c));
      const um = line.match(/@@unique\(\[([^\]]+)\]/);
      if (um) um[1].split(",").map((s) => s.trim()).forEach((c) => uk.add(c));
      continue;
    }
    const fm = line.match(/^(\w+)\s+([\w]+)(\??)(\[\])?(.*)$/);
    if (!fm) continue;
    const [, fname, base, opt, arr, rest] = fm;
    // relation field (points to a model)
    if (isModel(base)) {
      const rel = rest.match(/@relation\([^)]*fields:\s*\[([^\]]+)\]/);
      if (rel && !arr) {
        const col = rel[1].split(",")[0].trim();
        fk[col] = base;
        // nullable if the relation field is optional
        fkNullable[col] = opt === "?";
      }
      continue; // not a scalar column
    }
    if (!scalarBase.includes(base) && !isEnum(base)) continue;
    // scalar column
    const isId = /@id\b/.test(rest);
    if (isId) pk.add(fname);
    if (/@unique\b/.test(rest)) uk.add(fname);
    columns.push({
      name: fname,
      base,
      nullable: opt === "?",
      dbType: dbType(base, rest),
      simple: simpleType(base, rest),
      def: defVal(rest),
    });
  }
  models[name] = { name, columns, pk, uk, fk, fkNullable };
}

// ---------- descriptions ----------
const overrides = {
  "account.type": "ประเภทบัญชี (asset/liability/equity/revenue/expense)",
  "account.normal_balance": "ด้านปกติของบัญชี (D=เดบิต / C=เครดิต)",
  "app_user.username": "ชื่อผู้ใช้สำหรับเข้าระบบ",
  "app_user.password_hash": "รหัสผ่านที่เข้ารหัสแล้ว (hash)",
  "app_user.full_name": "ชื่อ-นามสกุลผู้ใช้",
  "app_user.email": "อีเมล",
  "audit_log.action": "การกระทำ (create/update/void ฯลฯ)",
  "audit_log.entity": "ชื่อตาราง/เอกสารที่ถูกกระทำ",
  "audit_log.entity_id": "รหัสของเอกสารที่ถูกกระทำ",
  "audit_log.diff": "ข้อมูลก่อน/หลังการเปลี่ยนแปลง (JSON)",
  "audit_log.ip_address": "หมายเลข IP ผู้ใช้",
  "customer.tax_id": "เลขประจำตัวผู้เสียภาษี",
  "customer.address": "ที่อยู่",
  "customer.phone": "เบอร์โทรศัพท์",
  "customer.credit_days": "จำนวนวันเครดิต (เทอมชำระ)",
  "supplier.tax_id": "เลขประจำตัวผู้เสียภาษี",
  "supplier.address": "ที่อยู่",
  "supplier.phone": "เบอร์โทรศัพท์",
  "supplier.credit_days": "จำนวนวันเครดิต (เทอมชำระ)",
  "product.sku": "รหัสสินค้า (SKU)",
  "product.sale_price": "ราคาขายต่อหน่วย",
  "product.reorder_point": "จุดสั่งซื้อ (ต่ำกว่านี้ถือว่าของใกล้หมด)",
  "permission.module": "โมดูล (เช่น purchasing, sales)",
  "permission.action": "การกระทำที่อนุญาต (เช่น approve, view)",
  "doc_sequence.doc_type": "ประเภทเอกสาร (PO, SO ฯลฯ)",
  "doc_sequence.year": "ปีของเลขที่เอกสาร",
  "doc_sequence.last_no": "เลขที่ล่าสุดที่ออกไปแล้ว",
  "journal_entry.entry_no": "เลขที่ใบสำคัญบัญชี",
  "journal_entry.entry_date": "วันที่บันทึกบัญชี",
  "journal_entry.description": "คำอธิบายรายการ",
  "journal_entry.ref_type": "ประเภทเอกสารต้นทาง (soft link)",
  "journal_entry.ref_id": "รหัสเอกสารต้นทาง (soft link)",
  "journal_entry.reversal_of_id": "อ้างใบสำคัญที่กลับรายการ (กรณี void)",
  "journal_line.debit": "จำนวนเงินด้านเดบิต",
  "journal_line.credit": "จำนวนเงินด้านเครดิต",
  "journal_line.memo": "คำอธิบายบรรทัด",
  "stock_movement.moved_at": "วันเวลาที่เคลื่อนไหวสต๊อก",
  "stock_movement.qty_change": "จำนวนที่เปลี่ยน (+เข้า / -ออก)",
  "stock_movement.unit_cost": "ต้นทุนต่อหน่วยของการเคลื่อนไหวนี้",
  "stock_movement.value_change": "มูลค่าที่เปลี่ยน",
  "stock_movement.balance_qty": "ยอดคงเหลือสะสม (หลังรายการนี้)",
  "stock_movement.balance_value": "มูลค่าคงเหลือสะสม",
  "stock_movement.ref_type": "ประเภทเอกสารต้นทาง (soft link)",
  "stock_movement.ref_id": "รหัสเอกสารต้นทาง (soft link)",
  "stock_movement.ref_no": "เลขที่เอกสารต้นทาง",
  "supplier_bill.supplier_ref": "เลขที่บิลอ้างอิงจากผู้ขาย",
  "supplier_bill.bill_date": "วันที่ในบิล",
  "payment.payment_date": "วันที่จ่ายเงิน",
  "payment.cash_account_id": "บัญชีเงินสด/ธนาคารที่จ่ายออก (อ้าง account)",
  "receipt.receipt_date": "วันที่รับเงิน",
  "receipt.cash_account_id": "บัญชีเงินสด/ธนาคารที่รับเข้า (อ้าง account)",
  "quotation.valid_until": "วันหมดอายุใบเสนอราคา",
  "product.category_id": "หมวดหมู่สินค้า (อ้าง product_category)",
  "product.unit_id": "หน่วยนับ (อ้าง unit)",
};
const generic = {
  id: "รหัสอ้างอิงหลัก (Primary Key)",
  code: "รหัสอ้างอิง (unique)",
  name: "ชื่อ",
  is_active: "สถานะการใช้งาน (true = ใช้งานอยู่)",
  created_at: "วันเวลาที่สร้างรายการ",
  updated_at: "วันเวลาที่แก้ไขล่าสุด",
  created_by: "ผู้สร้างรายการ (อ้าง app_user)",
  note: "หมายเหตุ",
  line_no: "ลำดับบรรทัดในเอกสาร",
  status: "สถานะเอกสาร (draft/pending/approved/posted/cancelled/voided)",
  qty: "จำนวน",
  unit_price: "ราคาต่อหน่วย",
  line_amount: "จำนวนเงินรวมของบรรทัด",
  subtotal_amount: "ยอดรวมก่อนภาษี",
  vat_amount: "ภาษีมูลค่าเพิ่ม (VAT)",
  total_amount: "ยอดรวมสุทธิ",
  amount: "จำนวนเงิน",
  description: "รายละเอียด",
  method: "วิธีชำระเงิน (cash/transfer/cheque/other)",
  due_date: "วันครบกำหนดชำระ",
};
function describe(table, c, fkParent) {
  const key = table + "." + c.name;
  if (overrides[key]) return overrides[key];
  if (generic[c.name]) return generic[c.name];
  if (fkParent) return "อ้างถึงตาราง " + fkParent;
  if (/_no$/.test(c.name)) return "เลขที่เอกสาร";
  if (/_date$/.test(c.name)) return "วันที่ของเอกสาร";
  if (/_id$/.test(c.name)) return "รหัสอ้างอิง";
  return "-";
}
function keyLabel(table, col) {
  const m = models[table];
  const parts = [];
  if (m.pk.has(col)) parts.push("PK");
  if (m.fk[col]) parts.push("FK");
  if (m.uk.has(col) && !m.pk.has(col)) parts.push("UK");
  return parts.join(", ");
}

// ---------- groups ----------
const groups = [
  { id: "auth", title: "1. ระบบผู้ใช้และสิทธิ์ (Authentication & Authorization)",
    tables: ["app_user", "role", "permission", "user_role", "role_permission", "audit_log"], attrs: true },
  { id: "master", title: "2. ข้อมูลหลัก (Master Data)",
    tables: ["product_category", "unit", "product", "customer", "supplier", "account"], attrs: true },
  { id: "engine", title: "3. ระบบบัญชีแยกประเภทและสินค้าคงคลัง (General Ledger & Inventory)",
    tables: ["journal_entry", "journal_line", "stock_movement", "doc_sequence"], attrs: true },
  { id: "purchasing", title: "4. งานจัดซื้อ (Purchasing)",
    tables: ["purchase_requisition", "purchase_requisition_line", "purchase_order", "purchase_order_line",
      "goods_receipt", "goods_receipt_line", "supplier_bill", "supplier_bill_line", "payment", "payment_allocation"], attrs: false },
  { id: "sales", title: "5. งานขาย (Sales)",
    tables: ["quotation", "quotation_line", "sales_order", "sales_order_line", "shipment", "shipment_line",
      "invoice", "invoice_line", "receipt", "receipt_allocation"], attrs: false },
];

// ---------- mermaid per group ----------
function mermaidFor(group) {
  const own = new Set(group.tables);
  const extra = new Set(); // external referenced parents
  const rels = [];
  for (const t of group.tables) {
    const m = models[t];
    for (const [col, parent] of Object.entries(m.fk)) {
      const card = m.fkNullable[col] ? "|o--o{" : "||--o{";
      if (parent === t) continue; // skip self-ref (mermaid ER ไม่ชอบ)
      rels.push(`  ${parent} ${card} ${t} : "${col}"`);
      if (!own.has(parent)) extra.add(parent);
    }
  }
  let out = "erDiagram\n";
  // entities with attributes (own tables only, if attrs)
  if (group.attrs) {
    for (const t of group.tables) {
      const m = models[t];
      out += `  ${t} {\n`;
      for (const c of m.columns) {
        const k = keyLabel(t, c.name);
        out += `    ${c.simple} ${c.name}${k ? " " + k : ""}\n`;
      }
      out += `  }\n`;
    }
  } else {
    for (const t of group.tables) out += `  ${t} {\n  }\n`;
  }
  // external boxes (plain)
  for (const e of extra) out += `  ${e} {\n  }\n`;
  out += rels.join("\n") + "\n";
  return out;
}

// ---------- data dictionary HTML ----------
function dictFor(table) {
  const m = models[table];
  let rows = "";
  for (const c of m.columns) {
    const parent = m.fk[c.name];
    const k = keyLabel(table, c.name);
    rows += `<tr>
      <td class="col">${c.name}</td>
      <td class="type">${c.dbType}</td>
      <td class="center">${c.nullable ? "YES" : "NO"}</td>
      <td class="center key">${k || "-"}</td>
      <td class="type">${c.def || "-"}</td>
      <td>${describe(table, c, parent)}</td>
    </tr>`;
  }
  return `<div class="dict"><h3 class="tname">${table}</h3>
  <table class="dd"><thead><tr>
    <th style="width:19%">Column</th><th style="width:15%">Data type</th>
    <th style="width:7%">Null</th><th style="width:10%">Key</th>
    <th style="width:14%">Default</th><th>Description</th>
  </tr></thead><tbody>${rows}</tbody></table></div>`;
}

// ---------- assemble ----------
const mermaidJs = fs.readFileSync(MERMAID, "utf8");
const totalCols = Object.values(models).reduce((a, m) => a + m.columns.length, 0);

let erdSections = "";
for (const g of groups) {
  erdSections += `<section class="page erd"><h2>${g.title}</h2>
  <pre class="mermaid">${mermaidFor(g)}</pre></section>`;
}

let dictSections = "";
for (const g of groups) {
  dictSections += `<section class="page"><h2>${g.title}</h2>`;
  for (const t of g.tables) dictSections += dictFor(t);
  dictSections += `</section>`;
}

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<style>
  @page { size: A4 landscape; margin: 14mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Sarabun","Sukhumvit Set","Thonburi","Helvetica Neue",Arial,sans-serif;
    color: #1f2430; font-size: 11px; line-height: 1.5; margin: 0; }
  h1 { font-size: 30px; margin: 0 0 6px; color: #0f2a4a; }
  h2 { font-size: 17px; color: #0f2a4a; border-bottom: 2px solid #0f2a4a; padding-bottom: 5px; margin: 0 0 14px; }
  h3.tname { font-size: 13px; color: #14508a; margin: 16px 0 5px; font-family: "Menlo",monospace; }
  .page { page-break-before: always; padding-top: 4px; }
  .cover { page-break-before: avoid; display: flex; flex-direction: column; justify-content: center;
    height: 178mm; text-align: center; }
  .cover .sub { font-size: 15px; color: #55627a; margin-top: 2px; }
  .cover .meta { margin-top: 40px; font-size: 12px; color: #55627a; }
  .badge { display:inline-block; background:#0f2a4a; color:#fff; border-radius:20px; padding:4px 16px; font-size:12px; margin-top:14px;}
  table.dd { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  table.dd th { background: #0f2a4a; color: #fff; text-align: left; padding: 5px 8px; font-weight: 600; font-size: 10.5px; }
  table.dd td { border: 1px solid #d5dae3; padding: 4px 8px; vertical-align: top; }
  table.dd tr:nth-child(even) td { background: #f4f7fb; }
  td.col { font-family: "Menlo",monospace; font-weight: 600; color: #14508a; }
  td.type { font-family: "Menlo",monospace; color: #476; font-size: 10px; }
  td.center { text-align: center; }
  td.key { font-weight: 600; color: #a3521a; font-size: 10px; }
  .dict { page-break-inside: avoid; }
  .erd .mermaid { text-align: center; }
  .erd svg { max-width: 100%; height: auto; }
  .intro-box { background:#f4f7fb; border:1px solid #d5dae3; border-radius:8px; padding:14px 18px; margin:10px 0; }
  .intro-box h4 { margin:0 0 6px; color:#0f2a4a; }
  ul { margin: 4px 0 4px 18px; padding: 0; }
  .grid { display:flex; gap:16px; flex-wrap:wrap; }
  .grid .intro-box { flex:1; min-width:300px; }
  .legend { font-size:10.5px; color:#55627a; margin-top:6px; }
  code { font-family:"Menlo",monospace; background:#eef2f7; padding:1px 4px; border-radius:3px; }
</style></head><body>

<div class="cover">
  <h1>MiniProject ERP</h1>
  <div class="sub">Entity-Relationship Diagram &amp; Data Dictionary</div>
  <div class="sub">ระบบ ERP ธุรกิจซื้อมาขายไป (ร้านค้าส่งเครื่องเขียน / อุปกรณ์สำนักงาน)</div>
  <div class="badge">Crow's Foot Notation · PostgreSQL</div>
  <div class="meta">
    ${modelNames.length} ตาราง (Tables) · ${totalCols} คอลัมน์ (Columns) · ${enumNames.length} Enum types<br>
    Database: PostgreSQL (Supabase) · ORM: Prisma
  </div>
</div>

<section class="page">
  <h2>ภาพรวมระบบ (Overview)</h2>
  <p>เอกสารนี้อธิบายโครงสร้างฐานข้อมูลของระบบ ERP สำหรับธุรกิจซื้อมาขายไป ประกอบด้วยแผนภาพความสัมพันธ์ระหว่างตาราง (ER Diagram) แบบ Crow's Foot และพจนานุกรมข้อมูล (Data Dictionary) ครบทุกตาราง</p>
  <div class="grid">
    <div class="intro-box"><h4>โมดูลในระบบ</h4><ul>
      <li>ระบบผู้ใช้และสิทธิ์ (Auth &amp; RBAC)</li>
      <li>ข้อมูลหลัก (สินค้า ลูกค้า ผู้ขาย ผังบัญชี)</li>
      <li>ระบบบัญชีแยกประเภท (General Ledger)</li>
      <li>ระบบสินค้าคงคลัง (คิดต้นทุนแบบถัวเฉลี่ย)</li>
      <li>งานจัดซื้อ: PR → PO → รับของ → ตั้งหนี้ → จ่ายเงิน</li>
      <li>งานขาย: ใบเสนอราคา → SO → ส่งของ → Invoice → รับเงิน</li>
    </ul></div>
    <div class="intro-box"><h4>หลักการออกแบบ (Design Rules)</h4><ul>
      <li>จำนวนสินค้าคงเหลือ = ผลรวมของ <code>stock_movement</code> เท่านั้น (ไม่เก็บยอดตรง)</li>
      <li>จำนวนเงินอ้างอิงจาก <code>journal_entry / journal_line</code> เท่านั้น</li>
      <li>ห้ามลบเอกสาร — ยกเลิกด้วยการ void แล้วออกรายการกลับบัญชี</li>
    </ul></div>
  </div>
  <div class="intro-box"><h4>สัญลักษณ์ Crow's Foot ที่ใช้</h4>
    <div class="legend">
      <code>||──o&lt;</code> หนึ่ง-ต่อ-ศูนย์หรือมาก (one to zero-or-many, FK บังคับ) &nbsp;·&nbsp;
      <code>|o──o&lt;</code> ศูนย์หรือหนึ่ง-ต่อ-ศูนย์หรือมาก (FK ไม่บังคับ / nullable) &nbsp;·&nbsp;
      <strong>PK</strong> = Primary Key, <strong>FK</strong> = Foreign Key, <strong>UK</strong> = Unique Key
    </div>
  </div>
</section>

<h1 style="display:none">ERD</h1>
${erdSections}
${dictSections}

<script>${mermaidJs}</script>
<script>
  mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose",
    er: { useMaxWidth: false, entityPadding: 14, fontSize: 11 } });
  (async () => {
    try { await mermaid.run(); }
    catch (e) { document.body.insertAdjacentHTML("afterbegin","<pre style=color:red>"+e+"</pre>"); }
    // สเกล SVG แต่ละอันให้พอดีพื้นที่หน้ากระดาษ (landscape A4)
    const MAXW = 1010, MAXH = 600;
    document.querySelectorAll(".erd svg").forEach((svg) => {
      let w = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width;
      let h = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.height;
      if (!w || !h) { const b = svg.getBBox(); w = b.width; h = b.height; }
      const s = Math.min(MAXW / w, MAXH / h, 1);
      svg.style.setProperty("width", (w * s) + "px", "important");
      svg.style.setProperty("height", (h * s) + "px", "important");
      svg.style.setProperty("max-width", "none", "important");
    });
    window.__ready = true; document.title = "READY";
  })();
</script>
</body></html>`;

fs.writeFileSync(OUT, html);

// ---------- ไฟล์แยก: Data Dictionary อย่างเดียว (ไม่มี ERD/mermaid) ----------
const OUT_DICT = path.join(__dirname, "datadict.html");
const dictOnly = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<style>
  @page { size: A4 landscape; margin: 14mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Sarabun","Sukhumvit Set","Thonburi","Helvetica Neue",Arial,sans-serif;
    color: #1f2430; font-size: 11px; line-height: 1.5; margin: 0; }
  h1 { font-size: 30px; margin: 0 0 6px; color: #0f2a4a; }
  h2 { font-size: 17px; color: #0f2a4a; border-bottom: 2px solid #0f2a4a; padding-bottom: 5px; margin: 0 0 14px; }
  h3.tname { font-size: 13px; color: #14508a; margin: 16px 0 5px; font-family: "Menlo",monospace; }
  .page { page-break-before: always; padding-top: 4px; }
  .cover { page-break-before: avoid; display: flex; flex-direction: column; justify-content: center;
    height: 178mm; text-align: center; }
  .cover .sub { font-size: 15px; color: #55627a; margin-top: 2px; }
  .cover .meta { margin-top: 40px; font-size: 12px; color: #55627a; }
  .badge { display:inline-block; background:#0f2a4a; color:#fff; border-radius:20px; padding:4px 16px; font-size:12px; margin-top:14px;}
  table.dd { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  table.dd th { background: #0f2a4a; color: #fff; text-align: left; padding: 5px 8px; font-weight: 600; font-size: 10.5px; }
  table.dd td { border: 1px solid #d5dae3; padding: 4px 8px; vertical-align: top; }
  table.dd tr:nth-child(even) td { background: #f4f7fb; }
  td.col { font-family: "Menlo",monospace; font-weight: 600; color: #14508a; }
  td.type { font-family: "Menlo",monospace; color: #476; font-size: 10px; }
  td.center { text-align: center; }
  td.key { font-weight: 600; color: #a3521a; font-size: 10px; }
  .dict { page-break-inside: avoid; }
</style></head><body>
<div class="cover">
  <h1>MiniProject ERP</h1>
  <div class="sub">Data Dictionary — พจนานุกรมข้อมูล</div>
  <div class="sub">ระบบ ERP ธุรกิจซื้อมาขายไป (ร้านค้าส่งเครื่องเขียน / อุปกรณ์สำนักงาน)</div>
  <div class="badge">Data Dictionary · PostgreSQL</div>
  <div class="meta">
    ${modelNames.length} ตาราง (Tables) · ${totalCols} คอลัมน์ (Columns) · ${enumNames.length} Enum types<br>
    Database: PostgreSQL (Supabase) · ORM: Prisma
  </div>
</div>
${dictSections}
</body></html>`;
fs.writeFileSync(OUT_DICT, dictOnly);

console.log("wrote FULL:", OUT, "(" + (html.length / 1024 / 1024).toFixed(1) + " MB)");
console.log("wrote DICT:", OUT_DICT);
console.log("tables:", modelNames.length, "columns:", totalCols, "enums:", enumNames.length);
