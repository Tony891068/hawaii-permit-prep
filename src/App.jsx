import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

// ─── FIREBASE INIT ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, q: "When you take a road test for a driver's license, which of the following is true?", opts: ["You must provide the vehicle.", "The vehicle must be in safe operating condition free of safety defects.", "You must be accompanied to the testing station by a licensed driver.", "All of the above."], ans: 3, page: 15 },
  { id: 2, q: "When you change your address you must notify the County Examiner of drivers:", opts: ["In writing, within 30 days.", "In writing, within 10 days.", "In person, within 10 days.", "By telephone, within 30 days."], ans: 0, page: 16 },
  { id: 3, q: "When you change your name you must notify the County Examiner of drivers in person with proof of the change within:", opts: ["60 days.", "20 days.", "10 days.", "30 days."], ans: 3, page: 16 },
  { id: 4, q: "When driving a vehicle upon any public street or highway you must:", opts: ["Show your driver's license upon demand.", "Carry your license with you.", "Have a valid driver's license.", "All of the above."], ans: 3, page: 17 },
  { id: 5, q: "When your driver's license expires you may:", opts: ["Drive during the grace period of 90 days.", "Drive as long as you are accompanied by a licensed driver.", "You may not drive but you may renew your license within a year after expiration.", "Drive to and from work only."], ans: 2, page: 15 },
  { id: 6, q: "All head lamps on your vehicle must work properly and be correctly adjusted:", opts: ["When driving in city traffic.", "At all times.", "When driving on freeways.", "When approaching other vehicles."], ans: 1, page: 19 },
  { id: 7, q: "Which of the following equipment may you have installed on your private vehicle?", opts: ["A red light showing from the front, or a blue light visible outside of the vehicle.", "A bell, exhaust whistle or siren.", "A muffler cut-out or by-pass if used only on country roads.", "None of the above."], ans: 3, page: 18 },
  { id: 8, q: "A copy of the vehicle inspection certificate:", opts: ["Should be kept in the vehicle.", "Filed with your State income tax return.", "Be kept in a safe place in the home.", "Will be sent to you by the County Department of Finance."], ans: 0, page: 18 },
  { id: 9, q: "The mechanical condition of the vehicle is the responsibility of:", opts: ["The legal owner of the vehicle.", "The garage mechanic.", "The vehicle driver and registered owner of the vehicle.", "The insurance company."], ans: 2, page: 19 },
  { id: 10, q: "A leaky exhaust system in your vehicle is dangerous because it can cause:", opts: ["A loss of hearing.", "Pollution.", "Carbon monoxide poisoning.", "Poor engine performance."], ans: 2, page: 20 },
  { id: 11, q: "The agencies responsible for Vehicle Registration and Licensing are:", opts: ["The County Police Departments.", "The County Departments of Public Works.", "The State Department of Transportation.", "The different county agencies."], ans: 3, page: 21 },
  { id: 12, q: "When you as a registered owner of a vehicle change your address from that shown on the registration certificate you must notify the County Department of Finance:", opts: ["When renewing the license.", "Within 30 days after the change.", "Only when selling or trading the car.", "You do not have to do anything."], ans: 1, page: 21 },
  { id: 13, q: "The most important thing in any driving situation is:", opts: ["The vehicle.", "The environment (the highway and traffic).", "The driver (you).", "The time of day."], ans: 2, page: 24 },
  { id: 14, q: "You are angry after being chewed out by your boss. When you get to your car you should:", opts: ["Play the radio loud so you won't think about it.", "Drive fast on the Interstate so you can let off steam.", "Take a few minutes to cool off before you drive home.", "Stop in at your favorite bar and have a few drinks before driving home."], ans: 2, page: 24 },
  { id: 15, q: "You may be challenged by other drivers to demonstrate your driving capabilities on the highway. You should:", opts: ["Resist the desire to exhibit and compete.", "Decline all challenges to prove your vehicle's capabilities.", "Take on only those challenges which you know you can safely win.", "Both 1 and 2 above."], ans: 3, page: 25 },
  { id: 16, q: "To ensure that your physical condition does not cause you to drive unsafely, you should:", opts: ["Keep physically fit and have regular physical examinations.", "Know the effect of any medicine on your driving ability.", "Drive within your physical limitations.", "All of the above."], ans: 3, page: 25 },
  { id: 17, q: "A police officer directing traffic directs you to go through a red light, what should you do?", opts: ["Stop, and then go.", "Wait for the green light.", "Go on as directed.", "Make a right turn."], ans: 2, page: 26 },
  { id: 18, q: "Which of the following influences your driving actions most?", opts: ["Your height.", "Your age.", "Your attitude towards driving.", "Your reaction time."], ans: 2, page: 24 },
  { id: 19, q: "Traffic signs and pavement markings must be:", opts: ["Always obeyed.", "Used as a guide only.", "Followed only when there is other traffic.", "Followed only when a police officer is present."], ans: 0, page: 26 },
  { id: 20, q: "You are driving on a narrow road and you meet an oncoming vehicle. You must:", opts: ["Pull completely off the road and stop.", "Allow the oncoming vehicle at least one-half of the main travelled portion of the road.", "Make the other vehicle pull over as you were there first.", "Turn on your headlights to make sure the other vehicle sees you."], ans: 1, page: 26 },
  { id: 21, q: "When turning or changing lanes you must:", opts: ["Always signal your intentions even when there is no traffic visible.", "Signal only if there is traffic.", "Signal only when driving at night.", "Signal only when driving in traffic at night."], ans: 0, page: 27 },
  { id: 22, q: "You are coming to a railroad crossing and the crossing signals are flashing. You should:", opts: ["Stop and look for a train.", "Slow down and look for a train.", "Look for a train, then speed up.", "Do what the approaching vehicle does."], ans: 0, page: 27 },
  { id: 23, q: "You must not drive your vehicle at a speed greater than:", opts: ["The posted maximum speed limit.", "A speed that is greater than is reasonable and prudent.", "A speed that is safe for existing conditions.", "All of the above."], ans: 3, page: 28 },
  { id: 24, q: "When you leave your vehicle unattended, you must:", opts: ["Stop the engine.", "Lock the ignition and remove the ignition key.", "Set the parking brake.", "All of the above."], ans: 3, page: 29 },
  { id: 25, q: "You are driving on the roadway and hear a siren behind you. You should:", opts: ["Stop.", "Pull over to the right and stop.", "Speed up to get out of the way.", "Slow down."], ans: 1, page: 29 },
  { id: 26, q: "You are driving and there is an emergency vehicle with siren and flashing lights directly behind you in heavy traffic. You should:", opts: ["Stop.", "Blow your horn.", "Force your way into traffic in the adjoining lane.", "Keep moving slowly until you can get out of the way."], ans: 3, page: 29 },
  { id: 27, q: "You may pass another vehicle:", opts: ["On a curve or a hill because the chance is small that another vehicle is coming.", "On the shoulder of the highway.", "When there is a solid yellow line in your lane if it's clear ahead.", "None of the above."], ans: 3, page: 30 },
  { id: 28, q: "You may pass a school bus from the front or rear on an undivided roadway:", opts: ["Never.", "When the red lamps on the school bus are flashing.", "When the red lamps on the school bus are not flashing.", "At any time, if you go slow."], ans: 0, page: 31 },
  { id: 29, q: "An intersection has no traffic signs or signals. You arrive at the same time as another vehicle. You should:", opts: ["Speed up and get through the intersection.", "Slow down and yield to the vehicle on the right.", "Drive into the intersection and make the other vehicle stop.", "Honk your horn and drive through the intersection."], ans: 1, page: 32 },
  { id: 30, q: "A steady circular yellow light on a traffic signal means:", opts: ["You should speed up to beat the red light.", "That a red light is going to be shown immediately thereafter.", "You should avoid entering the intersection if possible.", "Both 2 and 3 above."], ans: 3, page: 39 },
  { id: 31, q: "A red flashing signal means the same as a:", opts: ["Red light.", "Stop sign.", "Yield sign.", "Caution sign."], ans: 1, page: 41 },
  { id: 32, q: "A circular green traffic light means:", opts: ["That you always have the right of way.", "That you may go straight ahead or turn, except where signs prohibit turns.", "Traffic and pedestrians already in the intersection must get out of your way.", "Both 2 and 3 above."], ans: 1, page: 40 },
  { id: 33, q: "A stopped vehicle facing a circular red traffic light may turn right if not prohibited by a traffic sign:", opts: ["After yielding to other traffic and pedestrians.", "It is illegal to turn right on red.", "Turn right at any time.", "Turn right only after blowing the horn."], ans: 0, page: 39 },
  { id: 34, q: "A stopped vehicle facing a circular red traffic light may turn left if not prohibited by a sign:", opts: ["When there is no other traffic or pedestrians.", "Never.", "Only right turns on red are permitted in Hawaii.", "After yielding to pedestrians and traffic, when turning from a one-way street into another one-way street."], ans: 3, page: 39 },
  { id: 35, q: "You are coming to an intersection and have a green light. Pedestrians are crossing against the red. You should:", opts: ["Honk your horn.", "Speed up and pass in front of the pedestrians.", "Stop to let the pedestrians cross safely.", "Drive close and frighten the pedestrians."], ans: 2, page: 32 },
  { id: 36, q: "When you drive into the street from any driveway you:", opts: ["Must drive slowly so approaching vehicles and pedestrians can get out of your way.", "Must honk the horn so approaching vehicles can allow you room.", "Must stop and proceed only when there are no pedestrians or vehicles approaching.", "Can disregard pedestrians if there is no sidewalk."], ans: 2, page: 32 },
  { id: 37, q: "When turning left at an intersection or into any driveway you:", opts: ["Should leave room on the right for other vehicles to pass.", "Must yield to vehicles approaching closely from the opposite direction.", "Must not cross any solid yellow line.", "Must not block vehicles approaching from the rear."], ans: 1, page: 32 },
  { id: 38, q: "Certain highway signs and markings require that you must obey the indicated instruction. Such signs are known as:", opts: ["Regulatory signs.", "Warning signs.", "Information signs.", "Guide signs."], ans: 0, page: 33 },
  { id: 39, q: "Certain highway signs and markings contain information about hazardous conditions. Such signs are known as:", opts: ["Regulatory signs.", "Warning signs.", "Information signs.", "Guide signs."], ans: 1, page: 33 },
  { id: 40, q: "You are driving on a highway divided by two solid yellow lines. You know that:", opts: ["You may cross these lines only to make a left turn into or from an alley, private road or driveway.", "You may cross these lines to pass other vehicles only if there is no oncoming traffic.", "You may never cross these lines.", "You may cross these lines only to make a U-turn."], ans: 0, page: 33 },
  { id: 41, q: "Double solid white lines indicate that movement from lane to lane is:", opts: ["Allowed when done carefully.", "Hazardous and done only with great care.", "Prohibited.", "Encouraged on multi-lane roads."], ans: 2, page: 35 },
  { id: 42, q: "A red traffic signal light means that you must:", opts: ["Stop at the stop line.", "Stop before entering any crosswalk when there is no stop line.", "Stop before entering the intersection when there is no stop line or crosswalk.", "All of the above."], ans: 3, page: 39 },
  { id: 43, q: "A lighted red 'X' over a traffic lane means:", opts: ["That you may use that lane.", "That you may not use that lane.", "That the lane is for traffic coming toward you.", "Both 2 and 3 above."], ans: 3, page: 41 },
  { id: 44, q: "A yellow 'X' over the traffic lane means:", opts: ["That you must move out of that lane because it is going to be used for oncoming traffic.", "That you may use that lane.", "That the lane is for left turns only.", "That you may use the lane but with caution."], ans: 0, page: 42 },
  { id: 45, q: "A steady 'DON'T WALK' or upraised palm pedestrian signal means:", opts: ["Pedestrians must not enter the roadway toward the signal.", "Pedestrians already in the intersection may continue to the nearest sidewalk.", "Pedestrians must run to the nearest sidewalk.", "Both 1 and 2 above."], ans: 0, page: 42 },
  { id: 46, q: "Persons driving under the influence of intoxicating liquor are:", opts: ["Every driver's problem whether they drink or not.", "Only a problem to those who drink.", "Not a problem in Hawaii.", "A police enforcement problem only."], ans: 0, page: 55 },
  { id: 47, q: "Alcoholic beverages will affect you:", opts: ["More rapidly just after eating.", "More rapidly on an empty stomach.", "The same way at all times.", "Only if you have more than two drinks."], ans: 1, page: 55 },
  { id: 48, q: "After alcohol has entered your blood you can lessen its effect by:", opts: ["Taking a cold shower.", "Drinking black coffee.", "Both 1 and 2 above.", "There is nothing you can do to lessen the effect."], ans: 3, page: 55 },
  { id: 49, q: "A police officer stops you and tells you to take a blood alcohol test. You:", opts: ["Don't have to take the test if you can prove you weren't drinking.", "Must take the test or risk losing your driver's license.", "Don't have to take the test if you haven't violated any traffic rule.", "Don't have to do anything."], ans: 1, page: 56 },
  { id: 50, q: "You may drink alcoholic beverages in a vehicle on a public highway:", opts: ["As long as you don't drive.", "Only if you ride in the back seat.", "Only if you ride in the back of a pick-up truck.", "It is against the law to drink alcoholic beverages on a public highway."], ans: 3, page: 56 },
  { id: 51, q: "Defensive driving is a driving technique in which you:", opts: ["Identify dangerous driving situations and take action to avoid a crash.", "Defend against poor drivers by getting ahead of them in traffic.", "Defend yourself by following close to the vehicle ahead.", "Drive fast enough to stay ahead of traffic congestion."], ans: 0, page: 59 },
  { id: 52, q: "Information you need to drive safely is gained primarily by:", opts: ["Seeing.", "Talking to yourself.", "Following other traffic.", "Listening to the radio."], ans: 0, page: 59 },
  { id: 53, q: "Increasing your vehicle's speed:", opts: ["Increases your field of vision.", "Decreases your field of vision.", "Makes it easier to see cross traffic.", "Has no effect on your field of vision."], ans: 1, page: 59 },
  { id: 54, q: "Safety belts are life belts. They:", opts: ["Must be worn at all times when driving or riding in a vehicle.", "Should be worn only when driving at higher speeds.", "Should be worn loosely.", "Need to be worn only if riding in the front seat of the vehicle."], ans: 0, page: 61 },
  { id: 55, q: "When driving on a multi-lane highway and wishing to change lanes, you must signal your intentions:", opts: ["Immediately before changing lanes.", "Only when actually changing lanes.", "At least 50 feet before beginning to change lanes.", "At least 100 feet before beginning to change lanes."], ans: 3, page: 65 },
  { id: 56, q: "The proper following interval is:", opts: ["Close enough so no one will cut in front of you.", "At least 2 seconds behind the vehicle ahead.", "100 feet.", "75 feet."], ans: 1, page: 67 },
  { id: 57, q: "You are driving and it begins to rain. You should:", opts: ["Drive faster than other traffic.", "Drive at least the speed limit.", "Slow down and allow for weather conditions.", "Drive close behind the vehicle ahead."], ans: 2, page: 75 },
  { id: 58, q: "To prevent hydroplaning you should:", opts: ["Ensure that the tires on the vehicle have good tread depth.", "Ensure that the tires on the vehicle are inflated to the proper pressure.", "Reduce vehicle speed when driving in the rain.", "All of the above are correct."], ans: 3, page: 75 },
  { id: 59, q: "You are driving at night and another vehicle is approaching. Your head lamps:", opts: ["Should be on high beam.", "Should be on low beam.", "Should be off, use your parking lights.", "May be on either high or low beam."], ans: 1, page: 77 },
  { id: 60, q: "If you experience a tire blowout on your vehicle:", opts: ["Apply the brakes immediately.", "Grip the steering wheel firmly and steer to remain in your lane.", "Swerve sharply to the shoulder.", "Turn off the engine immediately."], ans: 1, page: 81 },
  { id: 61, q: "If your brakes fail completely, you should first:", opts: ["Pump the brake pedal quickly.", "Shift to a higher gear.", "Open the car door.", "Steer into oncoming traffic."], ans: 0, page: 81 },
  { id: 62, q: "If your wheels slip off the edge of the road, you should:", opts: ["Jerk the steering wheel to force the vehicle back onto the pavement.", "Continue to drive with the wheels off the pavement and reduce speed.", "Slam on the brakes immediately.", "Accelerate to bounce back onto the pavement."], ans: 1, page: 82 },
  { id: 63, q: "When towing a loaded trailer weighing more than half the towing vehicle's weight or 3,000+ pounds, the trailer must be equipped with:", opts: ["Brakes only.", "Breakaway protection only.", "Hub caps.", "Brakes and breakaway protection."], ans: 3, page: 87 },
  { id: 64, q: "When towing a trailer you must make sure that:", opts: ["The safety chain is securely attached to the trailer hitch.", "The safety chain is securely attached to the vehicle's bumper.", "The safety chain is securely attached to the frame of the towing vehicle.", "The trailer hitch is equipped with a fail-safe latch."], ans: 2, page: 87 },
  { id: 65, q: "About what percentage of the trailer weight should be on the vehicle's trailer hitch?", opts: ["5 to 10%.", "10 to 15%.", "15 to 20%.", "20 to 25%."], ans: 1, page: 88 },
  { id: 66, q: "Traffic crashes resulting in personal injury or property damage must be reported to the police:", opts: ["Within 24 hours.", "Immediately by the quickest means of communication.", "Within 72 hours.", "Only if the damage exceeds $5,000."], ans: 1, page: 52 },
  { id: 67, q: "You are involved in a crash and another person is injured. You should:", opts: ["Move the injured away from the scene immediately.", "Always leave the injured where they are.", "Do not move the injured unnecessarily, keep the injured warm and administer first aid.", "Stay away from the injured."], ans: 2, page: 52 },
  { id: 68, q: "You inadvertently drive into the side of an unattended parked vehicle and cannot locate the owner. You must:", opts: ["Have done as much as you can.", "Stay until the police arrive.", "Leave a written notice containing your name and address and circumstances of the crash.", "Go on your way."], ans: 2, page: 52 },
  { id: 69, q: "The minimum mandatory motor vehicle insurance liability coverage for bodily injury is:", opts: ["$10,000 per person, $20,000 per accident.", "$20,000 per person, $40,000 per accident.", "No minimum required.", "$15,000 per person, $30,000 per accident."], ans: 1, page: 54 },
  { id: 70, q: "When pedestrians are in a crosswalk, as a driver you must:", opts: ["Honk to warn them.", "Stop and let them cross.", "Slow down but maintain speed.", "Flash your lights."], ans: 1, page: 36 },
  { id: 71, q: "As a driver you should give a bicyclist:", opts: ["The same rights and privileges as motorists.", "Twice as much room as you think he needs.", "The right of way when you are crossing bike lanes.", "All of the above."], ans: 3, page: 97 },
  { id: 72, q: "Bicyclists are required to:", opts: ["Obey traffic signs, signals and other traffic laws.", "Ride on the sidewalk in business districts.", "Ride in the center of traffic lanes.", "All of the above."], ans: 0, page: 97 },
  { id: 73, q: "When passing a motorcycle you must:", opts: ["Give the motorcyclist the right-hand part of his traffic lane.", "Give the motorcyclist his entire traffic lane.", "Pull to the left just far enough to miss the motorcyclist.", "Not let the motorcyclist know you are going to pass."], ans: 1, page: 75 },
  { id: 74, q: "When driving behind a motorcycle, you should allow at least a following distance of:", opts: ["1 second.", "2 seconds.", "3 seconds.", "4 seconds."], ans: 1, page: 93 },
  { id: 75, q: "Hawaii law prohibits leaving a child unattended in a motor vehicle if the child is:", opts: ["Under age 9 for 5 minutes or longer.", "Under age 12 for any period of time.", "Under age 6 for 10 minutes or longer.", "Under age 9 for 10 minutes or longer."], ans: 0, page: 64 },
  { id: 76, q: "A roundabout is designed so that entering traffic must:", opts: ["Yield the right-of-way to circulating traffic.", "Have the right-of-way over circulating traffic.", "Stop completely before entering.", "Match the speed of circulating traffic before entering."], ans: 0, page: 65 },
  { id: 77, q: "When driving through a roundabout you must:", opts: ["Drive clockwise around the central island.", "Drive counterclockwise around the central island.", "Come to a full stop before exiting.", "Use your left turn signal to exit."], ans: 1, page: 65 },
  { id: 78, q: "Hazard warning signals (4-way flash) should be used:", opts: ["When driving through a tunnel.", "When driving a heavy truck up a hill.", "When performing emergency vehicle maintenance on the road shoulder.", "Both 2 and 3 above."], ans: 2, page: 73 },
  { id: 79, q: "When signaling a turn, traffic regulations require that you display the signal for at least:", opts: ["50 feet.", "75 feet.", "100 feet.", "25 feet."], ans: 2, page: 74 },
  { id: 80, q: "Who may park in an accessible parking space?", opts: ["Any vehicle transporting a disabled person.", "Any vehicle that displays a disabled parking placard.", "Any vehicle that displays a placard issued to the disabled person being transported.", "Any vehicle if no regular space is available."], ans: 2, page: 29 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function initUserData() {
  return { sessions: [], questionStats: {}, streak: 0, lastStudied: null, totalAttempts: 0, createdAt: Date.now() };
}

function getLeitnerInterval(box) {
  return [0, 1, 3, 7, 14, 30][Math.min(box, 5)];
}
function isDue(stat) {
  if (!stat) return true;
  return (Date.now() - (stat.lastSeen || 0)) / 86400000 >= getLeitnerInterval(stat.box || 0);
}

function computePredictor(sessions) {
  if (!sessions.length) return { current: null, trend: "none", projected: null };
  const recent = sessions.slice(-5).map(s => (s.correct / s.total) * 100);
  const current = recent[recent.length - 1];
  let trend = "stable";
  if (recent.length >= 2) {
    const half = Math.ceil(recent.length / 2);
    const f = recent.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const l = recent.slice(half).reduce((a, b) => a + b, 0) / (recent.length - half);
    if (l - f > 5) trend = "improving";
    else if (f - l > 5) trend = "declining";
  }
  let projected = recent.reduce((a, b) => a + b, 0) / recent.length;
  if (sessions.length >= 3) {
    const sc = sessions.map((s, i) => ({ x: i, y: (s.correct / s.total) * 100 }));
    const n = sc.length, sx = sc.reduce((a, b) => a + b.x, 0), sy = sc.reduce((a, b) => a + b.y, 0);
    const sxy = sc.reduce((a, b) => a + b.x * b.y, 0), sx2 = sc.reduce((a, b) => a + b.x * b.x, 0);
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    projected = Math.min(100, Math.max(0, sy / n + slope * 2));
  }
  return { current, trend, projected, sessions: sessions.length };
}

function selectQuestions(mode, stats, count = 10) {
  switch (mode) {
    case "random": return [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count);
    case "growth": return [...QUESTIONS].map(q => ({ q, acc: stats[q.id]?.attempts > 0 ? stats[q.id].correct / stats[q.id].attempts : 0.5 })).sort((a, b) => a.acc - b.acc).slice(0, count).map(x => x.q);
    case "easier": return [...QUESTIONS].map(q => ({ q, acc: stats[q.id]?.attempts > 0 ? stats[q.id].correct / stats[q.id].attempts : 0.5 })).sort((a, b) => b.acc - a.acc).slice(0, count).map(x => x.q);
    case "spaced": { const due = QUESTIONS.filter(q => isDue(stats[q.id])); return (due.length ? due : QUESTIONS).sort(() => Math.random() - 0.5).slice(0, count); }
    default: return QUESTIONS.slice(0, count);
  }
}

// ─── FIRESTORE SYNC ───────────────────────────────────────────────────────────
async function loadFromFirestore(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

async function saveToFirestore(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data);
  } catch (e) { console.error("Save error:", e); }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ocean: #0a2240; --ocean-mid: #0e3460; --ocean-light: #1a5276;
    --sand: #f5e6c8; --sand-light: #fdf6e9; --coral: #e8622a; --coral-light: #f08050;
    --palm: #2e7d32; --text: #1a1a1a; --muted: #6b7c93;
    --success: #27ae60; --danger: #c0392b; --warning: #f39c12;
    --radius: 12px; --shadow: 0 4px 24px rgba(10,34,64,0.18); --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Mono', monospace; background: var(--sand-light); color: var(--text); min-height: 100vh; }
  .app { max-width: 900px; margin: 0 auto; padding: 0 16px 200px; min-height: 100vh; }
  .header { background: var(--ocean); color: white; padding: 0 16px; position: sticky; top: 0; z-index: 100; border-bottom: 3px solid var(--coral); }
  .header-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .header-logo { font-family: 'DM Serif Display', serif; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
  .header-logo span { color: var(--coral); }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .header-streak { font-size: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 12px; color: var(--sand); }
  .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: rgba(245,230,200,0.7); border-radius: 6px; padding: 4px 10px; font-family: 'DM Mono', monospace; font-size: 0.7rem; cursor: pointer; transition: all var(--transition); }
  .signout-btn:hover { border-color: var(--coral); color: var(--coral); }
  .hero { background: var(--ocean); padding: 32px 0 0; margin-bottom: 32px; position: relative; overflow: hidden; }
  .hero-content { padding: 0 16px 40px; max-width: 900px; margin: 0 auto; position: relative; z-index: 2; }
  .hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 5vw, 2.8rem); color: var(--sand); line-height: 1.15; margin-bottom: 8px; }
  .hero h1 em { color: var(--coral); font-style: italic; }
  .hero p { color: rgba(245,230,200,0.7); font-size: 0.85rem; }
  .hero-wave { position: absolute; bottom: 0; left: 0; right: 0; height: 48px; overflow: hidden; }
  .hero-wave svg { width: 100%; height: 100%; display: block; }
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .stat-card { background: white; border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); border-left: 4px solid var(--ocean-light); transition: transform var(--transition); }
  .stat-card:hover { transform: translateY(-2px); }
  .stat-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: var(--ocean); }
  .stat-sub { font-size: 0.7rem; color: var(--muted); margin-top: 2px; }
  .predictor-card { background: var(--ocean); color: white; border-radius: var(--radius); padding: 20px 24px; margin-bottom: 28px; box-shadow: var(--shadow); }
  .predictor-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--sand); margin-bottom: 12px; }
  .predictor-bars { display: flex; gap: 16px; align-items: flex-end; margin-bottom: 12px; height: 80px; }
  .pred-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .pred-bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s ease; }
  .pred-bar-label { font-size: 0.65rem; color: rgba(245,230,200,0.6); }
  .pred-bar-val { font-size: 0.75rem; color: var(--sand); }
  .pred-trend { font-size: 0.75rem; color: rgba(245,230,200,0.7); display: flex; align-items: center; gap: 6px; }
  .mode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .mode-card { background: white; border-radius: var(--radius); padding: 20px 16px; cursor: pointer; border: 2px solid transparent; box-shadow: var(--shadow); transition: all var(--transition); text-align: center; }
  .mode-card:hover { border-color: var(--ocean-light); transform: translateY(-3px); }
  .mode-card.selected { border-color: var(--coral); background: var(--ocean); color: white; }
  .mode-card.selected .mode-desc { color: rgba(245,230,200,0.7); }
  .mode-icon { font-size: 1.8rem; margin-bottom: 8px; }
  .mode-name { font-family: 'DM Serif Display', serif; font-size: 1rem; margin-bottom: 4px; }
  .mode-desc { font-size: 0.72rem; color: var(--muted); line-height: 1.4; }
  .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .quiz-progress { display: flex; gap: 4px; flex-wrap: wrap; }
  .qp-dot { width: 10px; height: 10px; border-radius: 50%; background: #ddd; transition: background var(--transition); }
  .qp-dot.correct { background: var(--success); }
  .qp-dot.wrong { background: var(--danger); }
  .qp-dot.current { background: var(--coral); transform: scale(1.3); }
  .question-card { background: white; border-radius: var(--radius); padding: 28px 24px; box-shadow: var(--shadow); margin-bottom: 16px; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .question-num { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .question-text { font-family: 'DM Serif Display', serif; font-size: 1.15rem; line-height: 1.4; color: var(--ocean); margin-bottom: 20px; }
  .options { display: flex; flex-direction: column; gap: 10px; }
  .option-btn { background: white; border: 2px solid #d0c8b8; border-radius: 8px; padding: 14px 16px; text-align: left; font-family: 'DM Mono', monospace; font-size: 0.83rem; cursor: pointer; transition: all var(--transition); line-height: 1.4; display: flex; gap: 12px; align-items: flex-start; color: #1a1a1a; }
  .option-btn:hover:not(:disabled) { border-color: var(--ocean-light); background: var(--sand); color: #1a1a1a; }
  .option-btn.correct { background: #d4edda; border-color: var(--success); color: #155724; }
  .option-btn.wrong { background: #f8d7da; border-color: var(--danger); color: #721c24; }
  .option-btn:disabled { cursor: default; }
  .opt-letter { font-weight: 700; min-width: 22px; color: var(--ocean); }
  .option-btn.correct .opt-letter, .option-btn.wrong .opt-letter { color: inherit; }
  .feedback-bar { border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 0.82rem; display: flex; align-items: center; gap: 10px; animation: slideUp 0.2s ease; }
  .feedback-bar.correct { background: #d4edda; color: #155724; border-left: 4px solid var(--success); }
  .feedback-bar.wrong { background: #f8d7da; color: #721c24; border-left: 4px solid var(--danger); }
  .next-btn { background: var(--ocean); color: white; border: none; border-radius: 8px; padding: 12px 28px; font-family: 'DM Mono', monospace; font-size: 0.85rem; cursor: pointer; transition: background var(--transition); letter-spacing: 0.04em; }
  .next-btn:hover { background: var(--ocean-mid); }
  .results-card { background: white; border-radius: var(--radius); padding: 32px 24px; box-shadow: var(--shadow); text-align: center; animation: slideUp 0.4s ease; }
  .results-score { font-family: 'DM Serif Display', serif; font-size: 4rem; color: var(--ocean); line-height: 1; margin-bottom: 4px; }
  .results-pass { color: var(--success); font-size: 1.1rem; margin-bottom: 4px; }
  .results-fail { color: var(--danger); font-size: 1.1rem; margin-bottom: 4px; }
  .results-meta { color: var(--muted); font-size: 0.8rem; margin-bottom: 24px; }
  .results-breakdown { display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
  .res-stat { text-align: center; }
  .res-stat-val { font-family: 'DM Serif Display', serif; font-size: 1.6rem; }
  .res-stat-label { font-size: 0.7rem; color: var(--muted); }
  .res-correct { color: var(--success); }
  .res-wrong { color: var(--danger); }
  .perf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .perf-item { background: white; border-radius: 8px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(10,34,64,0.08); }
  .perf-q { font-size: 0.78rem; color: var(--ocean); margin-bottom: 8px; font-family: 'DM Serif Display', serif; line-height: 1.3; }
  .perf-bar-wrap { height: 6px; background: #eee; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
  .perf-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .perf-stats { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--muted); }
  .leitner-boxes { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .lbox { flex: 1; min-width: 80px; background: white; border-radius: 8px; padding: 12px 8px; text-align: center; box-shadow: 0 2px 8px rgba(10,34,64,0.08); border-top: 4px solid var(--ocean-light); }
  .lbox-num { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--ocean); }
  .lbox-label { font-size: 0.65rem; color: var(--muted); }
  .section-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: var(--ocean); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #e8dcc8; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 500; }
  .badge-pass { background: #d4edda; color: #155724; }
  .badge-fail { background: #f8d7da; color: #721c24; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--muted); }
  .empty-state .es-icon { font-size: 3rem; margin-bottom: 12px; }
  .empty-state p { font-size: 0.85rem; line-height: 1.6; }
  .start-quiz-section { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 120px; }
  .q-count-select { border: 2px solid #e8dcc8; border-radius: 8px; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 0.82rem; background: white; color: var(--ocean); cursor: pointer; outline: none; }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--ocean); display: flex; justify-content: space-around; align-items: center; height: 60px; border-top: 2px solid var(--coral); z-index: 0; }
  .bn-item { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; padding: 8px 16px; border-radius: 8px; transition: background var(--transition); color: rgba(245,230,200,0.5); font-size: 0.6rem; letter-spacing: 0.04em; text-transform: uppercase; }
  .bn-item:hover { background: rgba(255,255,255,0.08); }
  .bn-item.active { color: var(--sand); }
  .bn-item .bn-icon { font-size: 1.2rem; }
  .history-chart { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); margin-bottom: 20px; }
  .hc-title { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--ocean); margin-bottom: 16px; }
  .hc-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
  .hc-bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .hc-bar { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; }
  .hc-bar-num { font-size: 0.6rem; color: var(--muted); }

  /* AUTH STYLES */
  .auth-wrap { min-height: 100vh; background: var(--ocean); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .auth-card { background: white; border-radius: var(--radius); padding: 36px 32px; width: 100%; max-width: 420px; box-shadow: var(--shadow); }
  .auth-logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--ocean); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .auth-logo span { color: var(--coral); }
  .auth-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 28px; line-height: 1.5; }
  .auth-tabs { display: flex; gap: 4px; background: var(--sand-light); border-radius: 8px; padding: 4px; margin-bottom: 24px; }
  .auth-tab { flex: 1; text-align: center; padding: 8px; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 0.8rem; cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all var(--transition); }
  .auth-tab.active { background: white; color: var(--ocean); box-shadow: 0 2px 8px rgba(10,34,64,0.1); }
  .input-group { margin-bottom: 14px; }
  .input-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; display: block; }
  .input-field { width: 100%; border: 2px solid #e8dcc8; border-radius: 8px; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 0.85rem; outline: none; transition: border-color var(--transition); background: var(--sand-light); }
  .input-field:focus { border-color: var(--ocean-light); }
  .btn-primary { background: var(--ocean); color: white; border: none; border-radius: 8px; padding: 12px 24px; font-family: 'DM Mono', monospace; font-size: 0.85rem; cursor: pointer; width: 100%; transition: background var(--transition); letter-spacing: 0.04em; margin-bottom: 10px; }
  .btn-primary:hover { background: var(--ocean-mid); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-error { background: #f8d7da; color: #721c24; border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; margin-bottom: 14px; border-left: 3px solid var(--danger); }
  .sync-indicator { font-size: 0.7rem; color: rgba(245,230,200,0.6); display: flex; align-items: center; gap: 4px; }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
`;

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [authTab, setAuthTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (authTab === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Incorrect email or password.",
      };
      setError(msgs[e.code] || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">🌊 Hawaii <span>Permit Prep</span></div>
        <div className="auth-sub">Sign in to sync your progress across all your devices.</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${authTab === "signin" ? "active" : ""}`} onClick={() => { setAuthTab("signin"); setError(""); }}>Sign In</button>
          <button className={`auth-tab ${authTab === "signup" ? "active" : ""}`} onClick={() => { setAuthTab("signup"); setError(""); }}>Create Account</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn-primary" onClick={handle} disabled={loading || !email || !password}>
          {loading ? "Please wait..." : authTab === "signup" ? "Create Account" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [userData, setUserData] = useState(initUserData());
  const [syncing, setSyncing] = useState(false);
  const [quizState, setQuizState] = useState(null);
  const [selectedMode, setSelectedMode] = useState("random");
  const [quizCount, setQuizCount] = useState(10);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setSyncing(true);
        const data = await loadFromFirestore(u.uid);
        if (data) setUserData(data);
        setSyncing(false);
      }
      setAuthLoading(false);
    });
  }, []);

  // Auto-save to Firestore on data change
  useEffect(() => {
    if (user && !authLoading) {
      const timer = setTimeout(() => saveToFirestore(user.uid, userData), 1500);
      return () => clearTimeout(timer);
    }
  }, [userData, user, authLoading]);

  const updateStats = useCallback((results) => {
    setUserData(prev => {
      const newStats = { ...prev.questionStats };
      results.forEach(r => {
        const s = newStats[r.id] || { attempts: 0, correct: 0, box: 0, lastSeen: 0 };
        const ok = r.userAns === r.ans;
        newStats[r.id] = { attempts: s.attempts + 1, correct: s.correct + (ok ? 1 : 0), box: ok ? Math.min((s.box || 0) + 1, 5) : 0, lastSeen: Date.now() };
      });
      const correct = results.filter(r => r.userAns === r.ans).length;
      const newSession = { date: Date.now(), mode: selectedMode, total: results.length, correct, pct: Math.round((correct / results.length) * 100) };
      const today = new Date().toDateString();
      const lastDate = prev.lastStudied ? new Date(prev.lastStudied).toDateString() : null;
      const streak = lastDate === today ? prev.streak : (lastDate === new Date(Date.now() - 86400000).toDateString() ? prev.streak + 1 : 1);
      return { ...prev, questionStats: newStats, sessions: [...prev.sessions, newSession], totalAttempts: prev.totalAttempts + results.length, lastStudied: Date.now(), streak };
    });
  }, [selectedMode]);

  const startQuiz = () => {
    const questions = selectQuestions(selectedMode, userData.questionStats, quizCount);
    setQuizState({ questions, current: 0, answers: [], feedback: null, done: false });
    setTab("quiz");
  };

  const handleAnswer = (optIdx) => {
    if (quizState.feedback !== null) return;
    setQuizState(prev => ({ ...prev, feedback: { chosen: optIdx, correct: optIdx === prev.questions[prev.current].ans } }));
  };

  const handleNext = () => {
    const q = quizState.questions[quizState.current];
    const newAnswers = [...quizState.answers, { id: q.id, ans: q.ans, userAns: quizState.feedback.chosen }];
    if (quizState.current + 1 >= quizState.questions.length) {
      updateStats(newAnswers);
      setQuizState(prev => ({ ...prev, answers: newAnswers, done: true, feedback: null }));
    } else {
      setQuizState(prev => ({ ...prev, current: prev.current + 1, answers: newAnswers, feedback: null }));
    }
  };

  const predictor = computePredictor(userData.sessions);
  const avgScore = userData.sessions.length > 0 ? Math.round(userData.sessions.reduce((a, b) => a + b.pct, 0) / userData.sessions.length) : null;
  const leitnerCounts = [0, 1, 2, 3, 4, 5].map(box => Object.values(userData.questionStats).filter(s => (s.box || 0) === box).length);

  if (authLoading) return (
    <>
      <style>{css}</style>
      <div className="auth-wrap" style={{ flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "2rem" }}>🌊</div>
        <div style={{ color: "rgba(245,230,200,0.7)", fontSize: "0.85rem" }}>Loading...</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{css}</style>
      <AuthScreen />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ background: "var(--ocean)" }}>
        <div className="header">
          <div className="header-inner">
            <div className="header-logo">🌊 Hawaii <span>Permit Prep</span></div>
            <div className="header-right">
              <div className="sync-indicator">
                <div className="sync-dot" style={{ background: syncing ? "var(--warning)" : "var(--success)" }} />
                {syncing ? "Syncing..." : "Synced"}
              </div>
              <div className="header-streak">🔥 {userData.streak} day streak</div>
              <button className="signout-btn" onClick={() => signOut(auth)}>Sign out</button>
            </div>
          </div>
        </div>
        <div className="hero">
          <div className="hero-content">
            <h1>Study smart,<br />drive with <em>aloha.</em></h1>
            <p>Signed in as {user.email}</p>
          </div>
          <div className="hero-wave">
            <svg viewBox="0 0 1200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,48 L0,24 C150,8 300,40 450,28 C600,16 750,44 900,32 C1050,20 1150,36 1200,28 L1200,48 Z" fill="#fdf6e9" />
            </svg>
          </div>
        </div>
      </div>

      <div className="app">
        <div className="stats-row">
          {[
            { label: "Sessions", value: userData.sessions.length, sub: "total quizzes taken" },
            { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", sub: "across all sessions" },
            { label: "Questions", value: userData.totalAttempts, sub: "total attempts" },
            { label: "Mastered", value: leitnerCounts[4] + leitnerCounts[5], sub: `of ${QUESTIONS.length} questions` },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {userData.sessions.length > 0 && (
          <div className="predictor-card">
            <div className="predictor-title">📈 Passing Predictor</div>
            <div className="predictor-bars">
              {userData.sessions.slice(-5).map((s, i) => (
                <div className="pred-bar-wrap" key={i}>
                  <div className="pred-bar-val">{s.pct}%</div>
                  <div className="pred-bar" style={{ height: `${Math.round((s.pct / 100) * 70)}px`, background: s.pct >= 70 ? "var(--success)" : s.pct >= 50 ? "var(--warning)" : "var(--danger)" }} />
                  <div className="pred-bar-label">#{userData.sessions.length - Math.min(5, userData.sessions.length) + i + 1}</div>
                </div>
              ))}
              {predictor.projected !== null && (
                <div className="pred-bar-wrap">
                  <div className="pred-bar-val" style={{ color: "var(--coral)" }}>{Math.round(predictor.projected)}%</div>
                  <div className="pred-bar" style={{ height: `${Math.round((predictor.projected / 100) * 70)}px`, background: "rgba(232,98,42,0.5)", border: "2px dashed var(--coral)" }} />
                  <div className="pred-bar-label" style={{ color: "var(--coral)" }}>projected</div>
                </div>
              )}
            </div>
            <div className="pred-trend">
              {predictor.trend === "improving" && "📈 Score improving — keep it up!"}
              {predictor.trend === "declining" && "📉 Try Growth mode to target weak spots."}
              {predictor.trend === "stable" && "➡️ Stable — push harder with Growth mode."}
              {predictor.projected !== null && (
                <span style={{ marginLeft: "auto" }}>
                  <span className={`badge ${predictor.projected >= 70 ? "badge-pass" : "badge-fail"}`}>
                    {predictor.projected >= 70 ? "On track to pass" : "Needs improvement"}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* HOME */}
        {tab === "home" && (
          <>
            {userData.sessions.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">🌺</div>
                <p>Welcome! Head to <strong>Study</strong> to take your first quiz. Your stats and progress will appear here — and sync across all your devices automatically.</p>
              </div>
            ) : (
              <>
                <div className="section-title">Score History</div>
                <div className="history-chart">
                  <div className="hc-title">Score over time</div>
                  <div className="hc-bars">
                    {userData.sessions.slice(-15).map((s, i) => (
                      <div className="hc-bar-col" key={i}>
                        <div className="hc-bar" style={{ height: `${Math.round((s.pct / 100) * 90)}px`, background: s.pct >= 70 ? "var(--success)" : s.pct >= 50 ? "var(--warning)" : "var(--danger)" }} />
                        <div className="hc-bar-num">{s.pct}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 8, textAlign: "right" }}>70% = passing threshold</div>
                </div>
                <div className="section-title">Recent Sessions</div>
                {userData.sessions.slice(-5).reverse().map((s, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 8, padding: "12px 16px", boxShadow: "0 2px 8px rgba(10,34,64,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontFamily: "'DM Serif Display', serif", color: "var(--ocean)" }}>{s.correct}/{s.total} correct</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{["Random", "Growth", "Easier", "Spaced"][["random", "growth", "easier", "spaced"].indexOf(s.mode)] || s.mode} · {new Date(s.date).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${s.pct >= 70 ? "badge-pass" : "badge-fail"}`}>{s.pct}%</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* STUDY */}
        {tab === "study" && !quizState && (
          <>
            <div className="section-title">Choose Your Mode</div>
            <div className="mode-grid">
              {[
                { id: "random", icon: "🎲", name: "Random", desc: "Shuffled questions from the full pool. Great for general practice." },
                { id: "growth", icon: "💪", name: "Growth", desc: "Targets your hardest questions. Face your weak spots head-on." },
                { id: "easier", icon: "✅", name: "Easier", desc: "Focus on questions you already do well. Build your confidence." },
                { id: "spaced", icon: "🔁", name: "Spaced Repetition", desc: "Leitner-system scheduling. Questions at the right moment." },
              ].map(m => (
                <div key={m.id} className={`mode-card ${selectedMode === m.id ? "selected" : ""}`} onClick={() => setSelectedMode(m.id)}>
                  <div className="mode-icon">{m.icon}</div>
                  <div className="mode-name">{m.name}</div>
                  <div className="mode-desc">{m.desc}</div>
                </div>
              ))}
            </div>
            {selectedMode === "spaced" && (
              <>
                <div className="section-title">Leitner Boxes</div>
                <div className="leitner-boxes">
                  {["New", "Day 1", "Day 3", "Day 7", "Day 14", "Day 30"].map((label, i) => (
                    <div className="lbox" key={i} style={{ borderTopColor: i === 0 ? "#aaa" : i <= 2 ? "var(--warning)" : "var(--success)" }}>
                      <div className="lbox-num">{leitnerCounts[i] || 0}</div>
                      <div className="lbox-label">{label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="start-quiz-section">
              <select className="q-count-select" value={quizCount} onChange={e => setQuizCount(Number(e.target.value))}>
                {[5, 10, 15, 20, 25, 40].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
              <button className="next-btn" onClick={startQuiz}>Start Quiz →</button>
            </div>
          </>
        )}

        {/* QUIZ ACTIVE */}
        {tab === "quiz" && quizState && !quizState.done && (() => {
          const q = quizState.questions[quizState.current];
          const fb = quizState.feedback;
          return (
            <>
              <div className="quiz-header">
                <div className="quiz-progress">
                  {quizState.questions.map((_, i) => (
                    <div key={i} className={`qp-dot ${i < quizState.current ? (quizState.answers[i]?.userAns === quizState.answers[i]?.ans ? "correct" : "wrong") : i === quizState.current ? "current" : ""}`} />
                  ))}
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{quizState.current + 1} / {quizState.questions.length}</span>
              </div>
              <div className="question-card">
                <div className="question-num">Question {quizState.current + 1} · Manual p.{q.page}</div>
                <div className="question-text">{q.q}</div>
                <div className="options">
                  {q.opts.map((opt, i) => {
                    let cls = "";
                    if (fb !== null) { if (i === q.ans) cls = "correct"; else if (i === fb.chosen) cls = "wrong"; }
                    return (
                      <button key={i} className={`option-btn ${cls}`} onClick={() => handleAnswer(i)} disabled={fb !== null}>
                        <span className="opt-letter">{String.fromCharCode(65 + i)}.</span>{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              {fb && (
                <>
                  <div className={`feedback-bar ${fb.correct ? "correct" : "wrong"}`}>
                    {fb.correct ? "✅ Correct!" : "❌ Incorrect — the correct answer is highlighted."}
                  </div>
                  <button className="next-btn" onClick={handleNext}>
                    {quizState.current + 1 < quizState.questions.length ? "Next Question →" : "See Results →"}
                  </button>
                </>
              )}
            </>
          );
        })()}

        {/* RESULTS */}
        {tab === "quiz" && quizState?.done && (() => {
          const correct = quizState.answers.filter(a => a.userAns === a.ans).length;
          const pct = Math.round((correct / quizState.answers.length) * 100);
          return (
            <div className="results-card">
              <div className="results-score">{pct}%</div>
              <div className={pct >= 70 ? "results-pass" : "results-fail"}>{pct >= 70 ? "🌺 Great job — you'd pass!" : "Keep studying — you'll get there!"}</div>
              <div className="results-meta">{correct} of {quizState.answers.length} correct</div>
              <div className="results-breakdown">
                <div className="res-stat"><div className="res-stat-val res-correct">{correct}</div><div className="res-stat-label">Correct</div></div>
                <div className="res-stat"><div className="res-stat-val res-wrong">{quizState.answers.length - correct}</div><div className="res-stat-label">Incorrect</div></div>
              </div>
              {quizState.answers.filter(a => a.userAns !== a.ans).length > 0 && (
                <div style={{ textAlign: "left", marginTop: 16 }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.95rem", color: "var(--ocean)", marginBottom: 10 }}>Review missed questions:</div>
                  {quizState.answers.filter(a => a.userAns !== a.ans).map((a, i) => {
                    const q = QUESTIONS.find(q => q.id === a.id);
                    return (
                      <div key={i} style={{ background: "#f8d7da", borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: "0.8rem" }}>
                        <strong style={{ color: "#721c24" }}>{q.q}</strong>
                        <div style={{ marginTop: 4, color: "#155724" }}>✅ {q.opts[q.ans]}</div>
                        <div style={{ color: "#721c24" }}>❌ You chose: {q.opts[a.userAns]}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 20, marginBottom: 120, flexWrap: "wrap" }}>
                <button className="next-btn" onClick={startQuiz}>Try Again</button>
                <button className="next-btn" style={{ background: "var(--palm)" }} onClick={() => { setQuizState(null); setTab("study"); }}>Change Mode</button>
                <button className="next-btn" style={{ background: "var(--coral)" }} onClick={() => { setQuizState(null); setTab("home"); }}>Home</button>
              </div>
            </div>
          );
        })()}

        {/* PERFORMANCE */}
        {tab === "performance" && (
          <>
            <div className="section-title">Question Performance</div>
            {Object.keys(userData.questionStats).length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📊</div>
                <p>Complete at least one quiz to see your question-by-question stats.</p>
              </div>
            ) : (
              <>
                <div className="section-title">Leitner Boxes</div>
                <div className="leitner-boxes" style={{ marginBottom: 24 }}>
                  {["New", "Day 1", "Day 3", "Day 7", "Day 14", "Day 30"].map((label, i) => (
                    <div className="lbox" key={i} style={{ borderTopColor: i === 0 ? "#aaa" : i <= 2 ? "var(--warning)" : "var(--success)" }}>
                      <div className="lbox-num">{leitnerCounts[i] || 0}</div>
                      <div className="lbox-label">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="section-title">All Questions</div>
                <div className="perf-grid">
                  {QUESTIONS.map(q => {
                    const s = userData.questionStats[q.id];
                    if (!s) return null;
                    const acc = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
                    return (
                      <div className="perf-item" key={q.id}>
                        <div className="perf-q">{q.q.length > 70 ? q.q.slice(0, 70) + "…" : q.q}</div>
                        <div className="perf-bar-wrap">
                          <div className="perf-bar-fill" style={{ width: `${acc}%`, background: acc >= 70 ? "var(--success)" : acc >= 50 ? "var(--warning)" : "var(--danger)" }} />
                        </div>
                        <div className="perf-stats"><span>{s.correct}/{s.attempts} correct</span><span>{acc}% · Box {s.box || 0}</span></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="bottom-nav">
        {[{ id: "home", icon: "🏠", label: "Home" }, { id: "study", icon: "📖", label: "Study" }, { id: "performance", icon: "📊", label: "Stats" }].map(t => (
          <div key={t.id} className={`bn-item ${tab === t.id || (t.id === "study" && tab === "quiz") ? "active" : ""}`} onClick={() => { if (t.id !== "quiz") { setTab(t.id); } }}>
            <span className="bn-icon">{t.icon}</span>{t.label}
          </div>
        ))}
      </div>
    </>
  );
}