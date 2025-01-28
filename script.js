document.addEventListener("DOMContentLoaded", function () {
    // ฟังก์ชันจัดรูปแบบตัวเลขขณะพิมพ์
    const formatNumberInput = (input) => {
        input.addEventListener("input", () => {
            let value = input.value.replace(/,/g, ""); // เอาเครื่องหมายจุลภาคออกก่อน
            if (!isNaN(value) && value !== "") {
                input.value = parseFloat(value).toLocaleString(); // เพิ่มจุลภาคอัตโนมัติ
            }
        });

        input.addEventListener("blur", () => {
            if (input.value === "") {
                input.value = "0"; // ถ้าเป็นค่าว่าง ให้ใส่ 0 แทน
            }
        });
    };

    // ใส่ Event Listener ให้กับทุกช่องอินพุตที่ต้องการจัดรูปแบบตัวเลข
    const numericInputs = document.querySelectorAll(".format-number");
    numericInputs.forEach(formatNumberInput);

    // ดักจับฟอร์มและเก็บข้อมูลเหมือนโค้ดก่อนหน้า
    const incomeForm = document.getElementById("incomeForm");
    if (incomeForm) {
        incomeForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const income = parseFloat(document.getElementById("income").value.replace(/,/g, "")) || 0;
            localStorage.setItem("income", income);
            window.location.href = "income_bonus.html";
        });
    }

    const incomeBonusForm = document.getElementById("incomeBonusForm");
    if (incomeBonusForm) {
        incomeBonusForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const bonus = parseFloat(document.getElementById("bonus").value.replace(/,/g, "")) || 0;
            const otherIncome = parseFloat(document.getElementById("otherIncome").value.replace(/,/g, "")) || 0;
            localStorage.setItem("bonus", bonus);
            localStorage.setItem("otherIncome", otherIncome);
            window.location.href = "parent_disability.html";
        });
    }

    const deductionForm1 = document.getElementById("deductionForm1");
    if (deductionForm1) {
        deductionForm1.addEventListener("submit", function (e) {
            e.preventDefault();
            const parentDeduction = parseFloat(document.getElementById("parentDeduction").value.replace(/,/g, "")) || 0;
            const disabilityDeduction = parseFloat(document.getElementById("disabilityDeduction").value.replace(/,/g, "")) || 0;
            const hasChild = document.getElementById("hasChild").value;
            const numChildren = hasChild === "yes" ? parseFloat(document.getElementById("numChildren").value.replace(/,/g, "")) || 0 : 0;
            const spouseDeduction = parseFloat(document.getElementById("spouseDeduction").value.replace(/,/g, "")) || 0;
            
            // คำนวณลดหย่อนสำหรับบุตร
            const childDeduction = numChildren * 30000; // ลดหย่อนคนละ 30,000 บาท

            // เก็บข้อมูลใน localStorage
            localStorage.setItem("parentDeduction", parentDeduction);
            localStorage.setItem("disabilityDeduction", disabilityDeduction);
            localStorage.setItem("childDeduction", childDeduction);
            localStorage.setItem("spouseDeduction", spouseDeduction);
            window.location.href = "pvd_social_security.html";
        });
    }

    const deductionForm2 = document.getElementById("deductionForm2");
    if (deductionForm2) {
        deductionForm2.addEventListener("submit", function (e) {
            e.preventDefault();
            const pvdDeduction = parseFloat(document.getElementById("pvdDeduction").value.replace(/,/g, "")) || 0;
            const socialSecurityDeduction = parseFloat(document.getElementById("socialSecurityDeduction").value.replace(/,/g, "")) || 0;
            localStorage.setItem("pvdDeduction", pvdDeduction);
            localStorage.setItem("socialSecurityDeduction", socialSecurityDeduction);
            window.location.href = "summary.html";
        });
    }

    // ฟังก์ชันคำนวณและแสดงผลในหน้าสรุป
    window.calculateAndDisplaySummary = function () {
        const income = parseFloat(localStorage.getItem("income")) || 0;
        const bonus = parseFloat(localStorage.getItem("bonus")) || 0;
        const otherIncome = parseFloat(localStorage.getItem("otherIncome")) || 0;
        const parentDeduction = parseFloat(localStorage.getItem("parentDeduction")) || 0;
        const disabilityDeduction = parseFloat(localStorage.getItem("disabilityDeduction")) || 0;
        const childDeduction = parseFloat(localStorage.getItem("childDeduction")) || 0;
        const spouseDeduction = parseFloat(localStorage.getItem("spouseDeduction")) || 0;
        const pvdDeduction = parseFloat(localStorage.getItem("pvdDeduction")) || 0;
        const socialSecurityDeduction = parseFloat(localStorage.getItem("socialSecurityDeduction")) || 0;

        // คำนวณรายได้รวม
        const totalIncome = income + bonus + otherIncome;

        // คำนวณค่าใช้จ่าย 50% แต่ไม่เกิน 100,000 บาท
        const expenseDeduction = Math.min(totalIncome * 0.5, 100000);

        // รายได้ที่ใช้คำนวณภาษีหลังหักค่าใช้จ่าย
        const taxableIncome = totalIncome - expenseDeduction;

        // คำนวณค่าลดหย่อนทั้งหมด
        const totalDeductions =
            parentDeduction +
            disabilityDeduction +
            childDeduction +
            spouseDeduction +
            pvdDeduction +
            socialSecurityDeduction;

        // รายได้สุทธิหลังหักค่าลดหย่อน
        const netIncome = Math.max(0, taxableIncome - totalDeductions);

        // อัตราภาษีแบบขั้นบันได
        let taxToPay = 0;
        if (netIncome > 150000) {
            const taxBrackets = [
                { max: 300000, rate: 0.05 },
                { max: 500000, rate: 0.1 },
                { max: 750000, rate: 0.15 },
                { max: 1000000, rate: 0.2 },
                { max: 2000000, rate: 0.25 },
                { max: 5000000, rate: 0.3 },
                { max: Infinity, rate: 0.35 },
            ];

            let taxable = netIncome;
            let previousMax = 150000;
            for (const bracket of taxBrackets) {
                if (taxable > 0) {
                    const bracketAmount = Math.min(taxable, bracket.max - previousMax);
                    taxToPay += bracketAmount * bracket.rate;
                    taxable -= bracketAmount;
                    previousMax = bracket.max;
                }
            }
        }

        // อัปเดต UI
        document.getElementById("totalIncome").textContent = totalIncome.toLocaleString();
        document.getElementById("expenseDeduction").textContent = expenseDeduction.toLocaleString();
        document.getElementById("taxableIncome").textContent = taxableIncome.toLocaleString();
        document.getElementById("totalDeductions").textContent = totalDeductions.toLocaleString();
        document.getElementById("netIncome").textContent = netIncome.toLocaleString();
        document.getElementById("taxToPay").textContent = taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2 });
    };
});
window.calculateAndDisplaySummary = function () {
    const income = parseFloat(localStorage.getItem("income")) || 0;
    const bonus = parseFloat(localStorage.getItem("bonus")) || 0;
    const otherIncome = parseFloat(localStorage.getItem("otherIncome")) || 0;
    const parentDeduction = parseFloat(localStorage.getItem("parentDeduction")) || 0;
    const disabilityDeduction = parseFloat(localStorage.getItem("disabilityDeduction")) || 0;
    const childDeduction = parseFloat(localStorage.getItem("childDeduction")) || 0;
    const spouseDeduction = parseFloat(localStorage.getItem("spouseDeduction")) || 0;
    const pvdDeduction = parseFloat(localStorage.getItem("pvdDeduction")) || 0;
    const socialSecurityDeduction = parseFloat(localStorage.getItem("socialSecurityDeduction")) || 0;

    const totalIncome = income + bonus + otherIncome;
    const expenseDeduction = Math.min(totalIncome * 0.5, 100000);
    const taxableIncome = totalIncome - expenseDeduction;

    const totalDeductions =
        parentDeduction +
        disabilityDeduction +
        childDeduction +
        spouseDeduction +
        pvdDeduction +
        socialSecurityDeduction;

    const netIncome = Math.max(0, taxableIncome - totalDeductions);

    let taxToPay = 0;
    if (netIncome > 150000) {
        const taxBrackets = [
            { max: 300000, rate: 0.05 },
            { max: 500000, rate: 0.1 },
            { max: 750000, rate: 0.15 },
            { max: 1000000, rate: 0.2 },
            { max: 2000000, rate: 0.25 },
            { max: 5000000, rate: 0.3 },
            { max: Infinity, rate: 0.35 },
        ];

        let taxable = netIncome;
        let previousMax = 150000;
        for (const bracket of taxBrackets) {
            if (taxable > 0) {
                const bracketAmount = Math.min(taxable, bracket.max - previousMax);
                taxToPay += bracketAmount * bracket.rate;
                taxable -= bracketAmount;
                previousMax = bracket.max;
            }
        }
    }

    // อัปเดต UI
    document.getElementById("totalIncome").textContent = totalIncome.toLocaleString();
    document.getElementById("expenseDeduction").textContent = expenseDeduction.toLocaleString();
    document.getElementById("taxableIncome").textContent = taxableIncome.toLocaleString();
    document.getElementById("totalDeductions").textContent = totalDeductions.toLocaleString();
    document.getElementById("netIncome").textContent = netIncome.toLocaleString();
    document.getElementById("taxToPay").textContent = taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // แสดงรายละเอียดการลดหย่อน
    const deductionDetails = document.getElementById("deductionDetails");
    deductionDetails.innerHTML = `
        <li>ค่าลดหย่อนบิดามารดา: ${parentDeduction.toLocaleString()} บาท</li>
        <li>ค่าลดหย่อนผู้พิการ: ${disabilityDeduction.toLocaleString()} บาท</li>
        <li>ค่าลดหย่อนบุตร: ${childDeduction.toLocaleString()} บาท</li>
        <li>ค่าลดหย่อนคู่สมรส: ${spouseDeduction.toLocaleString()} บาท</li>
        <li>ค่าลดหย่อนกองทุนสำรองเลี้ยงชีพ (PVD): ${pvdDeduction.toLocaleString()} บาท</li>
        <li>ค่าลดหย่อนประกันสังคม: ${socialSecurityDeduction.toLocaleString()} บาท</li>
    `;

    // แสดงคำอธิบายวิธีการคำนวณภาษี
    document.getElementById("calculationDetails").textContent = `
        รายได้รวม: ${totalIncome.toLocaleString()} บาท
        - ค่าใช้จ่ายหัก (50% แต่ไม่เกิน 100,000 บาท): ${expenseDeduction.toLocaleString()} บาท
        = รายได้ที่ใช้คำนวณภาษี: ${taxableIncome.toLocaleString()} บาท
        - ค่าลดหย่อนทั้งหมด: ${totalDeductions.toLocaleString()} บาท
        = รายได้สุทธิ: ${netIncome.toLocaleString()} บาท
    `;

    // แสดงคำแนะนำ
    document.getElementById("taxAdvice").textContent = `
        คำแนะนำ: 
        1. คุณสามารถลดหย่อนภาษีเพิ่มเติมได้ด้วยการลงทุนในกองทุนรวมเพื่อการออม (SSF/RMF) 
        2. บริจาคเพื่อการกุศลหรือศึกษาที่ได้รับการยกเว้นภาษี
    `;
};
document.addEventListener("DOMContentLoaded", function () {
    window.calculateAndDisplaySummary = function () {
        // ดึงค่าจาก LocalStorage
        const income = parseFloat(localStorage.getItem("income")) || 0;
        const bonus = parseFloat(localStorage.getItem("bonus")) || 0;
        const otherIncome = parseFloat(localStorage.getItem("otherIncome")) || 0;
        const parentDeduction = parseFloat(localStorage.getItem("parentDeduction")) || 0;
        const disabilityDeduction = parseFloat(localStorage.getItem("disabilityDeduction")) || 0;
        const childDeduction = parseFloat(localStorage.getItem("childDeduction")) || 0;
        const spouseDeduction = parseFloat(localStorage.getItem("spouseDeduction")) || 0;
        const pvdDeduction = parseFloat(localStorage.getItem("pvdDeduction")) || 0;
        const socialSecurityDeduction = parseFloat(localStorage.getItem("socialSecurityDeduction")) || 0;

        // คำนวณรายได้รวม
        const totalIncome = income + bonus + otherIncome;

        // คำนวณค่าใช้จ่ายที่หักได้ (50% ของรายได้ แต่ไม่เกิน 100,000 บาท)
        const expenseDeduction = Math.min(totalIncome * 0.5, 100000);

        // คำนวณรายได้ที่ต้องเสียภาษี
        const taxableIncome = totalIncome - expenseDeduction;

        // คำนวณค่าลดหย่อนทั้งหมด
        const totalDeductions =
            parentDeduction +
            disabilityDeduction +
            childDeduction +
            spouseDeduction +
            pvdDeduction +
            socialSecurityDeduction;

        // คำนวณรายได้สุทธิ
        const netIncome = Math.max(0, taxableIncome - totalDeductions);

        // คำนวณภาษีที่ต้องจ่าย (อัตราภาษีขั้นบันได)
        let taxToPay = 0;
        if (netIncome > 150000) {
            const taxBrackets = [
                { max: 300000, rate: 0.05 },
                { max: 500000, rate: 0.1 },
                { max: 750000, rate: 0.15 },
                { max: 1000000, rate: 0.2 },
                { max: 2000000, rate: 0.25 },
                { max: 5000000, rate: 0.3 },
                { max: Infinity, rate: 0.35 },
            ];

            let taxable = netIncome;
            let previousMax = 150000;
            for (const bracket of taxBrackets) {
                if (taxable > 0) {
                    const bracketAmount = Math.min(taxable, bracket.max - previousMax);
                    taxToPay += bracketAmount * bracket.rate;
                    taxable -= bracketAmount;
                    previousMax = bracket.max;
                }
            }
        }

        // อัปเดต UI
        document.getElementById("totalIncome").textContent = totalIncome.toLocaleString();
        document.getElementById("expenseDeduction").textContent = expenseDeduction.toLocaleString();
        document.getElementById("taxableIncome").textContent = taxableIncome.toLocaleString();
        document.getElementById("totalDeductions").textContent = totalDeductions.toLocaleString();
        document.getElementById("netIncome").textContent = netIncome.toLocaleString();
        document.getElementById("taxToPay").textContent = taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2 });

        // แสดงรายละเอียดค่าลดหย่อน
        document.getElementById("deductionDetails").innerHTML = `
            <li>ค่าลดหย่อนบิดามารดา: ${parentDeduction.toLocaleString()} บาท</li>
            <li>ค่าลดหย่อนผู้พิการ: ${disabilityDeduction.toLocaleString()} บาท</li>
            <li>ค่าลดหย่อนบุตร: ${childDeduction.toLocaleString()} บาท</li>
            <li>ค่าลดหย่อนคู่สมรส: ${spouseDeduction.toLocaleString()} บาท</li>
            <li>ค่าลดหย่อนกองทุนสำรองเลี้ยงชีพ (PVD): ${pvdDeduction.toLocaleString()} บาท</li>
            <li>ค่าลดหย่อนประกันสังคม: ${socialSecurityDeduction.toLocaleString()} บาท</li>
        `;

        // แสดงคำอธิบายวิธีการคำนวณภาษี
        document.getElementById("calculationDetails").innerHTML = `
            <strong>รายได้รวม:</strong> ${totalIncome.toLocaleString()} บาท<br>
            - ค่าใช้จ่ายหัก (50% แต่ไม่เกิน 100,000 บาท): ${expenseDeduction.toLocaleString()} บาท<br>
            = รายได้ที่ใช้คำนวณภาษี: ${taxableIncome.toLocaleString()} บาท<br>
            - ค่าลดหย่อนทั้งหมด: ${totalDeductions.toLocaleString()} บาท<br>
            = รายได้สุทธิ: ${netIncome.toLocaleString()} บาท
        `;

        // แสดงคำแนะนำ
        document.getElementById("taxAdvice").innerHTML = `
            <strong>คำแนะนำ:</strong><br>
            1. คุณสามารถลดหย่อนภาษีเพิ่มเติมได้โดยการลงทุนในกองทุน SSF หรือ RMF<br>
            2. บริจาคเพื่อการกุศลสามารถนำไปลดหย่อนภาษีได้<br>
            3. ตรวจสอบสิทธิ์ลดหย่อนภาษีอื่น ๆ ที่คุณสามารถใช้ประโยชน์ได้
        `;
    };
});
