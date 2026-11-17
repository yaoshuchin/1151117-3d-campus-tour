/**
 * 3D 互動校園與教育應用 - 通行身分驗證與門禁存取保護系統
 * 基於 Web Crypto API SHA-256 雜湊安全比對
 */
(function () {
    const AUTH_KEY = 'campus_3d_share_gate_auth';
    const TARGET_HASH = '5cae49b1fea5b5b969cdc931b8338968940c92309aa2339360cdd5c77be4a4ff';

    // 檢查已驗證狀態
    const isUnlocked = localStorage.getItem(AUTH_KEY) === 'unlocked';

    // 注入門禁專用獨立樣式 (玩具模型與溫暖磨砂玻璃美學)
    const styleEl = document.createElement('style');
    styleEl.id = 'gate-inline-styles';
    styleEl.textContent = `
        html.gate-locked, html.gate-locked body, body.gate-locked {
            overflow: hidden !important;
            height: 100vh !important;
        }
        html.gate-locked body > *:not(#password-gate):not(#gate-inline-styles),
        body.gate-locked > *:not(#password-gate):not(#gate-inline-styles) {
            filter: blur(18px) brightness(0.4) saturate(0.8) !important;
            pointer-events: none !important;
            user-select: none !important;
        }
        #password-gate {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.25rem;
            background: rgba(18, 22, 31, 0.85);
            backdrop-filter: blur(24px) saturate(140%);
            -webkit-backdrop-filter: blur(24px) saturate(140%);
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #f8fafc;
            opacity: 1;
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s ease;
        }
        #password-gate.gate-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .gate-card {
            width: 100%;
            max-width: 440px;
            background: linear-gradient(145deg, rgba(29, 36, 48, 0.94), rgba(20, 25, 34, 0.96));
            border: 2px solid rgba(224, 105, 79, 0.35);
            border-radius: 28px;
            padding: 2.25rem 2rem 2rem;
            box-shadow: 0 0 50px rgba(224, 105, 79, 0.22), 0 30px 60px -12px rgba(0, 0, 0, 0.75);
            position: relative;
            overflow: hidden;
            text-align: center;
            animation: gatePopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes gatePopIn {
            0% { transform: scale(0.92); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .gate-card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }
        .gate-avatar-3d {
            width: 72px;
            height: 72px;
            margin: 0 auto 1.25rem;
            border-radius: 22px;
            background: linear-gradient(135deg, #E0694F 0%, #D45B42 50%, #B84730 100%);
            box-shadow: 0 8px 0 #8E2C17, 0 16px 25px rgba(224, 105, 79, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', -apple-system, sans-serif;
            font-size: 2rem;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -0.05em;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
        }
        .gate-title {
            font-size: 1.45rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 0.4rem;
            letter-spacing: -0.02em;
        }
        .gate-subtitle {
            font-size: 0.85rem;
            color: #94a3b8;
            margin: 0 0 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .gate-pill {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.35);
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        .gate-input-group {
            position: relative;
            margin-bottom: 1.25rem;
            text-align: left;
        }
        .gate-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .gate-input {
            width: 100%;
            box-sizing: border-box;
            background: rgba(15, 20, 28, 0.85);
            border: 2px solid rgba(148, 163, 184, 0.25);
            border-radius: 16px;
            padding: 0.9rem 2.85rem 0.9rem 1.15rem;
            color: #ffffff;
            font-size: 1.05rem;
            letter-spacing: 0.08em;
            outline: none;
            transition: all 0.25s ease;
        }
        .gate-input:focus {
            border-color: #E0694F;
            box-shadow: 0 0 0 4px rgba(224, 105, 79, 0.25);
            background: rgba(15, 20, 28, 1);
        }
        .gate-toggle-pw {
            position: absolute;
            right: 0.85rem;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 6px;
            font-size: 1.15rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s, transform 0.15s;
        }
        .gate-toggle-pw:hover {
            color: #E0694F;
            transform: scale(1.1);
        }
        .gate-submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #E0694F 0%, #D45B42 50%, #B84730 100%);
            border: none;
            border-radius: 16px;
            padding: 0.95rem 1.5rem;
            color: #ffffff;
            font-size: 1.05rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            cursor: pointer;
            box-shadow: 0 6px 0 #8E2C17, 0 12px 20px rgba(224, 105, 79, 0.35);
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .gate-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 0 #8E2C17, 0 16px 25px rgba(224, 105, 79, 0.45);
        }
        .gate-submit-btn:active {
            transform: translateY(4px);
            box-shadow: 0 2px 0 #8E2C17, 0 4px 10px rgba(224, 105, 79, 0.3);
        }
        .gate-error {
            color: #f87171;
            font-size: 0.85rem;
            margin-top: 0.75rem;
            min-height: 1.25rem;
            font-weight: 600;
            display: none;
            text-align: center;
        }
        .gate-error.show {
            display: block;
        }
        .gate-footer-note {
            margin-top: 1.5rem;
            font-size: 0.78rem;
            color: #64748b;
        }
        @keyframes gate-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
            animation: gate-shake 0.35s ease-in-out;
        }

        /* 右下角常駐浮動重新上鎖按鈕 */
        #gate-lock-btn {
            position: fixed;
            bottom: 1.25rem;
            right: 1.25rem;
            z-index: 99999;
            background: rgba(29, 36, 48, 0.92);
            border: 2px solid rgba(224, 105, 79, 0.4);
            color: #f1f5f9;
            padding: 0.5rem 0.95rem;
            border-radius: 999px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 12px rgba(224, 105, 79, 0.2);
            backdrop-filter: blur(12px);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
        }
        #gate-lock-btn:hover {
            background: rgba(224, 105, 79, 0.95);
            border-color: #E0694F;
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(224, 105, 79, 0.45);
            transform: translateY(-2px);
        }
        #gate-lock-btn:active {
            transform: translateY(0);
        }
    `;

    if (document.head) {
        document.head.appendChild(styleEl);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));
    }

    // 尚未驗證時鎖定畫面
    if (!isUnlocked) {
        document.documentElement.classList.add('gate-locked');
        if (document.body) {
            document.body.classList.add('gate-locked');
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.classList.add('gate-locked'));
        }
    }

    // 瀏覽器原生 Web Crypto API SHA-256 雜湊比對函式
    async function sha256Hex(str) {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 建置門禁對話框 DOM
    function buildGateModal() {
        if (document.getElementById('password-gate')) return;

        const gateEl = document.createElement('div');
        gateEl.id = 'password-gate';
        if (isUnlocked) {
            gateEl.classList.add('gate-hidden');
        }

        gateEl.innerHTML = `
            <div class="gate-card" id="gate-card">
                <div class="gate-avatar-3d">3D</div>
                <h2 class="gate-title">3D 互動校園與教育應用</h2>
                <div class="gate-subtitle">
                    <span class="gate-pill">線上研習成果</span>
                    <span>專屬內部教材存取驗證</span>
                </div>
                <form id="gate-form" onsubmit="return false;">
                    <div class="gate-input-group">
                        <div class="gate-input-wrapper">
                            <input 
                                type="password" 
                                id="gate-pw-input" 
                                class="gate-input" 
                                placeholder="請輸入研習通行碼..." 
                                autocomplete="current-password"
                                required
                            />
                            <button type="button" id="gate-toggle-btn" class="gate-toggle-pw" title="顯示/隱藏密碼">
                                👁️
                            </button>
                        </div>
                        <div id="gate-error" class="gate-error">⚠️ 通行碼驗證未通過，請重新輸入</div>
                    </div>
                    <button type="submit" id="gate-submit-btn" class="gate-submit-btn">
                        <span>驗證進入</span> ➜
                    </button>
                </form>
                <div class="gate-footer-note">
                    Studio0808 智造實驗室 · 安全身分驗證防護
                </div>
            </div>
        `;

        document.body.appendChild(gateEl);

        const form = document.getElementById('gate-form');
        const input = document.getElementById('gate-pw-input');
        const errorEl = document.getElementById('gate-error');
        const card = document.getElementById('gate-card');
        const toggleBtn = document.getElementById('gate-toggle-btn');

        toggleBtn.addEventListener('click', function () {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                input.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        });

        async function handleUnlock() {
            const entered = input.value.trim();
            if (!entered) return;
            try {
                const hashed = await sha256Hex(entered);
                if (hashed === TARGET_HASH) {
                    localStorage.setItem(AUTH_KEY, 'unlocked');
                    document.documentElement.classList.remove('gate-locked');
                    document.body.classList.remove('gate-locked');
                    gateEl.classList.add('gate-hidden');
                    errorEl.classList.remove('show');
                    input.value = '';
                } else {
                    showError();
                }
            } catch (err) {
                showError();
            }
        }

        function showError() {
            errorEl.classList.add('show');
            card.classList.remove('animate-shake');
            void card.offsetWidth;
            card.classList.add('animate-shake');
            input.focus();
            input.select();
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleUnlock();
        });

        createLockButton();

        if (!isUnlocked) {
            setTimeout(() => input.focus(), 150);
        }
    }

    // 建立常駐鎖定按鈕
    function createLockButton() {
        if (document.getElementById('gate-lock-btn')) return;
        const lockBtn = document.createElement('button');
        lockBtn.id = 'gate-lock-btn';
        lockBtn.title = '點擊重新鎖定網站回到門禁保護';
        lockBtn.innerHTML = `<span>🔒</span><span>重新上鎖</span>`;
        lockBtn.addEventListener('click', function () {
            localStorage.removeItem(AUTH_KEY);
            document.documentElement.classList.add('gate-locked');
            document.body.classList.add('gate-locked');
            const gateEl = document.getElementById('password-gate');
            if (gateEl) {
                gateEl.classList.remove('gate-hidden');
                const input = document.getElementById('gate-pw-input');
                const err = document.getElementById('gate-error');
                if (input) {
                    input.value = '';
                    input.focus();
                }
                if (err) err.classList.remove('show');
            }
        });
        document.body.appendChild(lockBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildGateModal);
    } else {
        buildGateModal();
    }
})();
