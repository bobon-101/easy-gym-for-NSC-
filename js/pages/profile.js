// profile.js

function renderProfile(user, workoutsCompleted) {
    if (!user) return '';

    // คำนวณอายุอัตโนมัติจากปีเกิด (ค.ศ. เกิด)
    const currentYear = new Date().getFullYear();
    const age = user.birthYear ? (currentYear - user.birthYear) : (user.age || '--');

    return `
        <div>
            <div style="margin-bottom: 2rem;">
                <a href="#" data-route="dashboard" style="text-decoration: none; color: var(--primary-color); font-weight: 500;">
                    &larr; Back to Dashboard
                </a>
            </div>
            
            <div class="profile-container" style="position: relative;">
                <button id="edit-profile-btn" class="btn" style="position: absolute; top: 30px; right: 30px; width: 140px; background-color: var(--primary-color); padding: 0.5rem 1rem; border-radius: 8px;">
                    📝 Edit Profile
                </button>
                
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="profile-info">
                        <h2>${user.name}</h2>
                        <p>${user.email}</p>
                    </div>
                </div>

                <!-- VIEW MODE -->
                <div id="profile-display-section">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${workoutsCompleted}</div>
                            <div class="stat-label">Workouts Completed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="font-size: 1.5rem; word-break: break-word;">${user.goal || 'General'}</div>
                            <div class="stat-label">Primary Goal (เป้าหมาย)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${age} Years</div>
                            <div class="stat-label">Age (อายุ)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${user.weight || '--'} kg</div>
                            <div class="stat-label">Weight (น้ำหนัก)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${user.height || '--'} cm</div>
                            <div class="stat-label">Height (ส่วนสูง)</div>
                        </div>
                    </div>
                </div>

                <!-- EDIT MODE FORM (Hidden by default - No Age Edit Field) -->
                <form id="profile-edit-section" class="hidden" style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--primary-color); font-weight: bold;">แก้ไขข้อมูลสุขภาพส่วนตัว</h3>
                    
                    <div class="form-group" style="margin-bottom: 1.25rem;">
                        <label for="edit-goal" style="display: block; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Primary Fitness Goal (เป้าหมายหลัก)</label>
                        <select id="edit-goal" required style="width: 100%; padding: 0.875rem 1rem; border-radius: 10px; background-color: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-main); font-size: 1rem; outline: none;">
                            <option value="Muscle Building" ${user.goal === 'Muscle Building' ? 'selected' : ''}>Muscle Building</option>
                            <option value="Fat Burning" ${user.goal === 'Fat Burning' ? 'selected' : ''}>Fat Burning</option>
                            <option value="Endurance" ${user.goal === 'Endurance' ? 'selected' : ''}>Endurance</option>
                            <option value="Flexibility & Posture" ${user.goal === 'Flexibility & Posture' ? 'selected' : ''}>Flexibility & Posture</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 1.25rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 150px;">
                            <label for="edit-weight" style="display: block; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Weight (น้ำหนัก kg)</label>
                            <input type="number" step="0.1" id="edit-weight" value="${user.weight || ''}" required style="width: 100%; padding: 0.875rem 1rem; border-radius: 10px; background-color: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-main); font-size: 1rem; outline: none;">
                        </div>
                        <div style="flex: 1; min-width: 150px;">
                            <label for="edit-height" style="display: block; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Height (ส่วนสูง cm)</label>
                            <input type="number" step="0.1" id="edit-height" value="${user.height || ''}" required style="width: 100%; padding: 0.875rem 1rem; border-radius: 10px; background-color: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-main); font-size: 1rem; outline: none;">
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button type="submit" class="btn" style="flex: 1; background-color: var(--accent-color); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">💾 Save Changes</button>
                        <button type="button" id="cancel-edit-btn" class="btn" style="flex: 1; background-color: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);">❌ Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function attachProfileEvents() {
    const editBtn = document.getElementById('edit-profile-btn');
    const displaySection = document.getElementById('profile-display-section');
    const editSection = document.getElementById('profile-edit-section');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (!editBtn || !displaySection || !editSection || !cancelBtn) return;

    editBtn.addEventListener('click', () => {
        editSection.classList.remove('hidden');
        editBtn.style.display = 'none'; // ซ่อนปุ่มแก้ไขระหว่างกำลังพิมพ์
    });

    cancelBtn.addEventListener('click', () => {
        editSection.classList.add('hidden');
        editBtn.style.display = 'block';
    });

    editSection.addEventListener('submit', (e) => {
        e.preventDefault();

        // ดึงค่าใหม่ที่ผู้ใช้กรอก (ไม่รวมอายุ ตามที่ขอไว้)
        const newGoal = document.getElementById('edit-goal').value;
        const newWeight = parseFloat(document.getElementById('edit-weight').value);
        const newHeight = parseFloat(document.getElementById('edit-height').value);

        // ดึงเซสชันล็อกอินปัจจุบันและอัปเดตค่า
        const currentUser = JSON.parse(localStorage.getItem('fitlife_user'));
        if (currentUser) {
            currentUser.goal = newGoal;
            currentUser.weight = newWeight;
            currentUser.height = newHeight;
            
            // บันทึกเซสชันล็อกอินปัจจุบัน
            localStorage.setItem('fitlife_user', JSON.stringify(currentUser));
            
            // ซิงค์สเตทเข้าสู่ตัวแปรระบบ App.state.currentUser
            if (window.App && window.App.state) {
                window.App.state.currentUser = currentUser;
            }

            // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูลสมาชิกหลัก fitlife_registered_users (เซฟถาวร)
            const storedUserObj = localStorage.getItem('fitlife_registered_users');
            const users = storedUserObj ? JSON.parse(storedUserObj) : [];
            const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            
            if (userIndex !== -1) {
                users[userIndex].goal = newGoal;
                users[userIndex].weight = newWeight;
                users[userIndex].height = newHeight;
                localStorage.setItem('fitlife_registered_users', JSON.stringify(users));
            }

            window.showToast('อัปเดตเป้าหมาย น้ำหนัก และส่วนสูงเรียบร้อยแล้วครับ! 💾🎉');

            // นำทางหน้าใหม่เพื่อรีเฟรชค่าการแสดงผลบนจอแบบ Real-time
            window.navigateTo('profile');
        }
    });
}
