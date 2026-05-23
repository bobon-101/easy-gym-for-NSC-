// auth.js

function renderLogin() {
    return `
        <div class="auth-container">
            <h2>Sign in</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required placeholder="Enter your password">
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
            <div class="auth-switch">
                Don't have an account? <a href="#" data-route="register">Sign up</a>
            </div>
        </div>
    `;
}

function renderRegister() {
    return `
        <div class="auth-container">
            <h2>Create Account</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" required placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" required placeholder="name@example.com">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required placeholder="Minimum 6 characters" minlength="6">
                </div>
                <div class="form-group" style="display: flex; gap: 1rem;">
                    <div style="flex: 1;">
                        <label for="birth-year">Birth Year (ปี ค.ศ. เกิด)</label>
                        <input type="number" id="birth-year" required min="1900" max="${new Date().getFullYear()}" placeholder="YYYY">
                    </div>
                    <div style="flex: 1;">
                        <label for="weight">Weight (kg)</label>
                        <input type="number" id="weight" required placeholder="kg">
                    </div>
                    <div style="flex: 1;">
                        <label for="height">Height (cm)</label>
                        <input type="number" id="height" required placeholder="cm">
                    </div>
                </div>
                <div class="form-group">
                    <label for="goal">Primary Fitness Goal</label>
                    <select id="goal" required>
                        <option value="" disabled selected>Select a goal</option>
                        <option value="Muscle Building">Muscle Building</option>
                        <option value="Fat Burning">Fat Burning</option>
                        <option value="Endurance">Endurance</option>
                        <option value="Flexibility & Posture">Flexibility & Posture</option>
                    </select>
                </div>
                <button type="submit" class="btn">Register</button>
            </form>
            <div class="auth-switch">
                Already have an account? <a href="#" data-route="login">Login</a>
            </div>
        </div>
    `;
}

function attachLoginEvents() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const storedUserObj = localStorage.getItem('fitlife_registered_users');
        const users = storedUserObj ? JSON.parse(storedUserObj) : [];
        
        // ค้นหาผู้ใช้ที่ระบุอีเมลและรหัสผ่านตรงกับฐานข้อมูลจริงเท่านั้น
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (user) {
            window.showToast('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับครับ 🎉');
            window.loginUser(user);
        } else {
            // บังคับให้สมัครสมาชิกก่อน ห้ามลัดขั้นตอนอีกต่อไป
            window.showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง! กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ');
        }
    });
}

function attachRegisterEvents() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newUser = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            birthYear: parseInt(document.getElementById('birth-year').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value),
            goal: document.getElementById('goal').value
        };

        const storedUserObj = localStorage.getItem('fitlife_registered_users');
        const users = storedUserObj ? JSON.parse(storedUserObj) : [];

        // ตรวจสอบความซ้ำของอีเมลแบบไม่ระมัดระวังพิมพ์เล็กใหญ่ (Case-Insensitive)
        if (users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            window.showToast('อีเมลนี้ถูกใช้งานลงทะเบียนไปแล้ว!');
            return;
        }

        users.push(newUser);
        localStorage.setItem('fitlife_registered_users', JSON.stringify(users));

        // ทำการล็อกอินผู้ใช้โดยอัตโนมัติหลังสมัครเสร็จ
        window.loginUser(newUser);
        window.showToast('สมัครสมาชิกและเข้าสู่ระบบเสร็จสมบูรณ์! 🎉');
    });
}
