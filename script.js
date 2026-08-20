/* =========================================================
   TRỢ LÝ THIẾT KẾ HOẠT ĐỘNG DẠY HỌC
   script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       BIẾN TOÀN CỤC
    ===================================================== */

    const DEFAULT_LESSON_TEMPLATE = "mau_giao_an.txt";
    const FIRST_PROMPT_FILE = "first_prompt.txt";
    const SECOND_PROMPT_FILE = "second_prompt.txt";
    const THIRD_PROMPT_FILE = "third_prompt.txt";

    let lessonTemplateContent = "";
    let lessonTemplateName = DEFAULT_LESSON_TEMPLATE;

    let worksheetPromptContent = "";
    let worksheetPromptName = THIRD_PROMPT_FILE;


    /* =====================================================
       TIỆN ÍCH
    ===================================================== */

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }


    function setValue(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.value = value || "";
        }
    }


    function showToast(message) {

        const toast = document.getElementById("toast");

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    function downloadText(filename, content) {

        if (!content || !content.trim()) {
            showToast("Không có nội dung để tải.");
            return;
        }

        const blob = new Blob(
            [content],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }


    async function copyText(text) {

        if (!text || !text.trim()) {
            showToast("Không có Prompt để sao chép.");
            return;
        }

        try {

            await navigator.clipboard.writeText(text);

            showToast("Đã sao chép Prompt.");

        } catch (error) {

            const textarea = document.createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";

            document.body.appendChild(textarea);

            textarea.select();

            try {
                document.execCommand("copy");
                showToast("Đã sao chép Prompt.");
            } catch (e) {
                showToast("Không thể sao chép tự động.");
            }

            document.body.removeChild(textarea);
        }
    }


    async function loadTextFile(filename) {

        try {

            const response = await fetch(filename, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Không tìm thấy file: ${filename}`
                );
            }

            return await response.text();

        } catch (error) {

            console.error(error);

            return "";
        }
    }


    async function readUploadedText(file) {

        if (!file) return "";

        try {
            return await file.text();
        } catch (error) {

            console.error(error);

            return "";
        }
    }


    /* =====================================================
       THÔNG TIN CHUNG
    ===================================================== */

    const GENERAL_FIELDS = [
        "subject",
        "grade",
        "lesson",
        "duration",
        "lessonPosition",
        "requirements",
        "students",
        "teachingConditions",
        "equipment",
        "methodOrientation",
        "studentActivity",
        "avoid"
    ];


    function collectGeneralInfo() {

        return {
            subject: getValue("subject"),
            grade: getValue("grade"),
            lesson: getValue("lesson"),
            duration: getValue("duration"),
            lessonPosition: getValue("lessonPosition"),
            requirements: getValue("requirements"),
            students: getValue("students"),
            teachingConditions: getValue("teachingConditions"),
            equipment: getValue("equipment"),
            methodOrientation: getValue("methodOrientation"),
            studentActivity: getValue("studentActivity"),
            avoid: getValue("avoid")
        };
    }


    function saveGeneralInfo() {

        const data = collectGeneralInfo();

        localStorage.setItem(
            "teachingAssistantGeneralInfo",
            JSON.stringify(data)
        );

        showToast("Đã lưu thông tin bài học.");
    }


    function loadGeneralInfo() {

        try {

            const saved = localStorage.getItem(
                "teachingAssistantGeneralInfo"
            );

            if (!saved) return;

            const data = JSON.parse(saved);

            GENERAL_FIELDS.forEach(id => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        data,
                        id
                    )
                ) {
                    setValue(id, data[id]);
                }

            });

        } catch (error) {

            console.error(
                "Không thể đọc thông tin đã lưu:",
                error
            );

        }
    }


    function clearGeneralInfo() {

        const confirmed = confirm(
            "Bạn có chắc muốn xóa toàn bộ thông tin bài học?"
        );

        if (!confirmed) return;

        GENERAL_FIELDS.forEach(id => {
            setValue(id, "");
        });

        localStorage.removeItem(
            "teachingAssistantGeneralInfo"
        );

        showToast("Đã xóa thông tin.");
    }


    const btnSave = document.getElementById("btnSave");

    if (btnSave) {
        btnSave.addEventListener(
            "click",
            saveGeneralInfo
        );
    }


    const btnClear = document.getElementById("btnClear");

    if (btnClear) {
        btnClear.addEventListener(
            "click",
            clearGeneralInfo
        );
    }


    loadGeneralInfo();


    /* =====================================================
       TẠO KHỐI THÔNG TIN CHUNG CHO PROMPT
    ===================================================== */

    function buildGeneralInfoBlock() {

        const data = collectGeneralInfo();

        return `
============================================================
THÔNG TIN CHUNG VỀ BÀI HỌC
============================================================

Môn học:
${data.subject || "[Chưa cung cấp]"}

Lớp:
${data.grade || "[Chưa cung cấp]"}

Tên bài / chủ đề:
${data.lesson || "[Chưa cung cấp]"}

Thời lượng:
${data.duration || "[Chưa cung cấp]"}

Vị trí bài học:
${data.lessonPosition || "[Chưa cung cấp]"}

Yêu cầu cần đạt:
${data.requirements || "[Chưa cung cấp]"}

Đặc điểm học sinh:
${data.students || "[Chưa cung cấp]"}

Điều kiện lớp học:
${data.teachingConditions || "[Chưa cung cấp]"}

Thiết bị / phương tiện:
${data.equipment || "[Chưa cung cấp]"}

Định hướng dạy học:
${data.methodOrientation || "[Chưa cung cấp]"}

Mức độ hoạt động của học sinh:
${data.studentActivity || "[Chưa cung cấp]"}

Những điều muốn tránh:
${data.avoid || "[Chưa cung cấp]"}

============================================================
`;
    }


    /* =====================================================
       TAB
    ===================================================== */

    const tabButtons =
        document.querySelectorAll(".tab-button");

    const tabPanels =
        document.querySelectorAll(".tab-panel");


    tabButtons.forEach(button => {

        button.addEventListener("click", () => {

            const tabName =
                button.dataset.tab;

            tabButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            tabPanels.forEach(panel => {
                panel.classList.remove("active");
            });

            button.classList.add("active");

            const target =
                document.getElementById(
                    `tab-${tabName}`
                );

            if (target) {
                target.classList.add("active");
            }

        });

    });


    /* =====================================================
       LỰA CHỌN FIRST / NEXT
    ===================================================== */

    const promptTypeRadios =
        document.querySelectorAll(
            'input[name="promptType"]'
        );


    function updateTaskOptionStyle() {

        const options =
            document.querySelectorAll(
                ".task-option"
            );

        options.forEach(option => {

            const radio =
                option.querySelector(
                    'input[type="radio"]'
                );

            if (!radio) return;

            option.classList.toggle(
                "selected",
                radio.checked
            );

        });

    }


    promptTypeRadios.forEach(radio => {

        radio.addEventListener(
            "change",
            updateTaskOptionStyle
        );

    });


    updateTaskOptionStyle();


    /* =====================================================
       MẪU GIÁO ÁN
    ===================================================== */

    async function initializeLessonTemplate() {

        const savedContent =
            localStorage.getItem(
                "lessonTemplateContent"
            );

        const savedName =
            localStorage.getItem(
                "lessonTemplateName"
            );

        if (savedContent) {

            lessonTemplateContent =
                savedContent;

            lessonTemplateName =
                savedName ||
                DEFAULT_LESSON_TEMPLATE;

        } else {

            const content =
                await loadTextFile(
                    DEFAULT_LESSON_TEMPLATE
                );

            lessonTemplateContent =
                content;

            lessonTemplateName =
                DEFAULT_LESSON_TEMPLATE;
        }

        updateLessonTemplateUI();

        updateWorksheetTemplateUI();
    }


    function updateLessonTemplateUI() {

        const fileName =
            document.getElementById(
                "templateFileName"
            );

        if (fileName) {
            fileName.textContent =
                lessonTemplateName;
        }


        const status =
            document.getElementById(
                "templateStatus"
            );

        if (status) {

            if (lessonTemplateContent.trim()) {

                status.textContent =
                    `Đang sử dụng: ${lessonTemplateName}`;

            } else {

                status.textContent =
                    "Chưa có mẫu giáo án.";
            }

        }
    }


    function updateWorksheetTemplateUI() {

        const fileName =
            document.getElementById(
                "worksheetTemplateFileName"
            );

        if (fileName) {

            fileName.textContent =
                lessonTemplateName;
        }


        const status =
            document.getElementById(
                "worksheetTemplateStatus"
            );

        if (status) {

            if (lessonTemplateContent.trim()) {

                status.textContent =
                    `Mẫu giáo án được kế thừa: ${lessonTemplateName}`;

            } else {

                status.textContent =
                    "Chưa có mẫu giáo án để kế thừa.";
            }

        }
    }


    /* =====================================================
       TẢI MẪU GIÁO ÁN MỚI
    ===================================================== */

    const templateFile =
        document.getElementById(
            "templateFile"
        );


    if (templateFile) {

        templateFile.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) return;

                const content =
                    await readUploadedText(file);

                if (!content.trim()) {

                    showToast(
                        "File mẫu giáo án không có nội dung."
                    );

                    return;
                }

                lessonTemplateContent =
                    content;

                lessonTemplateName =
                    file.name;

                localStorage.setItem(
                    "lessonTemplateContent",
                    lessonTemplateContent
                );

                localStorage.setItem(
                    "lessonTemplateName",
                    lessonTemplateName
                );

                updateLessonTemplateUI();
                updateWorksheetTemplateUI();

                showToast(
                    "Đã tải mẫu giáo án mới."
                );

                templateFile.value = "";
            }
        );

    }


    /* =====================================================
       XEM MẪU GIÁO ÁN
    ===================================================== */

    function openTemplateModal(
        title,
        content
    ) {

        const modal =
            document.getElementById(
                "templateModal"
            );

        const preview =
            document.getElementById(
                "templatePreview"
            );

        const header =
            modal?.querySelector(
                ".modal-header h3"
            );


        if (header) {
            header.textContent =
                title;
        }

        if (preview) {
            preview.textContent =
                content ||
                "Chưa có nội dung.";
        }

        if (modal) {
            modal.classList.add("show");
        }
    }


    function closeTemplateModal() {

        const modal =
            document.getElementById(
                "templateModal"
            );

        if (modal) {
            modal.classList.remove("show");
        }
    }


    const btnPreviewTemplate =
        document.getElementById(
            "btnPreviewTemplate"
        );


    if (btnPreviewTemplate) {

        btnPreviewTemplate.addEventListener(
            "click",
            () => {

                openTemplateModal(
                    "Nội dung mẫu giáo án",
                    lessonTemplateContent
                );

            }
        );

    }


    const btnCloseModal =
        document.getElementById(
            "btnCloseModal"
        );


    if (btnCloseModal) {
        btnCloseModal.addEventListener(
            "click",
            closeTemplateModal
        );
    }


    const templateModal =
        document.getElementById(
            "templateModal"
        );


    if (templateModal) {

        templateModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    templateModal
                ) {
                    closeTemplateModal();
                }

            }
        );

    }


    /* =====================================================
       KHÔI PHỤC MẪU GIÁO ÁN
    ===================================================== */

    const btnRestoreTemplate =
        document.getElementById(
            "btnRestoreTemplate"
        );


    if (btnRestoreTemplate) {

        btnRestoreTemplate.addEventListener(
            "click",
            async () => {

                const content =
                    await loadTextFile(
                        DEFAULT_LESSON_TEMPLATE
                    );

                if (!content.trim()) {

                    showToast(
                        "Không tìm thấy mau_giao_an.txt."
                    );

                    return;
                }

                lessonTemplateContent =
                    content;

                lessonTemplateName =
                    DEFAULT_LESSON_TEMPLATE;

                localStorage.removeItem(
                    "lessonTemplateContent"
                );

                localStorage.removeItem(
                    "lessonTemplateName"
                );

                updateLessonTemplateUI();
                updateWorksheetTemplateUI();

                showToast(
                    "Đã khôi phục mẫu giáo án mặc định."
                );
            }
        );

    }


    /* =====================================================
       XÓA MẪU GIÁO ÁN
    ===================================================== */

    const btnClearTemplate =
        document.getElementById(
            "btnClearTemplate"
        );


    if (btnClearTemplate) {

        btnClearTemplate.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Bạn có chắc muốn xóa mẫu giáo án hiện tại?"
                    );

                if (!confirmed) return;

                lessonTemplateContent = "";
                lessonTemplateName = "";

                localStorage.removeItem(
                    "lessonTemplateContent"
                );

                localStorage.removeItem(
                    "lessonTemplateName"
                );

                updateLessonTemplateUI();
                updateWorksheetTemplateUI();

                showToast(
                    "Đã xóa mẫu giáo án."
                );
            }
        );

    }


    /* =====================================================
       PROMPT MẪU PHIẾU BÀI TẬP
    ===================================================== */

    async function initializeWorksheetPrompt() {

        const savedContent =
            localStorage.getItem(
                "worksheetPromptContent"
            );

        const savedName =
            localStorage.getItem(
                "worksheetPromptName"
            );


        if (savedContent) {

            worksheetPromptContent =
                savedContent;

            worksheetPromptName =
                savedName ||
                THIRD_PROMPT_FILE;

        } else {

            const content =
                await loadTextFile(
                    THIRD_PROMPT_FILE
                );

            worksheetPromptContent =
                content;

            worksheetPromptName =
                THIRD_PROMPT_FILE;
        }


        updateWorksheetPromptUI();
    }


    function updateWorksheetPromptUI() {

        const fileName =
            document.getElementById(
                "worksheetPromptFileName"
            );

        if (fileName) {

            fileName.textContent =
                worksheetPromptName ||
                "Chưa có Prompt mẫu";
        }


        const status =
            document.getElementById(
                "worksheetPromptStatus"
            );

        if (status) {

            if (worksheetPromptContent.trim()) {

                status.textContent =
                    `Đang sử dụng: ${worksheetPromptName}`;

            } else {

                status.textContent =
                    "Chưa có Prompt mẫu.";
            }

        }

    }


    /* =====================================================
       TẢI PROMPT MẪU PHIẾU BÀI TẬP
    ===================================================== */

    const worksheetPromptFile =
        document.getElementById(
            "worksheetPromptFile"
        );


    if (worksheetPromptFile) {

        worksheetPromptFile.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) return;

                const content =
                    await readUploadedText(file);

                if (!content.trim()) {

                    showToast(
                        "File Prompt mẫu không có nội dung."
                    );

                    return;
                }


                worksheetPromptContent =
                    content;

                worksheetPromptName =
                    file.name;


                localStorage.setItem(
                    "worksheetPromptContent",
                    worksheetPromptContent
                );

                localStorage.setItem(
                    "worksheetPromptName",
                    worksheetPromptName
                );


                updateWorksheetPromptUI();


                showToast(
                    "Đã tải Prompt mẫu mới."
                );


                worksheetPromptFile.value = "";
            }
        );

    }


    /* =====================================================
       XEM PROMPT MẪU PHIẾU
    ===================================================== */

    const btnPreviewWorksheetPrompt =
        document.getElementById(
            "btnPreviewWorksheetPrompt"
        );


    if (btnPreviewWorksheetPrompt) {

        btnPreviewWorksheetPrompt.addEventListener(
            "click",
            () => {

                openTemplateModal(
                    "Nội dung Prompt mẫu phiếu bài tập",
                    worksheetPromptContent
                );

            }
        );

    }


    /* =====================================================
       KHÔI PHỤC THIRD_PROMPT
    ===================================================== */

    const btnRestoreWorksheetPrompt =
        document.getElementById(
            "btnRestoreWorksheetPrompt"
        );


    if (btnRestoreWorksheetPrompt) {

        btnRestoreWorksheetPrompt.addEventListener(
            "click",
            async () => {

                const content =
                    await loadTextFile(
                        THIRD_PROMPT_FILE
                    );

                if (!content.trim()) {

                    showToast(
                        "Không tìm thấy third_prompt.txt."
                    );

                    return;
                }


                worksheetPromptContent =
                    content;

                worksheetPromptName =
                    THIRD_PROMPT_FILE;


                localStorage.removeItem(
                    "worksheetPromptContent"
                );

                localStorage.removeItem(
                    "worksheetPromptName"
                );


                updateWorksheetPromptUI();


                showToast(
                    "Đã khôi phục third_prompt.txt."
                );
            }
        );

    }


    /* =====================================================
       XÓA PROMPT MẪU
    ===================================================== */

    const btnClearWorksheetPrompt =
        document.getElementById(
            "btnClearWorksheetPrompt"
        );


    if (btnClearWorksheetPrompt) {

        btnClearWorksheetPrompt.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Bạn có chắc muốn xóa Prompt mẫu phiếu bài tập?"
                    );

                if (!confirmed) return;


                worksheetPromptContent = "";
                worksheetPromptName = "";


                localStorage.removeItem(
                    "worksheetPromptContent"
                );

                localStorage.removeItem(
                    "worksheetPromptName"
                );


                updateWorksheetPromptUI();


                showToast(
                    "Đã xóa Prompt mẫu."
                );
            }
        );

    }


    /* =====================================================
       TẠO PROMPT KẾ HOẠCH BÀI GIẢNG
    ===================================================== */

    async function generateLessonPlanPrompt() {

        const output =
            document.getElementById(
                "lessonPromptOutput"
            );

        if (!output) return;


        const selected =
            document.querySelector(
                'input[name="promptType"]:checked'
            );


        const promptType =
            selected
                ? selected.value
                : "first";


        let basePrompt = "";


        if (promptType === "first") {

            basePrompt =
                await loadTextFile(
                    FIRST_PROMPT_FILE
                );

            if (!basePrompt.trim()) {

                showToast(
                    "Không tìm thấy first_prompt.txt."
                );

                return;
            }

        } else {

            basePrompt =
                await loadTextFile(
                    SECOND_PROMPT_FILE
                );

            if (!basePrompt.trim()) {

                showToast(
                    "Không tìm thấy second_prompt.txt."
                );

                return;
            }

        }


        const infoBlock =
            buildGeneralInfoBlock();


        const templateBlock =
            lessonTemplateContent.trim()
                ? `
============================================================
MẪU GIÁO ÁN HIỆN ĐANG SỬ DỤNG
============================================================

Tên file:
${lessonTemplateName}

Nội dung mẫu:
${lessonTemplateContent}

============================================================
`
                : `
============================================================
MẪU GIÁO ÁN
============================================================

Hiện chưa có mẫu giáo án.

============================================================
`;


        const finalPrompt = `

${basePrompt.trim()}

${infoBlock}

${templateBlock}
`;


        output.value =
            finalPrompt.trim();


        output.scrollTop = 0;


        showToast(
            promptType === "first"
                ? "Đã tạo Prompt lần 1."
                : "Đã tạo Prompt cho lượt tiếp theo."
        );

    }


    const btnGenerateLessonPlan =
        document.getElementById(
            "btnGenerateLessonPlan"
        );


    if (btnGenerateLessonPlan) {

        btnGenerateLessonPlan.addEventListener(
            "click",
            generateLessonPlanPrompt
        );

    }


    /* =====================================================
       SAO CHÉP PROMPT GIÁO ÁN
    ===================================================== */

    const btnCopyLessonPrompt =
        document.getElementById(
            "btnCopyLessonPrompt"
        );


    if (btnCopyLessonPrompt) {

        btnCopyLessonPrompt.addEventListener(
            "click",
            () => {

                const output =
                    document.getElementById(
                        "lessonPromptOutput"
                    );

                copyText(
                    output
                        ? output.value
                        : ""
                );

            }
        );

    }


    /* =====================================================
       TẢI PROMPT GIÁO ÁN
    ===================================================== */

    const btnDownloadLessonPrompt =
        document.getElementById(
            "btnDownloadLessonPrompt"
        );


    if (btnDownloadLessonPrompt) {

        btnDownloadLessonPrompt.addEventListener(
            "click",
            () => {

                const output =
                    document.getElementById(
                        "lessonPromptOutput"
                    );

                downloadText(
                    "prompt_ke_hoach_bai_giang.txt",
                    output
                        ? output.value
                        : ""
                );

            }
        );

    }


    /* =====================================================
       TẠO PROMPT PHIẾU BÀI TẬP
    ===================================================== */

    function generateWorksheetPrompt() {

        const output =
            document.getElementById(
                "worksheetPromptOutput"
            );

        if (!output) return;


        if (!worksheetPromptContent.trim()) {

            showToast(
                "Chưa có Prompt mẫu phiếu bài tập."
            );

            return;
        }


        const infoBlock =
            buildGeneralInfoBlock();


        const templateBlock =
            lessonTemplateContent.trim()
                ? `
============================================================
MẪU GIÁO ÁN ĐƯỢC KẾ THỪA
============================================================

Tên file:
${lessonTemplateName}

Nội dung mẫu:
${lessonTemplateContent}

============================================================
`
                : `
============================================================
MẪU GIÁO ÁN ĐƯỢC KẾ THỪA
============================================================

Hiện chưa có mẫu giáo án.

============================================================
`;


        const finalPrompt = `

${worksheetPromptContent.trim()}

${infoBlock}

${templateBlock}

============================================================
LƯU Ý VỀ TÀI LIỆU KẾ HOẠCH BÀI GIẢNG
============================================================

Ứng dụng này không trực tiếp đọc hoặc xử lý
kế hoạch bài giảng.

Khi sử dụng Prompt này với AI, giáo viên cần
cung cấp kế hoạch bài giảng trong cùng cuộc trò chuyện
để AI sử dụng làm nguồn dữ liệu đầu vào.

Không được giả định nội dung kế hoạch bài giảng
nếu giáo viên chưa cung cấp tài liệu đó.

============================================================
`;


        output.value =
            finalPrompt.trim();


        output.scrollTop = 0;


        showToast(
            "Đã tạo Prompt phiếu bài tập."
        );

    }


    const btnGenerateWorksheet =
        document.getElementById(
            "btnGenerateWorksheet"
        );


    if (btnGenerateWorksheet) {

        btnGenerateWorksheet.addEventListener(
            "click",
            generateWorksheetPrompt
        );

    }


    /* =====================================================
       SAO CHÉP PROMPT PHIẾU
    ===================================================== */

    const btnCopyWorksheetPrompt =
        document.getElementById(
            "btnCopyWorksheetPrompt"
        );


    if (btnCopyWorksheetPrompt) {

        btnCopyWorksheetPrompt.addEventListener(
            "click",
            () => {

                const output =
                    document.getElementById(
                        "worksheetPromptOutput"
                    );

                copyText(
                    output
                        ? output.value
                        : ""
                );

            }
        );

    }


    /* =====================================================
       TẢI PROMPT PHIẾU
    ===================================================== */

    const btnDownloadWorksheetPrompt =
        document.getElementById(
            "btnDownloadWorksheetPrompt"
        );


    if (btnDownloadWorksheetPrompt) {

        btnDownloadWorksheetPrompt.addEventListener(
            "click",
            () => {

                const output =
                    document.getElementById(
                        "worksheetPromptOutput"
                    );

                downloadText(
                    "prompt_phieu_bai_tap.txt",
                    output
                        ? output.value
                        : ""
                );

            }
        );

    }


    /* =====================================================
       KHỞI TẠO
    ===================================================== */

    initializeLessonTemplate();

    initializeWorksheetPrompt();


    /* =====================================================
       ESC ĐÓNG MODAL
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeTemplateModal();
            }

        }
    );

});
