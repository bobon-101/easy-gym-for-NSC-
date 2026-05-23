// Main Application Controller

const App = {
    state: {
        currentUser: null,
        workoutsCompleted: 0
    },

    init() {
        this.checkAuth();
        this.setupNavigation();
        
        // Expose global methods
        window.navigateTo = this.navigateTo.bind(this);
        window.showToast = this.showToast;
        window.updateWorkoutsCompleted = this.updateWorkoutsCompleted.bind(this);
        window.loginUser = this.loginUser.bind(this);
        window.logoutUser = this.logoutUser.bind(this);
    },

    checkAuth() {
        const user = localStorage.getItem('fitlife_user');
        if (user) {
            this.state.currentUser = JSON.parse(user);
            const workouts = localStorage.getItem('fitlife_completed');
            this.state.workoutsCompleted = workouts ? parseInt(workouts) : 0;
            document.getElementById('navbar').classList.remove('hidden');
            this.navigateTo('dashboard');
        } else {
            document.getElementById('navbar').classList.add('hidden');
            this.navigateTo('login');
        }
    },

    loginUser(userObj) {
        localStorage.setItem('fitlife_user', JSON.stringify(userObj));
        this.state.currentUser = userObj;
        this.state.workoutsCompleted = parseInt(localStorage.getItem('fitlife_completed') || '0');
        document.getElementById('navbar').classList.remove('hidden');
        this.navigateTo('dashboard');
    },

    logoutUser() {
        localStorage.removeItem('fitlife_user');
        this.state.currentUser = null;
        document.getElementById('navbar').classList.add('hidden');
        this.navigateTo('login');
        this.showToast('Logged out successfully');
    },

    updateWorkoutsCompleted() {
        this.state.workoutsCompleted++;
        localStorage.setItem('fitlife_completed', this.state.workoutsCompleted.toString());
    },

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.dataset.route;
                const param = link.dataset.param;
                this.navigateTo(route, param);
            }
        });

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logoutUser();
        });
    },

    navigateTo(route, param = null) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = ''; // Clear current

        // Smooth transition effect container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page';

        switch(route) {
            case 'login':
                pageContainer.innerHTML = renderLogin();
                setTimeout(() => attachLoginEvents(), 0);
                break;
            case 'register':
                pageContainer.innerHTML = renderRegister();
                setTimeout(() => attachRegisterEvents(), 0);
                break;
            case 'dashboard':
                if(this.requireAuth()) {
                    pageContainer.innerHTML = renderDashboard(this.state.currentUser);
                }
                break;
            case 'workout':
                if(this.requireAuth()) {
                    pageContainer.innerHTML = renderWorkout(param);
                    setTimeout(() => attachWorkoutEvents(param), 0);
                }
                break;
            case 'profile':
                if(this.requireAuth()) {
                    pageContainer.innerHTML = renderProfile(this.state.currentUser, this.state.workoutsCompleted);
                    setTimeout(() => attachProfileEvents(), 0);
                }
                break;
            default:
                pageContainer.innerHTML = `<h2>404 - Page Not Found</h2>`;
        }

        appContainer.appendChild(pageContainer);
    },

    requireAuth() {
        if (!this.state.currentUser) {
            this.navigateTo('login');
            return false;
        }
        return true;
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
