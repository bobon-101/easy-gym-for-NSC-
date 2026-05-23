const workoutData = {
    'strength': {
        id: 'strength',
        title: 'Strength',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M6 6.5v11"/><path d="M18 6.5v11"/><path d="M2.5 9.5h3"/><path d="M2.5 14.5h3"/><path d="M18.5 9.5h3"/><path d="M18.5 14.5h3"/><path d="M2 9.5v5"/><path d="M22 9.5v5"/></svg>',
        description: 'Build power and muscle mass with targeted resistance movements.',
        exercises: [
            { name: 'Squat', detail: '10–15 reps' },
            { name: 'Push-up', detail: '8–12 reps' },
            { name: 'Plank', detail: '20–60 seconds' },
            { name: 'Glute Bridge', detail: '12–15 reps' }
        ]
    },
    'cardio': {
        id: 'cardio',
        title: 'Cardio',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        description: 'Boost your heart rate and burn calories with high-energy routines.',
        exercises: [
            { name: 'Running in Place', detail: '1–2 minutes' },
            { name: 'Jumping Jack', detail: '30–60 seconds' },
            { name: 'Mountain Climber', detail: '30–45 seconds' },
            { name: 'High Knees', detail: '30–45 seconds' }
        ]
    },
    'stretching': {
        id: 'stretching',
        title: 'Stretching',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>',
        description: 'Enhance flexibility, reduce tension, and assist muscle recovery.',
        exercises: [
            { name: 'Hamstring Stretch', detail: '15–30 seconds' },
            { name: 'Quad Stretch', detail: '15–30 seconds each side' },
            { name: 'Shoulder Stretch', detail: '15–30 seconds' },
            { name: 'Cat-Cow', detail: '8–12 reps' }
        ]
    },
    'posture': {
        id: 'posture',
        title: 'Posture',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        description: 'Align your spine and strengthen supporting muscles for better posture.',
        exercises: [
            { name: 'Wall Posture', detail: '30–60 seconds' },
            { name: 'Chin Tuck', detail: '5–10 seconds, 10–15 reps' },
            { name: 'Shoulder Blade Squeeze', detail: '5–10 seconds, 10–15 reps' },
            { name: 'Superman', detail: '10–20 seconds, 8–12 reps' }
        ]
    }
};
