/**
 * 企业财富健康与传承缺口智能自测系统 - 核心逻辑文件
 */

// 1. 全局数据载体管理
const CONFIG = {
    pages: ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'info', 'report']
};

const state = {
    partner_id: "none",
    scores: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null },
    formData: { name: "", company: "", phone: "", email: "" },
    totalScore: 0,
    riskLevel: ""
};

// 2. 初始化流程：抓取 URL 内的推广渠道 partner_id
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('partner_id')) {
        state.partner_id = params.get('partner_id');
        console.log("[Splendid] 渠道接入成功，Partner ID:", state.partner_id);
    }
    initEventListeners();
});

// 3. 核心多步视图切换路由
function navigateTo(pageId) {
    // 隐藏所有卡片
    CONFIG.pages.forEach(p => {
        const el = document.getElementById(`page-${p}`);
        if(el) el.classList.remove('active');
    });

    // 延迟激活防止DOM切换突兀，确保动效平滑
    setTimeout(() => {
        CONFIG.pages.forEach(p => {
            const el = document.getElementById(`page-${p}`);
            if(el) el.classList.add('hidden');
        });
        
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            // 触发 CSS 淡入
            setTimeout(() => targetPage.classList.add('active'), 50);
        }
    }, 200);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. 绑定所有节点点击手势
function initEventListeners() {
    // 开始按钮
    document.getElementById('btn-start').addEventListener('click', () => navigateTo('q1'));

    // 每一题中的大按钮点击监听
    document.querySelectorAll('.quiz-options').forEach(zone => {
        const questionKey = zone.getAttribute('data-question');
        const cards = zone.querySelectorAll('.option-card');

        cards.forEach(card => {
            card.addEventListener('click', (event) => {
                const scoreValue = parseInt(card.getAttribute('data-score'), 10);
                state.scores[questionKey] = scoreValue;

                // 移除兄弟节点的选中态
                cards.forEach(c => c.classList.remove('selected'));
                // 标记当前高亮
                card.classList.add('selected');

                // 探测下一目标页
                const currentIndex = CONFIG.pages.indexOf(questionKey);
                const nextStepPage = CONFIG.pages[currentIndex + 1];

                // 自选反馈微延迟 300ms 自动滑入下一页
                setTimeout(() => {
                    navigateTo(nextStepPage);
                }, 300);
            });
        });
    });

    // 通用返回及下一步按钮控制
    document.querySelectorAll('.page-container').forEach(page => {
        const id = page.id.replace('page-', '');
        const index = CONFIG.pages.indexOf(id);

        const prevBtn = page.querySelector('.btn-prev');
        const nextBtn = page.querySelector('.btn-next');

        if (prevBtn && index > 0) {
            prevBtn.addEventListener('click', () => navigateTo(CONFIG.pages[index - 1]));
        }
        if (nextBtn && index < CONFIG.pages.length - 1) {
            nextBtn.addEventListener('click', () => {
                // 如果当前题目还未选择，给个柔和拦截提示
                if (state.scores[id] === null && id.startsWith('q')) {
                    alert('请先选择一个选项以继续评测');
                    return;
                }
                navigateTo(CONFIG.pages[index + 1]);
            });
        }
    });

    // 修改按钮
    document.getElementById('btn-back-to-q6').addEventListener('click', () => navigateTo('q6'));

    // 信息收集表单拦截器
    document.getElementById('infoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        state.formData.name = document.getElementById('username').value.trim();
        state.formData.company = document.getElementById('company').value.trim();
        state.formData.phone = document.getElementById('phone').value.trim();
        state.formData.email = document.getElementById('email').value.trim();

        calculateAndRenderReport();
    });

    // 重新测试
    document.getElementById('btn-reset').addEventListener('click', resetSystem);
}

// 5. 计分引擎与全量文本条件渲染
function calculateAndRenderReport() {
    state.totalScore = Object.values(state.scores).reduce((sum, current) => sum + (current || 0), 0);
    
    const badge = document.getElementById('risk-badge');
    let contentHtml = "";

    if (state.totalScore >= 35) {
        state.riskLevel = "高危";
        badge.className = "px-3 py-0.5 rounded-full text-xs font-bold tracking-wider mt-1 bg-red-950 text-red-400 border border-red-800/50";
        badge.innerText = "高危（35–60 分）";

        contentHtml = `
            <div class="space-y-4">
                <div class="text-base font-bold text-red-400 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-red-500 rounded-full"></span>
                    企业与家庭财富“裸奔”状态 —— 急需搭建安全防火墙！
                </div>
                <div class="bg-navy-800/40 border border-navy-700 p-4 rounded-xl space-y-2">
                    <span class="text-xs font-semibold text-gold block">现状诊断：</span>
                    <p class="text-xs text-gray-300 leading-relaxed">您的企业资产与家庭财富处于高度绑定状态。在马来西亚当前的经济环境下，企业经营面临的任何法律诉讼、债务追索或合伙人变故，都会像导火索一样瞬间蔓延并吞噬您的家庭资产。同时，您在接班人计划上存在严重的股权真空，极易因为突发意外导致企业瘫痪。</p>
                </div>
                <div class="space-y-3">
                    <span class="text-xs font-semibold text-red-400 block">潜在风险：</span>
                    <div class="pl-3 border-l border-navy-700 space-y-2">
                        <p class="text-xs text-gray-400"><strong class="text-gray-200">连带清算风险：</strong>企业若发生债务危机，您个人联保的资产（包括家人居住的房产）可能被法院强制拍卖。</p>
                        <p class="text-xs text-gray-400"><strong class="text-gray-200">遗嘱冻结困境：</strong>若仅靠普通遗嘱，在大马资产继承面临复杂的 Probate（遗嘱认证）程序，资产会被冻结数月甚至数年，期间企业可能因资金链断裂而倒闭。</p>
                    </div>
                </div>
                <div class="bg-gold/5 border border-gold/20 p-4 rounded-xl">
                    <span class="text-xs font-bold text-gold block mb-1">Splendid 专家建议：</span>
                    <p class="text-xs text-gray-300 leading-relaxed mb-2"><strong class="text-white">急需产品：</strong>Splendid 境内企业保全信托（Onshore Business Trust）</p>
                    <p class="text-xs text-gray-400 leading-relaxed"><strong class="text-white">落地行动：</strong>立即将核心公司股权与特定不动产剥离至信托口袋中，实现“所有权属于信托，受益权留给家人”的法定隔离，筑起绝对安全的债务防火墙。</p>
                </div>
            </div>`;
    } else if (state.totalScore >= 15) {
        state.riskLevel = "中危";
        badge.className = "px-3 py-0.5 rounded-full text-xs font-bold tracking-wider mt-1 bg-amber-950 text-amber-400 border border-amber-800/50";
        badge.innerText = "中危（15–34 分）";

        contentHtml = `
            <div class="space-y-4">
                <div class="text-base font-bold text-amber-400 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    防御力不足 —— 缺乏系统化的财富保全与传承链条
                </div>
                <div class="bg-navy-800/40 border border-navy-700 p-4 rounded-xl space-y-2">
                    <span class="text-xs font-semibold text-gold block">现状诊断：</span>
                    <p class="text-xs text-gray-300 leading-relaxed">您已经具备了一定的风险防范意识（例如可能立了遗嘱或做了一些基本的资产分开），但您的防御系统是碎片化的。您虽然能防范日常小风险，但在面对“子女婚姻变故分家产”、“二代不愿接班导致企业停摆”或“合伙人倒戈”等长期战略威胁时，现有的机制完全无法阻挡。</p>
                </div>
                <div class="space-y-3">
                    <span class="text-xs font-semibold text-amber-400 block">潜在风险：</span>
                    <div class="pl-3 border-l border-navy-700 space-y-2">
                        <p class="text-xs text-gray-400"><strong class="text-gray-200">财富一代而亡：</strong>子女如果一次性继承大笔股权，一旦遭遇婚姻破裂，配偶有权分割高达 50% 的家族财产。</p>
                        <p class="text-xs text-gray-400"><strong class="text-gray-200">合伙人僵局：</strong>缺乏买卖协议与信托联动，合伙人的突发意外会引入“外行家属”进入董事会，引发内耗。</p>
                    </div>
                </div>
                <div class="bg-gold/5 border border-gold/20 p-4 rounded-xl">
                    <span class="text-xs font-bold text-gold block mb-1">Splendid 专家建议：</span>
                    <p class="text-xs text-gray-300 leading-relaxed mb-2"><strong class="text-white">急需产品：</strong>Splendid 家族信托与接班人全面规划（Family Trust & Succession Planning）</p>
                    <p class="text-xs text-gray-400 leading-relaxed"><strong class="text-white">落地行动：</strong>通过在信托契约中设定“分期发放生活费”、“考核接班表现”以及“合伙人股份自动回购”等定制化条款，让财富和公司管理权能够按照您的意志有序、长久地流转。</p>
                </div>
            </div>`;
    } else {
        state.riskLevel = "低危";
        badge.className = "px-3 py-0.5 rounded-full text-xs font-bold tracking-wider mt-1 bg-emerald-950 text-emerald-400 border border-emerald-800/50";
        badge.innerText = "低危（0–14 分）";

        contentHtml = `
            <div class="space-y-4">
                <div class="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                    基业长青 —— 您已构筑坚固的家族财富护城河
                </div>
                <div class="bg-navy-800/40 border border-navy-700 p-4 rounded-xl space-y-2">
                    <span class="text-xs font-semibold text-gold block">现状诊断：</span>
                    <p class="text-xs text-gray-300 leading-relaxed">恭喜您！您在企业合规、资产隔离和家族传承上已经做了非常全面的顶层设计。您的企业有坚固的法律防线，家庭财富也已安全入袋，大马市场的宏观波动和企业的微观风险很难对您的家庭造成冲击。</p>
                </div>
                <div class="bg-gold/5 border border-gold/20 p-4 rounded-xl mt-4">
                    <span class="text-xs font-bold text-gold block mb-1">未来优化建议：</span>
                    <p class="text-xs text-gray-300 leading-relaxed mb-2">如果您的企业未来有海外拓展、跨境并购或筹备上市的计划，传统的本土结构可能不够用。</p>
                    <p class="text-xs text-gray-400 leading-relaxed"><strong class="text-white">建议探讨产品：</strong>Splendid 纳闽离岸信托（Labuan Offshore Trust），进一步优化全球税务合规（Tax Transparency）及跨国多币种资产的隐私保护。</p>
                </div>
            </div>`;
    }

    // 文本上屏渲染
    document.getElementById('report-score').innerHTML = `${state.totalScore} <span class="text-sm font-normal text-gray-500">/ 60</span>`;
    document.getElementById('report-meta').innerText = `受测企业：${state.formData.company} | 贵宾客户：${state.formData.name}`;
    document.getElementById('report-content').innerHTML = contentHtml;

    // 输出最终规范格式的 JSON 回传对象
    const finalJSONReport = {
        partner_id: state.partner_id,
        name: state.formData.name,
        company: state.formData.company,
        phone: state.formData.phone,
        email: state.formData.email || "none",
        score: state.totalScore,
        risk_level: state.riskLevel
    };
    console.log("[Splendid Data Package]:", finalJSONReport);

    // 动态拼接专属邮件预约通路
    const subject = encodeURIComponent(`【财富健康自测预约】${state.formData.company}-${state.formData.name}`);
    const body = encodeURIComponent(`您好！\n我已完成企业传承智能缺口自测，以下是我的数据档案：\n\n- 客户姓名：${finalJSONReport.name}\n- 企业全称：${finalJSONReport.company}\n- 联络电话：${finalJSONReport.phone}\n- 评测总分：${finalJSONReport.score} 分\n- 风险分级：${finalJSONReport.risk_level}\n- 渠道合作方ID：${finalJSONReport.partner_id}\n\n期待与Splendid专家建立深度沟通。`);
    
    document.getElementById('consult-btn').href = `mailto:advisor@splendidtrust.com?subject=${subject}&body=${body}`;

    navigateTo('report');
}

// 6. 重置自测机制
function resetSystem() {
    state.scores = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };
    state.totalScore = 0;
    state.riskLevel = "";
    document.getElementById('infoForm').reset();
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    navigateTo('cover');
}