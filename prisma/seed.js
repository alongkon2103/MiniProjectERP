import { prisma } from "../src/config/prisma.js";

// ข้อมูลตัวอย่าง: ร้านค้าส่งเครื่องเขียน / อุปกรณ์สำนักงาน
// รันซ้ำได้ (upsert + ล้าง opening stock ก่อน) : npm run seed

async function main() {
  // ---- ล้างข้อมูล demo เก่า (จากตอนทดสอบ) ----
  await prisma.stock_movement.deleteMany({
    where: { ref_type: { in: ["OPENING", "SEED", "TEST"] } },
  });
  await prisma.product.deleteMany({
    where: { sku: { in: ["A001", "A002", "A003", "P01"] } },
  });
  await prisma.app_user.deleteMany({ where: { username: "demo" } });

  // ---- user สำหรับใช้เป็น created_by ของ stock movement ----
  const admin = await prisma.app_user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password_hash: "changeme", full_name: "ผู้ดูแลระบบ" },
  });
  // ผูก role Admin ให้ admin (ถ้ามี role code=ADMIN)
  const adminRole = await prisma.role.findFirst({ where: { code: "ADMIN" } });
  if (adminRole) {
    await prisma.user_role.upsert({
      where: { user_id_role_id: { user_id: admin.id, role_id: adminRole.id } },
      update: {},
      create: { user_id: admin.id, role_id: adminRole.id },
    });
  }

  // ---- หน่วยนับ ----
  const units = [
    { code: "PCS", name: "ชิ้น" },
    { code: "BOX", name: "กล่อง" },
    { code: "SET", name: "ชุด" },
    { code: "DOZEN", name: "โหล" },
    { code: "PACK", name: "แพ็ค" },
    { code: "REAM", name: "รีม" },
    { code: "BOTTLE", name: "ขวด" },
  ];
  for (const u of units) {
    await prisma.unit.upsert({ where: { code: u.code }, update: { name: u.name }, create: u });
  }

  // ---- หมวดหมู่สินค้า ----
  const categories = [
    { code: "WRITE", name: "เครื่องเขียน" },
    { code: "PAPER", name: "กระดาษ" },
    { code: "FILE", name: "แฟ้ม/จัดเก็บเอกสาร" },
    { code: "OFFICE", name: "อุปกรณ์สำนักงาน" },
    { code: "INK", name: "หมึก/ตลับหมึก" },
  ];
  for (const c of categories) {
    await prisma.product_category.upsert({ where: { code: c.code }, update: { name: c.name }, create: c });
  }

  // แปลง code -> id ไว้ใช้ผูกสินค้า
  const unitMap = {};
  for (const u of await prisma.unit.findMany()) unitMap[u.code] = u.id;
  const catMap = {};
  for (const c of await prisma.product_category.findMany()) catMap[c.code] = c.id;

  // ---- สินค้า + สต๊อกยกมา ----
  // [sku, ชื่อ, หน่วย, หมวด, ราคาขาย, จุดสั่งซื้อ, สต๊อกยกมา, ต้นทุน/หน่วย]
  const products = [
    ["ST-001", "ปากกาลูกลื่นน้ำเงิน", "DOZEN", "WRITE", 120, 30, 100, 84],
    ["ST-002", "ปากกาลูกลื่นแดง", "DOZEN", "WRITE", 120, 20, 15, 84],
    ["ST-003", "ดินสอ 2B", "DOZEN", "WRITE", 90, 24, 60, 63],
    ["ST-004", "ปากกาไฮไลท์", "PACK", "WRITE", 85, 15, 8, 60],
    ["ST-005", "ปากกาเมจิก 12 สี", "PACK", "WRITE", 110, 12, 40, 77],
    ["ST-010", "กระดาษ A4 80 แกรม", "REAM", "PAPER", 135, 50, 200, 95],
    ["ST-011", "กระดาษ A3 80 แกรม", "REAM", "PAPER", 260, 20, 12, 185],
    ["ST-012", "กระดาษโน้ตกาว (Post-it)", "PACK", "PAPER", 45, 40, 55, 30],
    ["ST-013", "สมุดปกอ่อน A5", "DOZEN", "PAPER", 180, 18, 30, 125],
    ["ST-020", "แฟ้มสันกว้าง 3 นิ้ว", "PCS", "FILE", 55, 40, 40, 38],
    ["ST-021", "แฟ้มโชว์เอกสาร 20 ไส้", "PCS", "FILE", 35, 60, 80, 24],
    ["ST-022", "ซองน้ำตาล A4", "PACK", "FILE", 90, 25, 10, 63],
    ["ST-030", "ลวดเย็บกระดาษ เบอร์ 10", "BOX", "OFFICE", 25, 50, 120, 16],
    ["ST-031", "เครื่องเย็บกระดาษ", "PCS", "OFFICE", 145, 10, 5, 100],
    ["ST-032", "กรรไกร 8 นิ้ว", "PCS", "OFFICE", 65, 20, 35, 45],
    ["ST-033", "เทปใส 1 นิ้ว (แพ็ค 8)", "SET", "OFFICE", 40, 30, 45, 27],
    ["ST-034", "คลิปหนีบกระดาษ", "BOX", "OFFICE", 20, 45, 90, 13],
    ["ST-040", "หมึกเติมปากกาไวท์บอร์ด", "BOTTLE", "INK", 55, 25, 30, 38],
    ["ST-041", "ตลับหมึก HP 680 ดำ", "PCS", "INK", 420, 8, 3, 300],
  ];

  for (const [sku, name, uc, cc, price, reorder, stock, cost] of products) {
    const p = await prisma.product.upsert({
      where: { sku },
      update: { name, unit_id: unitMap[uc], category_id: catMap[cc], sale_price: price, reorder_point: reorder },
      create: { sku, name, unit_id: unitMap[uc], category_id: catMap[cc], sale_price: price, reorder_point: reorder },
    });

    // สต๊อกยกมา = 1 movement (opening) ให้แต่ละสินค้าที่มีของ
    if (stock > 0) {
      await prisma.stock_movement.create({
        data: {
          product_id: p.id,
          qty_change: stock,
          unit_cost: cost,
          value_change: stock * cost,
          balance_qty: stock,
          balance_value: stock * cost,
          ref_type: "OPENING",
          ref_id: 0,
          ref_no: "OPENING",
          created_by: admin.id,
        },
      });
    }
  }

  // ---- ลูกค้า (ขายส่งให้ร้าน/สำนักงาน) ----
  const customers = [
    { code: "C-001", name: "บริษัท ออฟฟิศเมท จำกัด", credit_days: 30, phone: "021110001" },
    { code: "C-002", name: "ร้านเครื่องเขียนน้องเมย์", credit_days: 0, phone: "089110002" },
    { code: "C-003", name: "โรงเรียนสารสาสน์วิเทศ", credit_days: 30, phone: "021110003" },
    { code: "C-004", name: "บริษัท ไทยพาณิชย์ ซัพพลาย จำกัด", credit_days: 45, phone: "021110004" },
    { code: "C-005", name: "สหกรณ์มหาวิทยาลัย", credit_days: 15, phone: "021110005" },
  ];
  for (const c of customers) {
    await prisma.customer.upsert({ where: { code: c.code }, update: c, create: c });
  }

  // ---- ผู้ขาย/เจ้าหนี้ ----
  const suppliers = [
    { code: "S-001", name: "บริษัท ควอนตั้ม สเตชันเนอรี่ จำกัด", credit_days: 30, phone: "021220001" },
    { code: "S-002", name: "หจก. กระดาษไทยเปเปอร์", credit_days: 30, phone: "021220002" },
    { code: "S-003", name: "บริษัท เพนเทล (ประเทศไทย) จำกัด", credit_days: 45, phone: "021220003" },
    { code: "S-004", name: "บริษัท เอชพี ซัพพลาย จำกัด", credit_days: 60, phone: "021220004" },
  ];
  for (const s of suppliers) {
    await prisma.supplier.upsert({ where: { code: s.code }, update: s, create: s });
  }

  // ---- สรุป ----
  console.log("seed เสร็จ:");
  console.log("  units      :", await prisma.unit.count());
  console.log("  categories :", await prisma.product_category.count());
  console.log("  products   :", await prisma.product.count());
  console.log("  customers  :", await prisma.customer.count());
  console.log("  suppliers  :", await prisma.supplier.count());
  console.log("  movements  :", await prisma.stock_movement.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
