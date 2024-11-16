function handleSubmit(event) {
    event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ

    // ดึงค่าจากฟอร์ม
    const income = parseFloat(document.getElementById('income').value);
    const deductionPersonal = parseFloat(document.getElementById('deductionPersonal').value);
    const insuranceDeduction = parseFloat(document.getElementById('insuranceDeduction').value);
    const spouseDeduction = parseFloat(document.getElementById('spouseDeduction').value);
    const childDeduction = parseFloat(document.getElementById('childDeduction').value) * 30000; // สมมติลดหย่อนบุตร 30,000 บาทต่อคน

    // คำนวณค่าลดหย่อนรวม
    const totalDeductions = deductionPersonal + insuranceDeduction + spouseDeduction + childDeduction;
    let taxableIncome = income - totalDeductions;
    taxableIncome = taxableIncome < 0 ? 0 : taxableIncome; // ถ้าภาษีติดลบให้เป็น 0

    // คำนวณภาษีตามช่วงรายได้
    let tax = 0;
    if (taxableIncome <= 150000) {
        tax = 0; // ยกเว้นภาษี
    } else if (taxableIncome <= 300000) {
        tax = (taxableIncome - 150000) * 0.05;
    } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 300000) * 0.1 + 7500;
    } else if (taxableIncome <= 750000) {
        tax = (taxableIncome - 500000) * 0.15 + 27500;
    } else if (taxableIncome <= 1000000) {
        tax = (taxableIncome - 750000) * 0.2 + 65000;
    } else if (taxableIncome <= 2000000) {
        tax = (taxableIncome - 1000000) * 0.25 + 115000;
    } else if (taxableIncome <= 5000000) {
        tax = (taxableIncome - 2000000) * 0.3 + 365000;
    } else {
        tax = (taxableIncome - 5000000) * 0.35 + 1265000;
    }

    // เปลี่ยนหน้าไปยังหน้าผลลัพธ์พร้อมแสดงภาษี
    window.location.href = `result.html?tax=${tax}`;
}
