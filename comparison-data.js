const comparisonTasks = [
  {
    "id": "pick-place",
    "title": "Stick Pick-and-Place",
    "duration": 24.56,
    "phases": [
      {
        "title": "Grasp and placement",
        "failure": "An unstable grasp or inaccurate placement leaves the stick outside the target.",
        "success": "Maintains a stable grasp and places the stick upright on the target.",
        "available": true,
        "start": 0,
        "duration": 24.56,
        "failureDuration": 22.76,
        "successDuration": 17
      }
    ]
  },
  {
    "id": "single-peg",
    "title": "Single-Arm Peg Insertion",
    "duration": 102.12,
    "phases": [
      {
        "title": "Alignment and insertion",
        "failure": "Misalignment and repeated hesitation can cause a timeout or move the policy into out-of-distribution (OOD) states.",
        "success": "Aligns the peg, completes insertion, and releases it after seating.",
        "available": true,
        "start": 0,
        "duration": 102.12,
        "failureDuration": 100.32,
        "successDuration": 11.8
      }
    ]
  },
  {
    "id": "dual-peg",
    "title": "Dual-Arm Peg Insertion",
    "duration": 32.2,
    "phases": [
      {
        "title": "Coordinated insertion",
        "failure": "Premature gripper release prevents insertion; repeated attempts can also lead to out-of-distribution (OOD) states.",
        "success": "Coordinates both arms to complete insertion without releasing the peg prematurely.",
        "available": true,
        "start": 0,
        "duration": 32.2,
        "failureDuration": 30.4,
        "successDuration": 21.6
      }
    ]
  },
  {
    "id": "clean-desk",
    "title": "Bimanual Table Clearing",
    "duration": 24.6,
    "phases": [
      {
        "title": "Second-bowl grasp",
        "failure": "The gripper misses the bowl, especially the second bowl near the edge of the reachable workspace, where the SFT policy struggles to secure a grasp.",
        "success": "Reaches the second bowl and secures it before lifting.",
        "available": true,
        "start": 0,
        "duration": 12.8,
        "failureDuration": 8.04,
        "successDuration": 11
      },
      {
        "title": "Bowl handoff",
        "failure": "The receiving gripper fails to secure the bowl during the handoff, causing it to drop.",
        "success": "Transfers the bowl securely between grippers before moving toward the basket.",
        "available": true,
        "start": 12.8,
        "duration": 11.8,
        "failureDuration": 9.6,
        "successDuration": 10
      }
    ]
  },
  {
    "id": "drawer",
    "title": "Toy Stowing in a Drawer",
    "duration": 30.44,
    "phases": [
      {
        "title": "Toy placement",
        "failure": "The toy misses the drawer opening and lands on top of the drawer.",
        "success": "Places the toy inside the open drawer.",
        "available": true,
        "start": 0,
        "duration": 17.64,
        "failureDuration": 15.836009,
        "successDuration": 10
      },
      {
        "title": "Drawer closure",
        "failure": "The drawer remains partly open after the closing motion.",
        "success": "Pushes the drawer fully closed.",
        "available": true,
        "start": 17.64,
        "duration": 12.8,
        "failureDuration": 6.04,
        "successDuration": 11
      }
    ]
  },
  {
    "id": "bagging",
    "title": "Grocery Bagging",
    "duration": 28.08,
    "phases": [
      {
        "title": "Grasping the chips",
        "failure": "An inaccurate grasp on the chips container leads to an unstable pickup or loss of the object.",
        "success": "Secures the chips container and lifts it toward the bag.",
        "available": true,
        "start": 0,
        "duration": 28.08,
        "failureDuration": 26.28,
        "successDuration": 10
      },
      {
        "title": "Placing the chips",
        "available": false,
        "failure": "The chips container presses against the bag rim during placement and fails to enter the bag."
      },
      {
        "title": "Placing the biscuits",
        "available": false,
        "failure": "The biscuits press against the bag rim during placement and fail to enter the bag."
      }
    ]
  }
];
