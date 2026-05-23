// workout.js

let cameraRef = null;
let countdownTimer = null;
let poseTracker = null;
let currentExerciseName = null;

// AI Tracker Variables
let currentSquatState = 'up';
let squatCount = 0;
let squatScore = 0;
let squatFeedback = "เตรียมพร้อม";

let currentPushupState = 'up';
let pushupCount = 0;
let pushupScore = 0;
let pushupFeedback = "เตรียมพร้อม";

let plankFramesGood = 0;
let plankFeedback = "เตรียมพร้อม";

let currentGluteBridgeState = 'down';
let gluteBridgeCount = 0;
let gluteBridgeScore = 0;
let gluteBridgeFeedback = "เตรียมพร้อม";

let isSequenceMode = false;
const sequenceExercises = ['Squat', 'Push-up', 'Plank', 'Glute Bridge'];
let sequenceIndex = 0;
let isTransitioning = false;

// Running in Place AI Pose Tracking State Variables
let runningScore = 100;
let runningFeedback = "เริ่มวิ่งอยู่กับที่ได้เลย!";
let runningLastUpdate = 0;
let runningFramesCorrect = 0;
let runningFramesTotal = 0;

// Jumping Jack AI Pose Tracking State Variables
let currentJumpingJackState = 'closed';
let jumpingJackCount = 0;
let jumpingJackScore = 100;
let jumpingJackFeedback = "เตรียมพร้อม";
let jumpingJackLastUpdate = 0;
let jumpingJackFramesCorrect = 0;
let jumpingJackFramesTotal = 0;

function drawWorkoutUI(ctx, width, height, exerciseName, count, score, feedback) {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.font = "bold 24px 'Google Sans', sans-serif";
    const uiX = width - 350;
    
    // Background for text
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(uiX - 20, 10, 360, 125, 12);
    } else {
        ctx.rect(uiX - 20, 10, 360, 125);
    }
    ctx.fill();
    ctx.stroke();
    
    // Exercise Name Label
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 18px 'Google Sans', sans-serif";
    ctx.fillText("กำลังฝึกท่า: " + exerciseName, uiX, 35);
    
    ctx.font = "bold 22px 'Google Sans', sans-serif";
    ctx.fillStyle = "#10b981"; // Green for reps
    if (exerciseName === 'Plank') {
        const goodSeconds = Math.floor(count / 30);
        ctx.fillText("เวลาทรงตัว: " + goodSeconds + " วิ", uiX, 70);
    } else {
        ctx.fillText("จำนวนครั้ง: " + count, uiX, 70);
    }
    
    ctx.fillStyle = "#f59e0b"; // Orange/Yellow for score
    if (exerciseName === 'Plank') {
        const goodSeconds = Math.floor(count / 30);
        ctx.fillText("คะแนน: " + (goodSeconds * 2), uiX + 180, 70);
    } else {
        ctx.fillText("คะแนน: " + score, uiX + 180, 70);
    }
    
    ctx.fillStyle = "#f8fafc"; // White for feedback
    ctx.font = "500 16px 'Google Sans', sans-serif";
    
    const cleanFeedback = feedback || "เตรียมพร้อม";
    ctx.fillText("คำแนะนำ: " + cleanFeedback.substring(0, 30), uiX, 102);
    if (cleanFeedback.length > 30) {
        ctx.fillText(cleanFeedback.substring(30), uiX, 120);
    }
    
    ctx.restore();
}

function calculateAngle(a, b, c) {
    let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function analyzeSquat(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        drawWorkoutUI(ctx, width, height, "Squat", squatCount, squatScore, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    // Check feet distance
    const shoulderDist = calculateDistance(leftShoulder, rightShoulder);
    const ankleDist = calculateDistance(leftAnkle, rightAnkle);
    
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

    // State Machine
    if (avgKneeAngle > 150) { // Standing
        if (currentSquatState === 'down') {
            currentSquatState = 'up';
            squatCount++;
            let repScore = 10;
            // Penalize if feet are not shoulder width apart (allow some margin)
            if (ankleDist < shoulderDist * 0.7 || ankleDist > shoulderDist * 1.5) {
                squatFeedback = "กางขาให้กว้างเท่าช่วงไหล่";
                repScore -= 2;
            } else {
                squatFeedback = "เยี่ยมมาก!";
            }
            squatScore += Math.max(0, repScore);
        } else {
            currentSquatState = 'up';
            if (ankleDist < shoulderDist * 0.7 || ankleDist > shoulderDist * 1.5) {
                squatFeedback = "1. ยืนกางขาให้กว้างเท่าช่วงไหล่";
            } else {
                squatFeedback = "เตรียมย่อตัวลง";
            }
        }
    } else if (avgKneeAngle < 110) { // Squatting down
        if (currentSquatState === 'up') {
            currentSquatState = 'down';
        }
        
        if (avgHipAngle < 60) {
            squatFeedback = "3. หลังตรง! อย่าย่อตัวก้มไปข้างหน้ามากไป";
        } else if (avgKneeAngle < 70) {
             squatFeedback = "ย่อลึกเกินไป ให้ได้มุมประมาณ 90 องศา";
        } else {
            squatFeedback = "2. ย่อเข่าดีมาก ลุกขึ้นได้เลย";
        }
    } else {
        // In between
        if (currentSquatState === 'down') {
             squatFeedback = "ดันตัวขึ้น...";
        } else {
             squatFeedback = "ย่อตัวลง...";
        }
    }

    // Draw unified UI
    drawWorkoutUI(ctx, width, height, "Squat", squatCount, squatScore, squatFeedback);
    
    // Visualize knee angles (still flipped is fine for numbers, or we can leave them, but let's un-flip them too for readability)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    // For joint angles, coordinates are normalized (0 to 1). Physical X is landmark.x * width.
    // Visual X is width - physical X.
    ctx.fillText(Math.round(leftKneeAngle) + "°", width - (leftKnee.x * width) + 15, leftKnee.y * height);
    ctx.fillText(Math.round(rightKneeAngle) + "°", width - (rightKnee.x * width) + 15, rightKnee.y * height);
    ctx.restore();
}

function analyzePushup(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist || !leftHip || !rightHip || !leftAnkle || !rightAnkle) {
        drawWorkoutUI(ctx, width, height, "Push-up", pushupCount, pushupScore, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    const useLeft = (leftElbow.visibility || 1) > (rightElbow.visibility || 1);
    const elbowAngle = useLeft ? leftElbowAngle : rightElbowAngle;
    
    const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
    const hipAngle = useLeft ? leftHipAngle : rightHipAngle;

    // State Machine
    if (elbowAngle > 150) { // UP
        if (currentPushupState === 'down') {
            currentPushupState = 'up';
            pushupCount++;
            let repScore = 10;
            if (hipAngle < 150) {
                pushupFeedback = "ก้นโด่งหรือหลังแอ่นเกินไป เกร็งลำตัวให้ตรง!";
                repScore -= 2;
            } else {
                pushupFeedback = "เยี่ยมมาก!";
            }
            pushupScore += Math.max(0, repScore);
        } else {
            currentPushupState = 'up';
            if (hipAngle < 150) {
                pushupFeedback = "1. เกร็งหน้าท้อง ลำตัวต้องตรงเป็นเส้นตรง";
            } else {
                pushupFeedback = "เตรียมย่อตัวลง (หายใจเข้า)";
            }
        }
    } else if (elbowAngle < 100) { // DOWN
        if (currentPushupState === 'up') {
            currentPushupState = 'down';
        }
        
        if (hipAngle < 150) {
            pushupFeedback = "ลำตัวต้องตรง! ห้ามก้นโด่งหรือหลังแอ่น";
        } else if (elbowAngle < 70) {
            pushupFeedback = "ย่อลึกเกินไป ดันตัวขึ้นได้เลย!";
        } else {
            pushupFeedback = "2. ความลึกกำลังดี ดันตัวขึ้น! (หายใจออก)";
        }
    } else {
        // In between
        if (currentPushupState === 'down') {
             pushupFeedback = "ดันตัวขึ้น...";
        } else {
             pushupFeedback = "ลดหน้าอกลงไปทางพื้น...";
        }
    }

    // Draw unified UI
    drawWorkoutUI(ctx, width, height, "Push-up", pushupCount, pushupScore, pushupFeedback);
    
    // Visualize elbow angle
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    const elbowToDraw = useLeft ? leftElbow : rightElbow;
    ctx.fillText(Math.round(elbowAngle) + "°", width - (elbowToDraw.x * width) + 15, elbowToDraw.y * height);
    ctx.restore();
}

function analyzePlank(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const nose = landmarks[0];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle || !nose) {
        drawWorkoutUI(ctx, width, height, "Plank", plankFramesGood, 0, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    const useLeft = (leftShoulder.visibility || 1) > (rightShoulder.visibility || 1);
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const hip = useLeft ? leftHip : rightHip;
    const ankle = useLeft ? leftAnkle : rightAnkle;

    const hipAngle = calculateAngle(shoulder, hip, ankle);
    const expectedHipY = (shoulder.y + ankle.y) / 2;
    const isSagging = hip.y > expectedHipY + 0.05; // Y grows downwards
    const isPiked = hip.y < expectedHipY - 0.05;
    
    // Check neck/head angle (Nose - Shoulder - Hip)
    const neckAngle = calculateAngle(nose, shoulder, hip);

    let isStraight = hipAngle >= 160;

    if (isStraight) {
        if (neckAngle < 150) {
             plankFeedback = "อย่าเงยหน้าหรือก้มเกินไป มองลงพื้นตรงๆ";
        } else {
             plankFeedback = "เยี่ยมมาก ลำตัวตรงสวย ค้างไว้!";
             plankFramesGood += 1;
        }
    } else {
        if (isPiked) {
            plankFeedback = "ก้นโด่งเกินไป ลดสะโพกลงให้ขนานกับพื้น";
        } else if (isSagging) {
            plankFeedback = "อย่าปล่อยเอวตก เกร็งหน้าท้องดันสะโพกขึ้น";
        } else {
            plankFeedback = "จัดระเบียบร่างกายให้เป็นเส้นตรง";
        }
    }

    // Draw unified UI
    drawWorkoutUI(ctx, width, height, "Plank", plankFramesGood, 0, plankFeedback);
    
    // Visualize hip angle
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(Math.round(hipAngle) + "°", width - (hip.x * width) + 15, hip.y * height);
    ctx.restore();
}

function analyzeGluteBridge(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        drawWorkoutUI(ctx, width, height, "Glute Bridge", gluteBridgeCount, gluteBridgeScore, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    // Use side with better visibility
    const useLeft = (leftHip.visibility || 1) > (rightHip.visibility || 1);
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;
    const ankle = useLeft ? leftAnkle : rightAnkle;

    const hipAngle = calculateAngle(shoulder, hip, knee);

    // State Machine based on hip angle (lying down vs lifted hips)
    // When hips are lifted (up), the angle between shoulder-hip-knee is straight (close to 180 degrees, say > 160)
    // When lying down (down), the hips are bent, so the angle is smaller (say < 135)
    if (hipAngle > 160) {
        if (currentGluteBridgeState === 'down') {
            currentGluteBridgeState = 'up';
            gluteBridgeCount++;
            gluteBridgeScore += 10;
            gluteBridgeFeedback = "เกร็งก้นค้างไว้ เยี่ยมมาก!";
        } else {
            gluteBridgeFeedback = "เกร็งก้นและแกนกลางลำตัวไว้";
        }
    } else if (hipAngle < 135) {
        if (currentGluteBridgeState === 'up') {
            currentGluteBridgeState = 'down';
        }
        gluteBridgeFeedback = "ดันสะโพกขึ้นมาให้สุด";
    } else {
        if (currentGluteBridgeState === 'down') {
            gluteBridgeFeedback = "ยกสะโพกขึ้น...";
        } else {
            gluteBridgeFeedback = "ค่อยๆ ลดสะโพกลง...";
        }
    }

    // Draw unified UI
    drawWorkoutUI(ctx, width, height, "Glute Bridge", gluteBridgeCount, gluteBridgeScore, gluteBridgeFeedback);
    
    // Visualize hip angle
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(Math.round(hipAngle) + "°", width - (hip.x * width) + 15, hip.y * height);
    ctx.restore();
}

function analyzeRunningInPlace(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const nose = landmarks[0];

    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle || !nose) {
        drawWorkoutUI(ctx, width, height, "Running in Place", 0, runningScore, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    // Use side with better visibility
    const useLeft = (leftHip.visibility || 1) > (rightHip.visibility || 1);
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const elbow = useLeft ? leftElbow : rightElbow;
    const wrist = useLeft ? leftWrist : rightWrist;
    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;
    const ankle = useLeft ? leftAnkle : rightAnkle;

    // 1. Posture Check
    // Head / Eye Level: should not bend down
    const neckAngle = calculateAngle(nose, shoulder, hip);
    const isHeadCorrect = neckAngle > 145; // Hunched back/looking down if < 145

    // Trunk alignment: hip angle Shoulder-Hip-Knee should be upright/straight
    const hipAngle = calculateAngle(shoulder, hip, knee);
    const isHipCorrect = hipAngle > 155; // Bending at waist if < 155

    // 2. Arms/Elbow Angle Check (approx 90 degrees: 70 - 120)
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const isElbowCorrect = elbowAngle >= 70 && elbowAngle <= 120;

    // 3. Wrist Swing Check (around waist level, hand not raised high)
    const isWristHeightCorrect = wrist.y > shoulder.y; // Loose and relaxed swing below shoulders

    const isAllCorrect = isHeadCorrect && isHipCorrect && isElbowCorrect && isWristHeightCorrect;

    // Accumulate frames
    runningFramesTotal++;
    if (isAllCorrect) {
        runningFramesCorrect++;
    }

    // Provide feedback
    if (!isHeadCorrect) {
        runningFeedback = "มองตรงไปข้างหน้า ห้ามก้มมองพื้น!";
    } else if (!isHipCorrect) {
        runningFeedback = "ยืดตัวตรง โน้มจากข้อเท้า (ห้ามงอเอว)!";
    } else if (!isElbowCorrect) {
        runningFeedback = "งอศอกทำมุมประมาณ 90 องศา!";
    } else if (!isWristHeightCorrect) {
        runningFeedback = "ผ่อนคลายมือ แกว่งระนาบสะโพก!";
    } else {
        runningFeedback = "ท่าทางยอดเยี่ยม วิ่งจับจังหวะต่อไป!";
    }

    // Update score every 1 second (1000ms)
    const now = Date.now();
    if (now - runningLastUpdate >= 1000) {
        runningLastUpdate = now;
        
        if (runningFramesTotal > 0) {
            const correctRatio = runningFramesCorrect / runningFramesTotal;
            if (correctRatio >= 0.5) {
                // Correct posture adds 1 point (max 100)
                runningScore = Math.min(100, runningScore + 1);
            } else {
                // Incorrect posture subtracts 1 point (min 0)
                runningScore = Math.max(0, runningScore - 1);
            }
        }
        
        runningFramesCorrect = 0;
        runningFramesTotal = 0;
    }

    // Draw UI
    drawWorkoutUI(ctx, width, height, "Running in Place", 0, runningScore, runningFeedback);

    // Draw helper angles on joint joints for feedback visual quality
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("ศอก: " + Math.round(elbowAngle) + "°", width - (elbow.x * width) + 15, elbow.y * height);
    ctx.fillText("สะโพก: " + Math.round(hipAngle) + "°", width - (hip.x * width) + 15, hip.y * height);
    ctx.restore();
}

function analyzeJumpingJack(landmarks, ctx, width, height) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const nose = landmarks[0];

    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist || !leftHip || !rightHip || !leftAnkle || !rightAnkle || !nose || !leftElbow || !rightElbow) {
        drawWorkoutUI(ctx, width, height, "Jumping Jack", jumpingJackCount, jumpingJackScore, "กรุณาจัดร่างกายให้เห็นเต็มตัว");
        return;
    }

    // Measure distance between shoulders and ankles
    const shoulderDist = calculateDistance(leftShoulder, rightShoulder);
    const ankleDist = calculateDistance(leftAnkle, rightAnkle);

    // Calculate elbow angles to verify straight or slightly bent elbows (preferably > 140 degrees)
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const isElbowsStraight = leftElbowAngle > 140 && rightElbowAngle > 140;

    // AI Check conditions based on Posture Rules
    const isArmsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
    const isLegsWide = ankleDist > shoulderDist * 1.25;
    const isArmsDown = leftWrist.y > leftHip.y && rightWrist.y > rightHip.y;
    const isLegsClose = ankleDist < shoulderDist * 1.0; // เท้าชิด

    // Evaluate core engagement / upright posture (waist/hips should not bend forward excessively)
    const leftHipAngle = calculateAngle(leftShoulder, leftHip, landmarks[25] || leftAnkle);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, landmarks[26] || rightAnkle);
    const isTrunkUpright = leftHipAngle > 155 && rightHipAngle > 155;

    // State machine logic for counting repetitions
    if (isArmsUp && isLegsWide) {
        if (currentJumpingJackState === 'closed') {
            currentJumpingJackState = 'open';
        }
        jumpingJackFeedback = "กางขาและยกแขนยอดเยี่ยม! หุบขากลับเข้ามา";
    } else if (isArmsDown && isLegsClose) {
        if (currentJumpingJackState === 'open') {
            currentJumpingJackState = 'closed';
            jumpingJackCount++;
            jumpingJackFeedback = "กระโดดหุบขากลับมาท่าเตรียมเยี่ยมมาก!";
        } else {
            jumpingJackFeedback = "เตรียมตัวในท่ากางขา-ยกแขน";
        }
    } else {
        if (currentJumpingJackState === 'closed') {
            jumpingJackFeedback = "กระโดดกางขาและยกแขนขึ้น...";
        } else {
            jumpingJackFeedback = "กระโดดหุบขาลดแขนลง...";
        }
    }

    // Posture validation for active score adjustment
    let isPoseValid = true;
    if (currentJumpingJackState === 'open') {
        // ในจังหวะกางขา-ยกแขน: ขาต้องกว้าง ศอกต้องเหยียดตรง แขนต้องยกขึ้นพ้นหัวไหล่
        if (!isLegsWide) {
            jumpingJackFeedback = "จังหวะกางขา: กระโดดแยกเท้าให้กว้างประมาณช่วงไหล่!";
            isPoseValid = false;
        } else if (!isArmsUp) {
            jumpingJackFeedback = "จังหวะยกแขน: ยกแขนชูขึ้นสูงด้านข้างเหนือศีรษะ!";
            isPoseValid = false;
        } else if (!isElbowsStraight) {
            jumpingJackFeedback = "จังหวะยกแขน: เหยียดข้อศอกให้ตรง ไม่ควรงอแขน!";
            isPoseValid = false;
        }
    } else {
        // ในท่าเตรียมและจังหวะหุบขา-ลดแขน: ลำตัวต้องตรง เท้าต้องชิด แขนต้องแนบลำตัว
        if (!isTrunkUpright) {
            jumpingJackFeedback = "ท่าเตรียม/หุบขา: ยืนลำตัวและแผ่นหลังตรง เกร็งหน้าท้องเล็กน้อย!";
            isPoseValid = false;
        } else if (isLegsWide && ankleDist > shoulderDist * 1.1) {
            jumpingJackFeedback = "จังหวะหุบขา: กระโดดหุบเท้ากลับมาให้ชิดสนิทกัน!";
            isPoseValid = false;
        } else if (leftWrist.y < leftHip.y || rightWrist.y < rightHip.y) {
            jumpingJackFeedback = "จังหวะลดแขน: ลดแขนทั้งสองข้างลงแนบลำตัว!";
            isPoseValid = false;
        }
    }

    // Accumulate evaluation metrics for 1-second scoring interval
    jumpingJackFramesTotal++;
    if (isPoseValid) {
        jumpingJackFramesCorrect++;
    }

    // Update score every 1 second (1000ms)
    const now = Date.now();
    if (now - jumpingJackLastUpdate >= 1000) {
        jumpingJackLastUpdate = now;
        
        if (jumpingJackFramesTotal > 0) {
            const correctRatio = jumpingJackFramesCorrect / jumpingJackFramesTotal;
            if (correctRatio >= 0.5) {
                // Correct posture adds 1 point (max 100)
                jumpingJackScore = Math.min(100, jumpingJackScore + 1);
            } else {
                // Incorrect posture subtracts 1 point (min 0)
                jumpingJackScore = Math.max(0, jumpingJackScore - 1);
            }
        }
        
        jumpingJackFramesCorrect = 0;
        jumpingJackFramesTotal = 0;
    }

    // Draw unified UI
    drawWorkoutUI(ctx, width, height, "Jumping Jack", jumpingJackCount, jumpingJackScore, jumpingJackFeedback);
}

function renderWorkout(modeId) {
    const workout = workoutData[modeId];
    if (!workout) {
        return `<h2>Workout not found</h2>`;
    }

    const exercisesHtml = workout.exercises.map(ex => `
        <div class="exercise-item" data-name="${ex.name}" style="cursor: pointer; position: relative;">
            <span class="exercise-name">${ex.name}</span>
            <span class="exercise-detail" style="margin-right: 30px;">${ex.detail}</span>
            <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: var(--primary-color);">▶️</div>
        </div>
    `).join('');

    return `
        <div id="workout-overview">
            <div style="margin-bottom: 2rem;">
                <a href="#" data-route="dashboard" style="text-decoration: none; color: var(--primary-color); font-weight: 500;">
                    &larr; Back to Dashboard
                </a>
            </div>
            
            <div class="workout-header">
                <div class="mode-icon" style="font-size: 4rem;">${workout.icon}</div>
                <h2>${workout.title}</h2>
                <p style="max-width: 600px; margin: 0 auto; color: var(--text-main); margin-top: 1rem;">
                    ${workout.description}
                </p>
                <p style="color: var(--accent-color); font-weight: bold; margin-top: 1rem;">⬇️ กดที่ชื่อท่าออกกำลังกายด้านล่างเพื่อเริ่มฝึกได้เลย ⬇️</p>
            </div>

            <div class="exercise-list">
                ${exercisesHtml}
            </div>

            <button id="start-workout-btn" class="btn btn-large" data-workout="${workout.id}">
                เริ่มการฝึกทั้งหมด (AI Tracking)
            </button>
        </div>
        <div id="ai-tracker-view" style="display: none;"></div>
    `;
}

function attachWorkoutEvents(modeId) {
    const btn = document.getElementById('start-workout-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            startAITracker();
        });
    }
    
    // ทำให้กดที่กรอบชื่อท่า แล้วเริ่มกล้องได้เลย
    const exerciseItems = document.querySelectorAll('.exercise-item');
    exerciseItems.forEach(item => {
        item.addEventListener('click', () => {
            const exerciseName = item.getAttribute('data-name');
            startAITracker(exerciseName);
        });
    });
}

function startAITracker(exerciseName = null) {
    if (exerciseName === null) {
        isSequenceMode = true;
        sequenceIndex = 0;
        exerciseName = sequenceExercises[0]; // เริ่มต้นด้วย Squat
    } else {
        isSequenceMode = false;
    }

    currentExerciseName = exerciseName;
    
    // รีเซ็ตสถานะทั้งหมดเพื่อให้สะอาด
    currentSquatState = 'up';
    squatCount = 0;
    squatScore = 0;
    squatFeedback = "เตรียมพร้อม";
    
    currentPushupState = 'up';
    pushupCount = 0;
    pushupScore = 0;
    pushupFeedback = "เตรียมพร้อม";
    
    plankFramesGood = 0;
    plankFeedback = "เตรียมพร้อม";

    currentGluteBridgeState = 'down';
    gluteBridgeCount = 0;
    gluteBridgeScore = 0;
    gluteBridgeFeedback = "เตรียมพร้อม";
    
    isTransitioning = false;

    // รีเซ็ตตัวแปร Running in Place
    runningScore = 100;
    runningFeedback = "เริ่มวิ่งอยู่กับที่ได้เลย!";
    runningLastUpdate = Date.now();
    runningFramesCorrect = 0;
    runningFramesTotal = 0;

    // รีเซ็ตตัวแปร Jumping Jack
    currentJumpingJackState = 'closed';
    jumpingJackCount = 0;
    jumpingJackScore = 100;
    jumpingJackFeedback = "เตรียมพร้อม";
    jumpingJackLastUpdate = Date.now();
    jumpingJackFramesCorrect = 0;
    jumpingJackFramesTotal = 0;

    // ซ่อนหน้าจอรวม และแสดงหน้าจอ Tracker
    document.getElementById('workout-overview').style.display = 'none';
    const trackerContainer = document.getElementById('ai-tracker-view');
    trackerContainer.style.display = 'block';

    let videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    if (exerciseName === 'Squat') {
        videoUrl = "/assets/squat.mp4";
    } else if (exerciseName === 'Push-up') {
        videoUrl = "/assets/pushup.mp4";
    } else if (exerciseName === 'Plank') {
        videoUrl = "/assets/plank.mp4";
    } else if (exerciseName === 'Glute Bridge') {
        videoUrl = "/assets/glutebridge.mp4";
    } else if (exerciseName === 'Running in Place') {
        videoUrl = "/assets/runninginplace.mp4";
    } else if (exerciseName === 'Jumping Jack') {
        videoUrl = "/assets/jumpingjack.mp4";
    }

    trackerContainer.innerHTML = `
        <div class="workout-tracker-container" id="tracker-container">
            <!-- Tutorial Video Placeholder (Ring Fit Style Vibe) -->
            <video id="tutorial-video" class="tutorial-video" autoplay loop muted playsinline>
                <source src="${videoUrl}" type="video/mp4">
            </video>
            
            <!-- Camera Feed (Hidden initially) -->
            <video id="webcam" class="camera-feed hidden" autoplay playsinline></video>
            <canvas id="pose-canvas" class="pose-canvas hidden"></canvas>
            
            <!-- Overlays -->
            <div id="ready-overlay" class="ready-overlay hidden">
                <h2>เตรียมพร้อม...</h2>
                <p>กำลังเปิดกล้อง และโหลดโมเดล AI</p>
            </div>
            
            <div id="transition-overlay" class="ready-overlay hidden" style="background: rgba(15, 23, 42, 0.9); z-index: 10000; flex-direction: column;">
                <h1 id="transition-text" style="color: white; font-size: 3rem; text-align: center; font-weight: 800; line-height: 1.5;">เปลี่ยนท่า เป็นท่า...</h1>
            </div>
            
            <div id="timer-overlay" class="timer-overlay hidden">
                ⏱️ <span id="timer-text">${exerciseName === 'Running in Place' ? 900 : (exerciseName === 'Jumping Jack' ? 60 : (isSequenceMode ? 60 : 20))}</span> วินาที
            </div>
            
            <button id="cancel-workout" class="btn" style="position: absolute; bottom: 20px; left: 20px; width: 100px; z-index: 1000; background-color: #ef4444;">
                ยกเลิก
            </button>
        </div>
    `;

    document.getElementById('cancel-workout').addEventListener('click', stopWorkoutAndReturn);

    // จำลองการเล่นวิดีโอสอน 15 วินาที แล้วแสดงกล้อง
    setTimeout(() => {
        transitionToCamera();
    }, 15000); 
}

async function transitionToCamera() {
    const vid = document.getElementById('tutorial-video');
    vid.classList.add('pip-mode'); // ย่อวิดีโอเป็นกรอบเล็ก PIP
    
    const webcam = document.getElementById('webcam');
    const canvas = document.getElementById('pose-canvas');
    const readyOverlay = document.getElementById('ready-overlay');
    
    webcam.classList.remove('hidden');
    canvas.classList.remove('hidden');
    readyOverlay.classList.remove('hidden');

    try {
        if (!window.Pose) {
            throw new Error("MediaPipe Library ยังโหลดไม่เสร็จ");
        }

        // Initialize MediaPipe Pose
        poseTracker = new window.Pose({locateFile: (file) => {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file;
        }});
        
        poseTracker.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        const canvasCtx = canvas.getContext('2d');
        
        poseTracker.onResults((results) => {
            canvas.width = webcam.videoWidth;
            canvas.height = webcam.videoHeight;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!isTransitioning) {
                if (results.poseLandmarks) {
                    window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {color: '#10b981', lineWidth: 4});
                    window.drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#3b82f6', lineWidth: 2, radius: 3});
                    
                    if (currentExerciseName === 'Squat') {
                        analyzeSquat(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    } else if (currentExerciseName === 'Push-up') {
                        analyzePushup(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    } else if (currentExerciseName === 'Plank') {
                        analyzePlank(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    } else if (currentExerciseName === 'Glute Bridge') {
                        analyzeGluteBridge(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    } else if (currentExerciseName === 'Running in Place') {
                        analyzeRunningInPlace(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    } else if (currentExerciseName === 'Jumping Jack') {
                        analyzeJumpingJack(results.poseLandmarks, canvasCtx, canvas.width, canvas.height);
                    }
                } else {
                    // แสดงผลคะแนนและจำนวนครั้งบนกล่อง UI ตลอดเวลา แม้ยังเปิดโหลดกล้องหรือส่องไม่โดนตัวผู้ใช้
                    let feedback = "กรุณาจัดวางร่างกายให้เห็นเต็มตัว";
                    if (currentExerciseName === 'Squat') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Squat", squatCount, squatScore, feedback);
                    } else if (currentExerciseName === 'Push-up') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Push-up", pushupCount, pushupScore, feedback);
                    } else if (currentExerciseName === 'Plank') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Plank", plankFramesGood, 0, feedback);
                    } else if (currentExerciseName === 'Glute Bridge') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Glute Bridge", gluteBridgeCount, gluteBridgeScore, feedback);
                    } else if (currentExerciseName === 'Running in Place') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Running in Place", 0, runningScore, feedback);
                    } else if (currentExerciseName === 'Jumping Jack') {
                        drawWorkoutUI(canvasCtx, canvas.width, canvas.height, "Jumping Jack", jumpingJackCount, jumpingJackScore, feedback);
                    }
                }
            }
            canvasCtx.restore();
        });

        // Initialize Camera
        cameraRef = new window.Camera(webcam, {
            onFrame: async () => {
                await poseTracker.send({image: webcam});
            },
            width: 1280,
            height: 720
        });
        
        await cameraRef.start();
        
        // Hide ready overlay and show timer
        readyOverlay.classList.add('hidden');
        document.getElementById('timer-overlay').classList.remove('hidden');
        
        // เริ่มจับเวลา 15 นาที (900 วิ) สำหรับ Running in Place หรือ 60 วิ สำหรับ Jumping Jack หรือ 20 วิ สำหรับทั่วไป
        if (currentExerciseName === 'Running in Place') {
            startTimer(900);
        } else if (currentExerciseName === 'Jumping Jack') {
            startTimer(60);
        } else {
            startTimer(isSequenceMode ? 60 : 20);
        }

    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการเปิดกล้อง หรือโหลด AI Tracker');
        stopWorkoutAndReturn();
    }
}

function startTimer(seconds) {
    let timeLeft = seconds;
    const timerText = document.getElementById('timer-text');
    if (timerText) {
        timerText.innerText = timeLeft;
    }
    
    countdownTimer = setInterval(() => {
        timeLeft--;
        if (timerText) {
            timerText.innerText = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            if (isSequenceMode) {
                handleSequenceNext();
            } else {
                window.updateWorkoutsCompleted();
                window.showToast('เยี่ยมมาก! คุณทำฝึกท่านี้สำเร็จแล้ว 🎉');
                
                // รอให้แสดง Toast เสร็จแล้วพากลับ
                setTimeout(() => {
                    stopWorkoutAndReturn();
                }, 2000);
            }
        }
    }, 1000);
}

function handleSequenceNext() {
    sequenceIndex++;
    
    if (sequenceIndex < sequenceExercises.length) {
        isTransitioning = true;
        
        const nextExercise = sequenceExercises[sequenceIndex];
        
        // แสดง Overlay เปลี่ยนท่า ตรงกลางจอตัวอักษรสีขาว
        const transitionOverlay = document.getElementById('transition-overlay');
        const transitionText = document.getElementById('transition-text');
        if (transitionOverlay && transitionText) {
            transitionText.innerHTML = `เปลี่ยนท่า<br>เป็นท่า <span style="color: #3b82f6; font-size: 4.5rem; text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);">${nextExercise}</span>`;
            transitionOverlay.classList.remove('hidden');
        }
        
        // ซ่อนตัวจับเวลาชั่วคราว
        const timerOverlay = document.getElementById('timer-overlay');
        if (timerOverlay) {
            timerOverlay.classList.add('hidden');
        }
        
        // เปลี่ยนวิดีโอสอนและเริ่มเล่นใหม่
        currentExerciseName = nextExercise;
        let videoUrl = "/assets/squat.mp4";
        if (nextExercise === 'Push-up') videoUrl = "/assets/pushup.mp4";
        else if (nextExercise === 'Plank') videoUrl = "/assets/plank.mp4";
        else if (nextExercise === 'Glute Bridge') videoUrl = "/assets/glutebridge.mp4";
        
        const tutorialVid = document.getElementById('tutorial-video');
        if (tutorialVid) {
            tutorialVid.src = videoUrl;
            tutorialVid.load();
            tutorialVid.play();
            tutorialVid.classList.remove('pip-mode'); // ขยายเป็นเต็มจอให้เห็นท่าใหม่ชัดๆ
        }
        
        // รีเซ็ตตัวแปรประเมินผลท่าใหม่
        if (nextExercise === 'Push-up') {
            currentPushupState = 'up';
            pushupCount = 0;
            pushupScore = 0;
            pushupFeedback = "เตรียมพร้อม";
        } else if (nextExercise === 'Plank') {
            plankFramesGood = 0;
            plankFeedback = "เตรียมพร้อม";
        } else if (nextExercise === 'Glute Bridge') {
            currentGluteBridgeState = 'down';
            gluteBridgeCount = 0;
            gluteBridgeScore = 0;
            gluteBridgeFeedback = "เตรียมพร้อม";
        }
        
        // ให้เวลาอ่านคำเตือนและดูตัวอย่าง 5 วินาทีก่อนเริ่มดีเทคใหม่
        setTimeout(() => {
            if (tutorialVid) {
                tutorialVid.classList.add('pip-mode'); // ย่อวิดีโอกลับเป็น PIP
            }
            if (transitionOverlay) {
                transitionOverlay.classList.add('hidden');
            }
            if (timerOverlay) {
                timerOverlay.classList.remove('hidden');
            }
            
            isTransitioning = false;
            startTimer(60); // เริ่มดีเทคท่าถัดไปเป็นเวลา 1 นาที (60 วินาที)
        }, 5000);
        
    } else {
        // ครบทุกท่า
        window.updateWorkoutsCompleted();
        window.showToast('ยอดเยี่ยมมาก! คุณฝึกครบทุกท่าในหมวด Strength แล้ว! 💪🎉');
        
        setTimeout(() => {
            stopWorkoutAndReturn();
        }, 2000);
    }
}

function stopWorkoutAndReturn() {
    if (cameraRef) {
        cameraRef.stop();
        cameraRef = null;
    }
    if (poseTracker) {
        poseTracker.close();
        poseTracker = null;
    }
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    
    // พากลับไปหน้า Dashboard
    window.navigateTo('dashboard');
}
