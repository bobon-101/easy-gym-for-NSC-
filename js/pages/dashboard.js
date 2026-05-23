// dashboard.js

function renderDashboard(user) {
    const modesHtml = Object.values(workoutData).map(mode => `
        <div class="mode-card" data-route="workout" data-param="${mode.id}">
            <div class="mode-icon">${mode.icon}</div>
            <h3>${mode.title}</h3>
            <p>${mode.description}</p>
        </div>
    `).join('');

    return `
        <div>
            <div class="dashboard-header">
                <h1>Welcome back, ${user.name}!</h1>
                <p>Choose your workout mode for today.</p>
            </div>
            <div class="modes-grid">
                ${modesHtml}
            </div>
            <div style="margin-top: 2rem; text-align: center;">
                <a href="https://youtu.be/p-51IEaj5go?si=aXiFHvsPywxCTUf8" target="_blank" class="btn btn-large" style="display: inline-block; width: 100%; max-width: 400px; background-color: #3b82f6; text-decoration: none; text-align: center; line-height: 1.6;">
                    ❄️ เริ่มคูลดาวน์ (Cooldown)
                </a>
            </div>
        </div>
    `;
}
