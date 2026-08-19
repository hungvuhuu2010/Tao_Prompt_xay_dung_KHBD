/* =========================================================
   TRỢ LÝ TẠO PROMPT THIẾT KẾ HOẠT ĐỘNG DẠY HỌC
   ---------------------------------------------------------
   File:
   - first_prompt.txt
   - second_prompt.txt
   - mau_giao_an.txt
   ========================================================= */


/* =========================================================
   1. CẤU HÌNH
========================================================= */

const CONFIG = {

    files: {
        firstPrompt: "first_prompt.txt",
        secondPrompt: "second_prompt.txt",
        defaultTemplate: "mau_giao_an.txt"
    },

    storage: {
        form: "lessonActivityPrompt_form",
        template: "lessonActivityPrompt_template",
        templateName: "lessonActivityPrompt_templateName"
    }

};


/* =========================================================
   2. BIẾN TOÀN CỤC
========================================================= */

let currentTemplate = "";

let currentTemplateName = "mau_giao_an.txt";

let firstPromptTemplate = "";

let secondPromptTemplate = "";


/* =========================================================
   3. DOM
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   4. KHỞI TẠO
========================================================= */

document.addEventListener("DOMContentLoaded", init);


async function init() {

    bindEvents();

    loadData();

    await loadPromptTemplates();

    await loadTemplate();

    updateTaskOptionStyle();

}


/* =========================================================
   5. GẮN SỰ KIỆN
========================================================= */

function bindEvents() {

    /* -------------------------
       Chọn loại Prompt
    ------------------------- */

    document
        .querySelectorAll('input[name="promptType"]')
        .forEach(radio => {

            radio.addEventListener(
                "change",
                updateTaskOptionStyle
            );

        });


    /* -------------------------
       Tạo Prompt
    ------------------------- */

    $("btnGenerate").addEventListener(
        "click",
        generatePrompt
    );


    /* -------------------------
       Lưu dữ liệu
    ------------------------- */

    $("btnSave").addEventListener(
        "click",
        saveData
    );


    /* -------------------------
       Xóa dữ liệu
    ------------------------- */

    $("btnClear").addEventListener(
        "click",
        clearData
    );


    /* -------------------------
       Copy Prompt
    ------------------------- */

    $("btnCopyPrompt").addEventListener(
        "click",
        copyPrompt
    );


    /* -------------------------
       Download Prompt
    ------------------------- */

    $("btnDownloadPrompt").addEventListener(
        "click",
        downloadPrompt
    );


    /* -------------------------
       Tải mẫu giáo án mới
    ------------------------- */

    $("templateFile").addEventListener(
        "change",
        loadTemplateFile
    );


    /* -------------------------
       Xem mẫu
    ------------------------- */

    $("btnPreviewTemplate").addEventListener(
        "click",
        previewTemplate
    );


    /* -------------------------
       Khôi phục mẫu mặc định
    ------------------------- */

    $("btnRestoreTemplate").addEventListener(
        "click",
        restoreDefaultTemplate
    );


    /* -------------------------
       Xóa mẫu
    ------------------------- */

    $("btnClearTemplate").addEventListener(
        "click",
        clearTemplate
    );


    /* -------------------------
       Đóng Modal
    ------------------------- */

    $("btnCloseModal").addEventListener(
        "click",
        closeTemplateModal
    );


    $("templateModal").addEventListener(
        "click",
        function (event) {

            if (event.target === $("templateModal")) {
                closeTemplateModal();
            }

        }
    );


    /* -------------------------
       Tự động lưu khi thay đổi
    ------------------------- */

    document
        .querySelectorAll(
            "#subject, #grade, #lesson, #duration, " +
            "#lessonPosition, #requirements, #students, " +
            "#teachingConditions, #equipment, " +
            "#methodOrientation, #studentActivity, #avoid"
        )
        .forEach(element => {

            element.addEventListener(
                "input",
                debounce(saveDataSilently, 500)
            );

        });

}


/* =========================================================
   6. STYLE CHO LỰA CHỌN LẦN 1 / LẦN TIẾP THEO
========================================================= */

function updateTaskOptionStyle() {

    document
        .querySelectorAll(".task-option")
        .forEach(option => {

            const radio = option.querySelector(
                'input[type="radio"]'
            );

            option.classList.toggle(
                "selected",
                radio.checked
            );

        });

}


/* =========================================================
   7. ĐỌC FILE PROMPT
========================================================= */

async function loadPromptTemplates() {

    try {

        const firstResponse = await fetch(
            CONFIG.files.firstPrompt,
            {
                cache: "no-store"
            }
        );

        if (!firstResponse.ok) {
            throw new Error(
                "Không thể tải first_prompt.txt"
            );
        }

        firstPromptTemplate =
            await firstResponse.text();


    } catch (error) {

        console.error(
            "Lỗi tải first_prompt.txt:",
            error
        );

        firstPromptTemplate = "";

        showToast(
            "Không tải được first_prompt.txt"
        );

    }


    try {

        const secondResponse = await fetch(
            CONFIG.files.secondPrompt,
            {
                cache: "no-store"
            }
        );

        if (!secondResponse.ok) {
            throw new Error(
                "Không thể tải second_prompt.txt"
            );
        }

        secondPromptTemplate =
            await secondResponse.text();


    } catch (error) {

        console.error(
            "Lỗi tải second_prompt.txt:",
            error
        );

        secondPromptTemplate = "";

        showToast(
            "Không tải được second_prompt.txt"
        );

    }

}


/* =========================================================
   8. ĐỌC MẪU GIÁO ÁN
========================================================= */

async function loadTemplate() {

    const savedTemplate =
        localStorage.getItem(
            CONFIG.storage.template
        );

    const savedTemplateName =
        localStorage.getItem(
            CONFIG.storage.templateName
        );


    /* -------------------------
       Nếu đã có mẫu người dùng
    ------------------------- */

    if (savedTemplate !== null) {

        currentTemplate =
            savedTemplate;

        currentTemplateName =
            savedTemplateName ||
            "Mẫu giáo án tùy chỉnh";

        updateTemplateUI();

        return;
    }


    /* -------------------------
       Nếu chưa có → đọc mặc định
    ------------------------- */

    await restoreDefaultTemplate(false);

}


/* =========================================================
   9. TẢI FILE MẪU MẶC ĐỊNH
========================================================= */

async function fetchDefaultTemplate() {

    const response = await fetch(
        CONFIG.files.defaultTemplate,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            "Không tìm thấy mau_giao_an.txt"
        );

    }

    return await response.text();

}


/* =========================================================
   10. TẢI FILE MẪU MỚI
========================================================= */

async function loadTemplateFile(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    if (
        file.type &&
        file.type !== "text/plain" &&
        !file.name.toLowerCase().endsWith(".txt")
    ) {

        showToast(
            "Vui lòng chọn file .txt"
        );

        event.target.value = "";

        return;
    }


    try {

        const text =
            await file.text();


        if (!text.trim()) {

            showToast(
                "File mẫu đang trống."
            );

            return;
        }


        currentTemplate =
            text;

        currentTemplateName =
            file.name;


        localStorage.setItem(
            CONFIG.storage.template,
            currentTemplate
        );

        localStorage.setItem(
            CONFIG.storage.templateName,
            currentTemplateName
        );


        updateTemplateUI();

        showToast(
            "Đã tải mẫu giáo án mới."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Không thể đọc file mẫu."
        );

    }


    event.target.value = "";

}


/* =========================================================
   11. KHÔI PHỤC MẪU MẶC ĐỊNH
========================================================= */

async function restoreDefaultTemplate(
    showMessage = true
) {

    try {

        const text =
            await fetchDefaultTemplate();


        currentTemplate =
            text;

        currentTemplateName =
            CONFIG.files.defaultTemplate;


        localStorage.removeItem(
            CONFIG.storage.template
        );

        localStorage.removeItem(
            CONFIG.storage.templateName
        );


        updateTemplateUI();


        if (showMessage) {

            showToast(
                "Đã khôi phục mẫu mặc định."
            );

        }


    } catch (error) {

        console.error(
            "Lỗi khôi phục mẫu:",
            error
        );


        currentTemplate = "";

        currentTemplateName =
            CONFIG.files.defaultTemplate;


        updateTemplateUI();


        showToast(
            "Chưa tìm thấy mau_giao_an.txt."
        );

    }

}


/* =========================================================
   12. XÓA MẪU
========================================================= */

function clearTemplate() {

    const confirmed =
        confirm(
            "Bạn có chắc muốn xóa mẫu giáo án hiện tại?"
        );

    if (!confirmed) {
        return;
    }


    currentTemplate = "";

    currentTemplateName =
        "Chưa có mẫu";


    localStorage.removeItem(
        CONFIG.storage.template
    );

    localStorage.removeItem(
        CONFIG.storage.templateName
    );


    updateTemplateUI();

    showToast(
        "Đã xóa mẫu giáo án."
    );

}


/* =========================================================
   13. CẬP NHẬT GIAO DIỆN MẪU
========================================================= */

function updateTemplateUI() {

    $("templateFileName").textContent =
        currentTemplateName;


    if (currentTemplate.trim()) {

        $("templateStatus").textContent =
            `Đang sử dụng: ${currentTemplateName}`;

    } else {

        $("templateStatus").textContent =
            "Chưa có mẫu giáo án.";

    }

}


/* =========================================================
   14. XEM MẪU
========================================================= */

function previewTemplate() {

    if (!currentTemplate.trim()) {

        $("templatePreview").textContent =
            "Chưa có nội dung mẫu giáo án.";

    } else {

        $("templatePreview").textContent =
            currentTemplate;

    }


    $("templateModal").classList.add(
        "show"
    );

}


/* =========================================================
   15. ĐÓNG MODAL
========================================================= */

function closeTemplateModal() {

    $("templateModal").classList.remove(
        "show"
    );

}


/* =========================================================
   16. LẤY DỮ LIỆU FORM
========================================================= */

function getFormData() {

    return {

        subject:
            $("subject").value.trim(),

        grade:
            $("grade").value.trim(),

        lesson:
            $("lesson").value.trim(),

        duration:
            $("duration").value.trim(),

        lessonPosition:
            $("lessonPosition").value.trim(),

        requirements:
            $("requirements").value.trim(),

        students:
            $("students").value.trim(),

        teachingConditions:
            $("teachingConditions").value.trim(),

        equipment:
            $("equipment").value.trim(),

        methodOrientation:
            $("methodOrientation").value.trim(),

        studentActivity:
            $("studentActivity").value.trim(),

        avoid:
            $("avoid").value.trim()

    };

}


/* =========================================================
   17. VALIDATE FORM
========================================================= */

function validateForm() {

    const data =
        getFormData();


    if (!data.subject) {

        showToast(
            "Vui lòng nhập môn học."
        );

        $("subject").focus();

        return false;
    }


    if (!data.grade) {

        showToast(
            "Vui lòng nhập lớp."
        );

        $("grade").focus();

        return false;
    }


    if (!data.lesson) {

        showToast(
            "Vui lòng nhập tên bài / chủ đề."
        );

        $("lesson").focus();

        return false;
    }


    return true;

}


/* =========================================================
   18. BUILD LESSON CONTEXT
========================================================= */

function buildLessonContext() {

    const data =
        getFormData();


    return `
THÔNG TIN BÀI HỌC

- Môn học: ${data.subject || "Chưa cung cấp"}
- Lớp: ${data.grade || "Chưa cung cấp"}
- Tên bài / chủ đề: ${data.lesson || "Chưa cung cấp"}
- Vị trí bài học: ${data.lessonPosition || "Chưa cung cấp"}
- Thời lượng dự kiến: ${data.duration || "Chưa cung cấp"}


YÊU CẦU CẦN ĐẠT

${data.requirements || "Giáo viên chưa cung cấp. Hãy xác định từ tài liệu nguồn được tải lên."}


ĐẶC ĐIỂM HỌC SINH

${data.students || "Giáo viên chưa cung cấp."}


ĐIỀU KIỆN DẠY HỌC

${data.teachingConditions || "Giáo viên chưa cung cấp."}


THIẾT BỊ / PHƯƠNG TIỆN

${data.equipment || "Giáo viên chưa cung cấp."}


ĐỊNH HƯỚNG PHƯƠNG PHÁP

${data.methodOrientation || "Ưu tiên dạy học phát triển phẩm chất, năng lực và tăng thời gian học sinh thực sự hoạt động."}


MỨC ĐỘ HOẠT ĐỘNG MONG MUỐN CỦA HỌC SINH

${data.studentActivity || "Ưu tiên để từng học sinh đều phải suy nghĩ, thực hiện nhiệm vụ và tạo ra sản phẩm học tập."}


NHỮNG ĐIỀU GIÁO VIÊN MUỐN TRÁNH

${data.avoid || "Đặc biệt tránh hoạt động nhóm hình thức, học sinh thụ động và giáo viên độc thoại kéo dài."}
`.trim();

}


/* =========================================================
   19. BUILD ACTIVITY DESIGN RULES
========================================================= */

function buildActivityDesignRules() {

    return `
NGUYÊN TẮC THIẾT KẾ HOẠT ĐỘNG BẮT BUỘC

1. HỌC SINH PHẢI LÀ CHỦ THỂ HOẠT ĐỘNG.

Ưu tiên tối đa thời gian học sinh thực sự suy nghĩ,
làm việc và tạo ra sản phẩm học tập.

Mỗi hoạt động phải có nhiệm vụ cụ thể.

Học sinh phải có cơ hội:

- suy nghĩ;
- dự đoán;
- lựa chọn;
- giải thích;
- lập luận;
- trao đổi;
- phản hồi;
- kiểm chứng;
- tạo sản phẩm học tập.


2. KHÔNG CHẤP NHẬN HOẠT ĐỘNG NHÓM HÌNH THỨC.

Không được coi:

- chia nhóm;
- phát phiếu;
- thảo luận;
- đại diện nhóm trình bày

là bằng chứng đủ để gọi một hoạt động là tích cực.

Mỗi hoạt động phải trả lời được:

- Học sinh cụ thể làm gì?
- Học sinh phải suy nghĩ gì?
- Học sinh tạo ra sản phẩm gì?
- Có bằng chứng nào cho thấy học sinh thực sự học?
- Vì sao phải thực hiện nhiệm vụ này?
- Hoạt động có thực sự góp phần hình thành kiến thức hoặc năng lực không?


3. Nếu bỏ hình thức chia nhóm mà nhiệm vụ học tập gần như
không thay đổi thì phải xem đó là dấu hiệu của hoạt động nhóm hình thức.


4. ƯU TIÊN:

Cá nhân → cặp đôi → nhóm nhỏ → cả lớp

Tuy nhiên không được áp dụng máy móc.

Có thể sử dụng:

- Think – Pair – Share;
- thẻ;
- sơ đồ;
- dự đoán;
- thí nghiệm;
- mô phỏng;
- tranh luận;
- phản biện;
- đóng vai;
- trạm học tập;
- giải quyết vấn đề;
- hoạt động toàn lớp.


5. Không để một học sinh khá làm thay cả nhóm.

Phải thiết kế cơ chế để từng học sinh có trách nhiệm
với nhiệm vụ và sản phẩm.


6. Giáo viên chủ yếu:

- giao nhiệm vụ;
- tổ chức;
- quan sát;
- đặt câu hỏi;
- gợi ý;
- hỗ trợ;
- điều phối;
- chuẩn hóa kiến thức.

Không biến hoạt động thành một bài giảng dài.


7. Đặc biệt chú ý học sinh trung bình.

Nhiệm vụ phải có điểm bắt đầu rõ ràng.

Khi cần phải có gợi ý từng bước.

Học sinh khá giỏi có thể có nhiệm vụ mở rộng.


8. KIỂM SOÁT THỜI LƯỢNG HOẠT ĐỘNG.

Ước tính thời gian:

- giáo viên nói / giải thích;
- học sinh làm việc cá nhân;
- học sinh trao đổi;
- học sinh trình bày / phản biện.

Nếu giáo viên phải nói liên tục quá lâu,
hãy xem xét chuyển một phần thành nhiệm vụ học tập.


9. Sau mỗi hoạt động phải tự kiểm tra:

□ Có nhiệm vụ cụ thể?
□ Từng học sinh có việc phải làm?
□ Học sinh có phải suy nghĩ?
□ Học sinh có phải đưa ra quyết định / dự đoán / lập luận?
□ Có sản phẩm học tập?
□ Có bằng chứng học tập?
□ Có cơ hội phản hồi?
□ Phục vụ mục tiêu bài học?
□ Phù hợp thời gian?
□ Phù hợp trình độ học sinh?
□ Có nguy cơ hoạt động nhóm hình thức?

Nếu phát hiện nguy cơ hình thức,
PHẢI TỰ CHỈNH SỬA hoạt động trước khi đưa ra kết quả.
`.trim();

}


/* =========================================================
   20. BUILD TEMPLATE INSTRUCTION
========================================================= */

function buildTemplateInstruction() {

    if (!currentTemplate.trim()) {

        return `
MẪU TRÌNH BÀY HOẠT ĐỘNG

Hiện chưa có file mẫu giáo án.

Hãy sử dụng cấu trúc trình bày hoạt động phù hợp với yêu cầu
của người dùng và không tự khẳng định đây là mẫu Công văn 5512
nếu không có tài liệu nguồn chứng minh.

Lưu ý:
Mẫu trình bày chỉ quy định cách trình bày / kết cấu.
Không được để mẫu trình bày làm giảm chất lượng thiết kế
hoạt động học tập thực chất.
`.trim();

    }


    return `
MẪU TRÌNH BÀY HOẠT ĐỘNG

Tên file mẫu:
${currentTemplateName}

-------------------- BẮT ĐẦU MẪU --------------------

${currentTemplate}

--------------------- KẾT THÚC MẪU -------------------

YÊU CẦU SỬ DỤNG MẪU

- Ưu tiên cấu trúc, tên mục, thứ tự và cách trình bày
  trong mẫu trên khi thiết kế từng pha hoạt động.

- Không tự ý thay đổi cấu trúc mẫu nếu không cần thiết.

- Mẫu chỉ là chuẩn về cách trình bày / kết cấu hoạt động.

- Không được biến hoạt động thành việc điền mẫu một cách
  máy móc.

- Chất lượng hoạt động phải tuân thủ tuyệt đối nguyên tắc:
  học sinh hoạt động nhiều, hoạt động thực chất,
  có nhiệm vụ, có sản phẩm, có tư duy và có bằng chứng học tập.
`.trim();

}


/* =========================================================
   21. BUILD GLOBAL PROMPT
========================================================= */

function buildGlobalPrompt() {

    return `
${firstPromptTemplate.trim()}

============================================================

THÔNG TIN GIÁO VIÊN CUNG CẤP
============================================================

${buildLessonContext()}

============================================================

NGUYÊN TẮC THIẾT KẾ HOẠT ĐỘNG
============================================================

${buildActivityDesignRules()}

============================================================

MẪU TRÌNH BÀY
============================================================

${buildTemplateInstruction()}

============================================================

TÀI LIỆU NGUỒN
============================================================

Tài liệu nguồn của bài học sẽ được GIÁO VIÊN TẢI LÊN
TRỰC TIẾP TRONG CUỘC TRÒ CHUYỆN VỚI AI.

Ứng dụng này hiện CHỈ TẠO PROMPT,
KHÔNG gửi tài liệu qua API.

Khi tài liệu được tải lên, hãy:

- đọc và phân tích tài liệu;
- ưu tiên nội dung trong tài liệu;
- không tự ý bổ sung kiến thức trái với tài liệu;
- chỉ sử dụng kiến thức bên ngoài khi thật sự cần thiết;
- nếu tài liệu thiếu thông tin quan trọng, hãy chỉ rõ điều đó.

============================================================
`.trim();

}


/* =========================================================
   22. BUILD NEXT PROMPT
========================================================= */

function buildNextPrompt() {

    return `
${secondPromptTemplate.trim()}

============================================================

THÔNG TIN BÀI HỌC
============================================================

${buildLessonContext()}

============================================================

NGUYÊN TẮC THIẾT KẾ HOẠT ĐỘNG
============================================================

${buildActivityDesignRules()}

============================================================

MẪU TRÌNH BÀY HOẠT ĐỘNG
============================================================

${buildTemplateInstruction()}

============================================================

NGỮ CẢNH CUỘC TRÒ CHUYỆN
============================================================

Đây là lượt tiếp theo trong cùng một cuộc trò chuyện.

Hãy sử dụng toàn bộ ngữ cảnh, phân tích tổng thể,
kịch bản và những pha đã được AI thiết kế ở các lượt trước.

KHÔNG yêu cầu giáo viên khai báo lại kịch bản.

KHÔNG lặp lại toàn bộ phần phân tích tổng thể.

KHÔNG phân tích đồng thời nhiều pha.

Hãy xác định PHA TIẾP THEO cần được phân tích dựa trên
ngữ cảnh cuộc trò chuyện và chỉ tập trung phân tích sâu
pha đó.

Nếu ở lượt trước AI đã phân tích một pha cụ thể,
hãy chuyển sang pha tiếp theo trong kịch bản đã được
thống nhất.

Nếu ngữ cảnh hiện tại chưa đủ rõ để xác định pha tiếp theo,
hãy nêu ngắn gọn thông tin còn thiếu thay vì tự ý tạo
một kịch bản hoàn toàn mới.

============================================================

TÀI LIỆU NGUỒN

============================================================

Tài liệu bài học được giáo viên tải lên trực tiếp
trong cuộc trò chuyện với AI.

Hãy tiếp tục sử dụng tài liệu đó làm nguồn chính.

Ứng dụng hiện chỉ tạo Prompt,
không gửi tài liệu qua API.

============================================================
`.trim();

}


/* =========================================================
   23. GENERATE PROMPT
========================================================= */

function generatePrompt() {

    if (!validateForm()) {
        return;
    }


    const selected =
        document.querySelector(
            'input[name="promptType"]:checked'
        );


    if (!selected) {

        showToast(
            "Vui lòng chọn loại nhiệm vụ."
        );

        return;
    }


    let finalPrompt = "";


    if (selected.value === "first") {

        if (!firstPromptTemplate.trim()) {

            showToast(
                "Chưa tải được first_prompt.txt."
            );

            return;
        }


        finalPrompt =
            buildGlobalPrompt();

    } else {

        if (!secondPromptTemplate.trim()) {

            showToast(
                "Chưa tải được second_prompt.txt."
            );

            return;
        }


        finalPrompt =
            buildNextPrompt();

    }


    $("promptOutput").value =
        finalPrompt;


    saveDataSilently();


    showToast(
        selected.value === "first"
            ? "Đã tạo Prompt phân tích tổng thể."
            : "Đã tạo Prompt phân tích pha tiếp theo."
    );


    $("promptOutput").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   24. SAVE DATA
========================================================= */

function saveData() {

    const data =
        getFormData();


    localStorage.setItem(
        CONFIG.storage.form,
        JSON.stringify(data)
    );


    showToast(
        "Đã lưu thông tin."
    );

}


/* =========================================================
   25. SAVE DATA SILENT
========================================================= */

function saveDataSilently() {

    const data =
        getFormData();


    localStorage.setItem(
        CONFIG.storage.form,
        JSON.stringify(data)
    );

}


/* =========================================================
   26. LOAD DATA
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(
            CONFIG.storage.form
        );


    if (!saved) {
        return;
    }


    try {

        const data =
            JSON.parse(saved);


        setValue(
            "subject",
            data.subject
        );

        setValue(
            "grade",
            data.grade
        );

        setValue(
            "lesson",
            data.lesson
        );

        setValue(
            "duration",
            data.duration
        );

        setValue(
            "lessonPosition",
            data.lessonPosition
        );

        setValue(
            "requirements",
            data.requirements
        );

        setValue(
            "students",
            data.students
        );

        setValue(
            "teachingConditions",
            data.teachingConditions
        );

        setValue(
            "equipment",
            data.equipment
        );

        setValue(
            "methodOrientation",
            data.methodOrientation
        );

        setValue(
            "studentActivity",
            data.studentActivity
        );

        setValue(
            "avoid",
            data.avoid
        );


    } catch (error) {

        console.error(
            "Không thể đọc dữ liệu đã lưu:",
            error
        );

    }

}


/* =========================================================
   27. SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    if ($(id)) {

        $(id).value =
            value || "";

    }

}


/* =========================================================
   28. CLEAR DATA
========================================================= */

function clearData() {

    const confirmed =
        confirm(
            "Bạn có chắc muốn xóa toàn bộ thông tin đã nhập?"
        );

    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        CONFIG.storage.form
    );


    const ids = [

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


    ids.forEach(id => {

        if ($(id)) {
            $(id).value = "";
        }

    });


    $("promptOutput").value = "";


    showToast(
        "Đã xóa thông tin."
    );

}


/* =========================================================
   29. COPY PROMPT
========================================================= */

async function copyPrompt() {

    const prompt =
        $("promptOutput").value.trim();


    if (!prompt) {

        showToast(
            "Chưa có Prompt để sao chép."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            prompt
        );


        showToast(
            "Đã sao chép Prompt."
        );


    } catch (error) {

        /* -------------------------
           Fallback
        ------------------------- */

        $("promptOutput").focus();

        $("promptOutput").select();

        document.execCommand("copy");

        showToast(
            "Đã sao chép Prompt."
        );

    }

}


/* =========================================================
   30. DOWNLOAD PROMPT
========================================================= */

function downloadPrompt() {

    const prompt =
        $("promptOutput").value.trim();


    if (!prompt) {

        showToast(
            "Chưa có Prompt để tải."
        );

        return;
    }


    const blob =
        new Blob(
            [prompt],
            {
                type: "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    const data =
        getFormData();


    const safeLesson =
        sanitizeFileName(
            data.lesson || "prompt"
        );


    const selected =
        document.querySelector(
            'input[name="promptType"]:checked'
        );


    const typeName =
        selected &&
        selected.value === "next"
            ? "phan-tich-pha"
            : "phan-tich-tong-the";


    link.href =
        url;


    link.download =
        `${typeName}-${safeLesson}.txt`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "Đã tải Prompt."
    );

}


/* =========================================================
   31. SANITIZE FILE NAME
========================================================= */

function sanitizeFileName(name) {

    return name
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);

}


/* =========================================================
   32. TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   33. DEBOUNCE
========================================================= */

function debounce(
    func,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () => {

                    func.apply(
                        this,
                        args
                    );

                },
                delay
            );

    };

}
