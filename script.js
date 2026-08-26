document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // BIẾN TOÀN CỤC & TỆP MẶC ĐỊNH
    // =====================================================
    const DEFAULT_LESSON_TEMPLATE = "mau_giao_an.txt";
    const DEFAULT_PROMPT1 = "first_prompt.txt";
    const DEFAULT_PROMPT2 = "second_prompt.txt";
    const DEFAULT_PROMPT3 = "third_prompt.txt";

    let lessonTemplateContent = "";
    let prompt1Content = "";
    let prompt2Content = "";
    let prompt3Content = "";

    const FIELD_MAP = [
        { id: "subject", label: "Môn học" },
        { id: "grade", label: "Lớp" },
        { id: "lesson", label: "Tên bài / chủ đề" },
        { id: "duration", label: "Thời lượng" },
        { id: "lessonPosition", label: "Vị trí bài học" },
        { id: "requirements", label: "Yêu cầu cần đạt" },
        { id: "students", label: "Đặc điểm học sinh" },
        { id: "teachingConditions", label: "Điều kiện lớp học" },
        { id: "equipment", label: "Thiết bị / phương tiện" },
        { id: "methodOrientation", label: "Định hướng dạy học" },
        { id: "studentActivity", label: "Mức độ hoạt động của học sinh" },
        { id: "avoid", label: "Những điều muốn tránh" }
    ];

    // =====================================================
    // TIỆN ÍCH
    // =====================================================
    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    }

    function setValue(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    }

    function showToast(msg) {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
    }

    async function loadTextFile(filename) {
        try {
            const res = await fetch(filename, { cache: "no-store" });
            return res.ok ? await res.text() : "";
        } catch {
            return "";
        }
    }

    // =====================================================
    // CHỨC NĂNG THẺ 1: EXPORT & IMPORT THÔNG TIN (.TXT)
    // =====================================================
    function exportGeneralInfo() {
        let content = "";
        FIELD_MAP.forEach(item => {
            const val = getValue(item.id);
            content += `[${item.label}]\n${val}\n\n`;
        });

        const lessonName = getValue("lesson") || "thong_tin_bai_hoc";
        const filename = `${lessonName.replace(/[^a-zA-Z0-9_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/g, "_")}.txt`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast("Đã tải tệp thông tin bài học.");
    }

    function importGeneralInfo(fileContent) {
        FIELD_MAP.forEach(item => {
            const pattern = new RegExp(`\\[${item.label}\\]\\r?\\n([\\s\\S]*?)(?=\\r?\\n\\[|$)`, "i");
            const match = fileContent.match(pattern);
            if (match) {
                setValue(item.id, match[1].trim());
            } else {
                setValue(item.id, "");
            }
        });
        showToast("Đã nhập thông tin từ file .txt thành công!");
    }

    document.getElementById("btnExport")?.addEventListener("click", exportGeneralInfo);

    document.getElementById("btnImport")?.addEventListener("click", () => {
        document.getElementById("importFile").click();
    });

    document.getElementById("importFile")?.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        importGeneralInfo(text);
        e.target.value = "";
    });

    document.getElementById("btnSave")?.addEventListener("click", () => {
        const data = {};
        FIELD_MAP.forEach(f => data[f.id] = getValue(f.id));
        localStorage.setItem("generalInfo", JSON.stringify(data));
        showToast("Đã lưu thông tin vào trình duyệt!");
    });

    document.getElementById("btnClear")?.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?")) {
            FIELD_MAP.forEach(f => setValue(f.id, ""));
            localStorage.removeItem("generalInfo");
            showToast("Đã xóa toàn bộ thông tin!");
        }
    });

    // Khôi phục từ LocalStorage nếu có
    (function loadSavedGeneralInfo() {
        const saved = localStorage.getItem("generalInfo");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                FIELD_MAP.forEach(f => setValue(f.id, data[f.id] || ""));
            } catch (e) {}
        }
    })();

    // =====================================================
    // CHỨC NĂNG CHUYỂN TAB (2 THẺ)
    // =====================================================
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add("active");
        });
    });

    // =====================================================
    // KHỞI TẠO PROMPT & MẪU GIÁO ÁN
    // =====================================================
    async function initTemplatesAndPrompts() {
        lessonTemplateContent = localStorage.getItem("customLessonTemplate") || await loadTextFile(DEFAULT_LESSON_TEMPLATE);
        prompt1Content = localStorage.getItem("customPrompt1") || await loadTextFile(DEFAULT_PROMPT1);
        prompt2Content = localStorage.getItem("customPrompt2") || await loadTextFile(DEFAULT_PROMPT2);
        prompt3Content = localStorage.getItem("customPrompt3") || await loadTextFile(DEFAULT_PROMPT3);
    }
    initTemplatesAndPrompts();

    // Modal điều khiển
    function openModal(title, text) {
        document.querySelector("#templateModal h3").textContent = title;
        document.getElementById("templatePreview").textContent = text || "Chưa có nội dung";
        document.getElementById("templateModal").classList.add("show");
    }

    document.getElementById("btnCloseModal")?.addEventListener("click", () => {
        document.getElementById("templateModal").classList.remove("show");
    });

    // Gắn sự kiện quản lý Mẫu giáo án
    document.getElementById("btnUploadTemplate")?.addEventListener("click", () => document.getElementById("templateFile").click());
    document.getElementById("templateFile")?.addEventListener("change", async (e) => {
        if (e.target.files[0]) {
            lessonTemplateContent = await e.target.files[0].text();
            localStorage.setItem("customLessonTemplate", lessonTemplateContent);
            showToast("Đã cập nhật mẫu giáo án mới!");
        }
    });
    document.getElementById("btnPreviewTemplate")?.addEventListener("click", () => openModal("Mẫu giáo án & Phiếu bài tập", lessonTemplateContent));
    document.getElementById("btnResetTemplate")?.addEventListener("click", async () => {
        lessonTemplateContent = await loadTextFile(DEFAULT_LESSON_TEMPLATE);
        localStorage.removeItem("customLessonTemplate");
        showToast("Đã khôi phục mẫu mặc định!");
    });

    // Gắn sự kiện Prompt 1, 2, 3
    function bindPromptEvents(idx, getVar, setVar, defaultFile, storageKey) {
        document.getElementById(`btnUploadPrompt${idx}`)?.addEventListener("click", () => document.getElementById(`filePrompt${idx}`).click());
        document.getElementById(`filePrompt${idx}`)?.addEventListener("change", async (e) => {
            if (e.target.files[0]) {
                setVar(await e.target.files[0].text());
                localStorage.setItem(storageKey, getVar());
                showToast(`Đã tải Prompt ${idx} mới!`);
            }
        });
        document.getElementById(`btnViewPrompt${idx}`)?.addEventListener("click", () => openModal(`Prompt ${idx}`, getVar()));
        document.getElementById(`btnResetPrompt${idx}`)?.addEventListener("click", async () => {
            setVar(await loadTextFile(defaultFile));
            localStorage.removeItem(storageKey);
            showToast(`Đã khôi phục Prompt ${idx} mặc định!`);
        });
    }

    bindPromptEvents(1, () => prompt1Content, (v) => prompt1Content = v, DEFAULT_PROMPT1, "customPrompt1");
    bindPromptEvents(2, () => prompt2Content, (v) => prompt2Content = v, DEFAULT_PROMPT2, "customPrompt2");
    bindPromptEvents(3, () => prompt3Content, (v) => prompt3Content = v, DEFAULT_PROMPT3, "customPrompt3");

    // =====================================================
    // BUILD KHỐI THÔNG TIN DÙNG CHUNG
    // =====================================================
    function buildGeneralInfoBlock() {
        let block = "============================================================\n";
        block += "THÔNG TIN CHUNG VỀ BÀI HỌC\n";
        block += "============================================================\n\n";
        FIELD_MAP.forEach(item => {
            const val = getValue(item.id);
            block += `${item.label}:\n${val || "[Chưa cung cấp]"}\n\n`;
        });
        return block;
    }

    function buildTemplateBlock() {
        if (!lessonTemplateContent.trim()) return "";
        return "============================================================\n" +
               "MẪU GIÁO ÁN VÀ PHIẾU BÀI TẬP THAM CHIẾU\n" +
               "============================================================\n\n" +
               lessonTemplateContent + "\n\n";
    }

    // =====================================================
    // NÚT TẠO PROMPT VÀ XUẤT TỆP ZIP
    // =====================================================
    document.getElementById("btnGenerateZip")?.addEventListener("click", async () => {
        if (typeof JSZip === "undefined") {
            showToast("Đang tải thư viện tạo zip, vui lòng thử lại sau vài giây...");
            return;
        }

        const zip = new JSZip();
        const lessonName = getValue("lesson") || "bai_hoc";
        const safeLessonName = lessonName.replace(/[^a-zA-Z0-9_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/g, "_");

        const generalInfo = buildGeneralInfoBlock();
        const templateInfo = buildTemplateBlock();

        // 1. Prompt 1 (first_prompt.txt)
        const fullPrompt1 = prompt1Content + "\n\n" + generalInfo + templateInfo;
        zip.file(`1_Prompt_xay_dung_y_tuong_${safeLessonName}.txt`, fullPrompt1);

        // 2. Prompt 2 (second_prompt.txt)
        const fullPrompt2 = prompt2Content + "\n\n" + generalInfo + templateInfo;
        zip.file(`2_Prompt_thiet_ke_chi_tiet_pha_${safeLessonName}.txt`, fullPrompt2);

        // 3. Prompt 3 (third_prompt.txt)
        const fullPrompt3 = prompt3Content + "\n\n" + generalInfo + templateInfo;
        zip.file(`3_Prompt_thiet_ke_phieu_hoat_dong_${safeLessonName}.txt`, fullPrompt3);

        // Xuất tệp ZIP
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a
